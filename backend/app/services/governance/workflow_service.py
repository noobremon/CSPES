"""
Human Governance Workflow Service.

Manages human-in-the-loop review actions (APPROVE, REJECT, MODIFY) for CNMC candidate proposals.

CRITICAL GOVERNANCE BOUNDARIES:
- System NEVER automatically approves CNMC candidates.
- System NEVER merges raw ERP records or overwrites CPSE material codes.
- System preserves original AI/System recommendation when modified by human reviewer.
- All approvals carry the explicit SIH MVP demonstration governance disclaimer.
"""

import uuid
import json
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_

from app.models.cnmc import CNMCCandidate, CNMCMaster, CPSECNMCMapping
from app.models.governance import GovernanceReview
from app.models.material import NormalizedMaterial, RawMaterial
from app.services.governance.audit_service import record_audit_log


GOVERNANCE_DISCLAIMER = (
    "Approved within the SIH MVP demonstration governance workflow. "
    "Does not constitute Government of India, DPE, or statutory national policy approval."
)


class GovernanceAction(str):
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    MODIFY = "MODIFY"


class GovernanceWorkflowService:
    """
    Handles candidate reviews, state transitions, master catalog updates,
    cross-walk mapping activations, and immutable governance records.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def review_candidate(
        self,
        candidate_id: uuid.UUID,
        action: str,
        reviewer_reference: str,
        comments: Optional[str] = None,
        modified_cnmc: Optional[str] = None,
        modified_group_name: Optional[str] = None,
        modified_description: Optional[str] = None,
        modified_taxonomy_id: Optional[uuid.UUID] = None,
        material_id_to_map: Optional[uuid.UUID] = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes a human governance review action on a CNMC candidate.
        """
        cand = await self.db.get(CNMCCandidate, candidate_id)
        if not cand:
            raise ValueError(f"CNMCCandidate with ID {candidate_id} not found.")

        if cand.status not in ("PENDING_REVIEW", "REQUIRES_DOMAIN_REVIEW"):
            raise ValueError(
                f"Candidate {candidate_id} cannot be reviewed because it is already in status '{cand.status}'."
            )

        act = action.upper().strip()
        if act not in (GovernanceAction.APPROVE, GovernanceAction.REJECT, GovernanceAction.MODIFY):
            raise ValueError(f"Invalid governance action '{action}'. Must be APPROVE, REJECT, or MODIFY.")

        # Mandatory comment checks
        if act in (GovernanceAction.REJECT, GovernanceAction.MODIFY):
            if not comments or len(comments.strip()) < 5:
                raise ValueError(f"Mandatory justification comment is required for action '{act}'.")

        previous_status = cand.status
        created_mapping_id = None
        created_master_id = None

        if act == GovernanceAction.APPROVE:
            result = await self._handle_approve(
                cand=cand,
                reviewer_reference=reviewer_reference,
                comments=comments,
                material_id_to_map=material_id_to_map,
                ip_address=ip_address
            )
            created_master_id = result.get("master_id")
            created_mapping_id = result.get("mapping_id")

        elif act == GovernanceAction.REJECT:
            result = await self._handle_reject(
                cand=cand,
                reviewer_reference=reviewer_reference,
                comments=comments,
                ip_address=ip_address
            )

        elif act == GovernanceAction.MODIFY:
            result = await self._handle_modify(
                cand=cand,
                reviewer_reference=reviewer_reference,
                comments=comments,
                modified_cnmc=modified_cnmc,
                modified_group_name=modified_group_name,
                modified_description=modified_description,
                modified_taxonomy_id=modified_taxonomy_id,
                material_id_to_map=material_id_to_map,
                ip_address=ip_address
            )
            created_master_id = result.get("master_id")
            created_mapping_id = result.get("mapping_id")

        return {
            "candidate_id": str(cand.id),
            "decision": act,
            "previous_status": previous_status,
            "new_status": cand.status,
            "reviewer_reference": reviewer_reference,
            "comments": comments,
            "master_id": str(created_master_id) if created_master_id else None,
            "mapping_id": str(created_mapping_id) if created_mapping_id else None,
            "governance_notice": GOVERNANCE_DISCLAIMER
        }

    async def _handle_approve(
        self,
        cand: CNMCCandidate,
        reviewer_reference: str,
        comments: Optional[str],
        material_id_to_map: Optional[uuid.UUID],
        ip_address: Optional[str]
    ) -> Dict[str, Any]:
        """
        Approves candidate: creates/updates CNMCMaster and creates CPSECNMCMapping if material specified.
        """
        previous_state = {
            "status": cand.status,
            "proposed_cnmc": cand.proposed_cnmc
        }
        cand.status = "APPROVED"
        await self.db.flush()

        # Create or update CNMCMaster record
        master = await self._ensure_cnmc_master(
            cnmc_code=cand.proposed_cnmc,
            canonical_name=cand.candidate_group_name,
            standard_description=cand.proposed_description,
            taxonomy_id=cand.taxonomy_id,
            reviewer_reference=reviewer_reference,
            approval_comments=comments
        )

        mapping_id = None
        if material_id_to_map:
            mapping = await self._create_cpse_mapping(
                material_id=material_id_to_map,
                cnmc_master_id=master.id,
                reviewer_reference=reviewer_reference,
                mapping_type="DIRECT_MATCH"
            )
            mapping_id = mapping.id

        # Record GovernanceReview
        review = GovernanceReview(
            id=uuid.uuid4(),
            entity_type="CNMC_CANDIDATE",
            entity_id=cand.id,
            reviewer_reference=reviewer_reference,
            decision="APPROVED",
            comments=comments or "Approved as recommended.",
            previous_status="PENDING_REVIEW",
            new_status="APPROVED"
        )
        self.db.add(review)
        await self.db.flush()

        # Audit Log
        await record_audit_log(
            session=self.db,
            entity_type="CNMC_CANDIDATE",
            entity_id=str(cand.id),
            action="CNMC_REVIEW_APPROVED",
            actor_reference=reviewer_reference,
            previous_state=previous_state,
            new_state={"status": "APPROVED", "cnmc_master_id": str(master.id)},
            metadata_payload={
                "decision": "APPROVED",
                "comments": comments,
                "governance_boundary": GOVERNANCE_DISCLAIMER
            },
            ip_address=ip_address
        )

        return {"master_id": master.id, "mapping_id": mapping_id}

    async def _handle_reject(
        self,
        cand: CNMCCandidate,
        reviewer_reference: str,
        comments: str,
        ip_address: Optional[str]
    ) -> Dict[str, Any]:
        """
        Rejects candidate: sets status to REJECTED with mandatory reason.
        Does NOT create master or mappings.
        """
        previous_state = {
            "status": cand.status,
            "proposed_cnmc": cand.proposed_cnmc
        }
        cand.status = "REJECTED"
        await self.db.flush()

        # Record GovernanceReview
        review = GovernanceReview(
            id=uuid.uuid4(),
            entity_type="CNMC_CANDIDATE",
            entity_id=cand.id,
            reviewer_reference=reviewer_reference,
            decision="REJECTED",
            comments=comments,
            previous_status="PENDING_REVIEW",
            new_status="REJECTED"
        )
        self.db.add(review)
        await self.db.flush()

        # Audit Log
        await record_audit_log(
            session=self.db,
            entity_type="CNMC_CANDIDATE",
            entity_id=str(cand.id),
            action="CNMC_REVIEW_REJECTED",
            actor_reference=reviewer_reference,
            previous_state=previous_state,
            new_state={"status": "REJECTED"},
            metadata_payload={
                "decision": "REJECTED",
                "rejection_reason": comments,
                "governance_boundary": GOVERNANCE_DISCLAIMER
            },
            ip_address=ip_address
        )

        return {}

    async def _handle_modify(
        self,
        cand: CNMCCandidate,
        reviewer_reference: str,
        comments: str,
        modified_cnmc: Optional[str],
        modified_group_name: Optional[str],
        modified_description: Optional[str],
        modified_taxonomy_id: Optional[uuid.UUID],
        material_id_to_map: Optional[uuid.UUID],
        ip_address: Optional[str]
    ) -> Dict[str, Any]:
        """
        Modifies candidate: preserves original recommendation while applying human reviewer overrides.
        """
        original_recommendation = {
            "proposed_cnmc": cand.proposed_cnmc,
            "candidate_group_name": cand.candidate_group_name,
            "proposed_description": cand.proposed_description,
            "taxonomy_id": str(cand.taxonomy_id) if cand.taxonomy_id else None,
            "status": cand.status
        }

        # Apply human overrides
        final_cnmc = modified_cnmc.strip() if modified_cnmc else cand.proposed_cnmc
        final_name = modified_group_name.strip() if modified_group_name else cand.candidate_group_name
        final_desc = modified_description.strip() if modified_description else cand.proposed_description
        final_tax_id = modified_taxonomy_id if modified_taxonomy_id is not None else cand.taxonomy_id

        cand.proposed_cnmc = final_cnmc
        cand.candidate_group_name = final_name
        cand.proposed_description = final_desc
        cand.taxonomy_id = final_tax_id
        cand.status = "MODIFIED"
        await self.db.flush()

        # Store original recommendation and modification history in CNMCMaster governance_metadata
        master = await self._ensure_cnmc_master(
            cnmc_code=final_cnmc,
            canonical_name=final_name,
            standard_description=final_desc,
            taxonomy_id=final_tax_id,
            reviewer_reference=reviewer_reference,
            approval_comments=comments,
            original_recommendation=original_recommendation
        )

        mapping_id = None
        if material_id_to_map:
            mapping = await self._create_cpse_mapping(
                material_id=material_id_to_map,
                cnmc_master_id=master.id,
                reviewer_reference=reviewer_reference,
                mapping_type="MANUAL_MAPPING"
            )
            mapping_id = mapping.id

        # Record GovernanceReview
        review = GovernanceReview(
            id=uuid.uuid4(),
            entity_type="CNMC_CANDIDATE",
            entity_id=cand.id,
            reviewer_reference=reviewer_reference,
            decision="MODIFIED",
            comments=comments,
            previous_status="PENDING_REVIEW",
            new_status="MODIFIED"
        )
        self.db.add(review)
        await self.db.flush()

        # Audit Log
        await record_audit_log(
            session=self.db,
            entity_type="CNMC_CANDIDATE",
            entity_id=str(cand.id),
            action="CNMC_REVIEW_MODIFIED",
            actor_reference=reviewer_reference,
            previous_state=original_recommendation,
            new_state={
                "status": "MODIFIED",
                "final_cnmc": final_cnmc,
                "final_canonical_name": final_name,
                "cnmc_master_id": str(master.id)
            },
            metadata_payload={
                "decision": "MODIFIED",
                "modification_reason": comments,
                "original_ai_recommendation": original_recommendation,
                "governance_boundary": GOVERNANCE_DISCLAIMER
            },
            ip_address=ip_address
        )

        return {"master_id": master.id, "mapping_id": mapping_id}

    async def _ensure_cnmc_master(
        self,
        cnmc_code: str,
        canonical_name: str,
        standard_description: str,
        taxonomy_id: Optional[uuid.UUID],
        reviewer_reference: str,
        approval_comments: Optional[str] = None,
        original_recommendation: Optional[Dict[str, Any]] = None
    ) -> CNMCMaster:
        """
        Creates or updates a CNMCMaster record.
        """
        stmt = select(CNMCMaster).where(CNMCMaster.cnmc_code == cnmc_code)
        res = await self.db.execute(stmt)
        master = res.scalars().first()

        gov_meta = {
            "approved_by": reviewer_reference,
            "approval_comments": approval_comments,
            "governance_boundary": GOVERNANCE_DISCLAIMER,
            "workflow_version": "MVP_PHASE_8_V1",
        }
        if original_recommendation:
            gov_meta["original_recommendation_history"] = original_recommendation

        if not master:
            master = CNMCMaster(
                id=uuid.uuid4(),
                cnmc_code=cnmc_code,
                canonical_name=canonical_name,
                standard_description=standard_description,
                taxonomy_id=taxonomy_id,
                spec_template={"canonical_name": canonical_name},
                status="ACTIVE",
                governance_metadata=gov_meta
            )
            self.db.add(master)
        else:
            master.canonical_name = canonical_name
            master.standard_description = standard_description
            master.taxonomy_id = taxonomy_id
            master.status = "ACTIVE"
            master.governance_metadata = gov_meta

        await self.db.flush()
        return master

    async def _create_cpse_mapping(
        self,
        material_id: uuid.UUID,
        cnmc_master_id: uuid.UUID,
        reviewer_reference: str,
        mapping_type: str = "DIRECT_MATCH"
    ) -> CPSECNMCMapping:
        """
        Binds a CPSE normalized and raw material to an approved CNMC master record,
        preserving the legacy CPSE local_material_code without modification.
        """
        norm_mat = await self.db.get(NormalizedMaterial, material_id)
        if not norm_mat:
            raise ValueError(f"NormalizedMaterial {material_id} not found.")

        raw_mat = await self.db.get(RawMaterial, norm_mat.raw_material_id)
        if not raw_mat:
            raise ValueError(f"RawMaterial {norm_mat.raw_material_id} not found.")

        # Check if an existing mapping already exists for this material
        stmt = select(CPSECNMCMapping).where(
            CPSECNMCMapping.normalized_material_id == material_id
        )
        res = await self.db.execute(stmt)
        existing_mapping = res.scalars().first()

        if existing_mapping:
            existing_mapping.cnmc_id = cnmc_master_id
            existing_mapping.status = "ACTIVE"
            existing_mapping.mapping_type = mapping_type
            existing_mapping.approved_by = reviewer_reference
            await self.db.flush()

            await record_audit_log(
                session=self.db,
                entity_type="CPSE_MAPPING",
                entity_id=str(existing_mapping.id),
                action="CNMC_MAPPING_UPDATED",
                actor_reference=reviewer_reference,
                previous_state={"cnmc_id": str(existing_mapping.cnmc_id)},
                new_state={"cnmc_id": str(cnmc_master_id), "status": "ACTIVE"},
                metadata_payload={
                    "legacy_material_code": raw_mat.material_code,
                    "organization_id": str(norm_mat.organization_id)
                }
            )
            return existing_mapping

        mapping = CPSECNMCMapping(
            id=uuid.uuid4(),
            raw_material_id=raw_mat.id,
            normalized_material_id=norm_mat.id,
            organization_id=norm_mat.organization_id,
            local_material_code=raw_mat.material_code,  # Preserves CPSE original code
            cnmc_id=cnmc_master_id,
            mapping_type=mapping_type,
            confidence_score=1.0,
            status="ACTIVE",
            approved_by=reviewer_reference
        )
        self.db.add(mapping)
        await self.db.flush()

        # Audit Log
        await record_audit_log(
            session=self.db,
            entity_type="CPSE_MAPPING",
            entity_id=str(mapping.id),
            action="CNMC_MAPPING_CREATED",
            actor_reference=reviewer_reference,
            previous_state=None,
            new_state={
                "mapping_id": str(mapping.id),
                "local_material_code": raw_mat.material_code,
                "cnmc_id": str(cnmc_master_id),
                "status": "ACTIVE"
            },
            metadata_payload={
                "legacy_material_code": raw_mat.material_code,
                "organization_id": str(norm_mat.organization_id),
                "governance_boundary": GOVERNANCE_DISCLAIMER
            }
        )

        return mapping
