"""
Audit Trail Logging Service.

Provides immutable, append-oriented audit logging for governance events, recommendations,
and cross-walk mapping activations.

SAFETY RULE:
Strictly excludes Layer 1 sensitive purchase order pricing, supplier identities,
and internal warehouse bin locations from audit payloads.
"""

import uuid
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.governance import AuditLog


# Disallowed sensitive keys from Layer 1
SENSITIVE_COMMERCIAL_KEYS = {
    "unit_price",
    "total_price",
    "po_number",
    "purchase_order",
    "vendor_name",
    "vendor_code",
    "supplier_id",
    "supplier_name",
    "store_location",
    "bin_location",
    "contract_number",
    "contract_value",
    "invoice_number",
}


def sanitize_audit_payload(payload: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Sanitizes dictionary payloads by stripping any confidential Layer 1 commercial data.
    """
    if not payload:
        return None
    cleaned = {}
    for k, v in payload.items():
        if k.lower() in SENSITIVE_COMMERCIAL_KEYS:
            continue
        if isinstance(v, dict):
            cleaned[k] = sanitize_audit_payload(v)
        else:
            cleaned[k] = v
    return cleaned


async def record_audit_log(
    session: AsyncSession,
    entity_type: str,
    entity_id: str,
    action: str,
    actor_reference: str,
    previous_state: Optional[Dict[str, Any]] = None,
    new_state: Optional[Dict[str, Any]] = None,
    metadata_payload: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    """
    Appends an immutable audit log entry into `audit_logs`.
    """
    sanitized_prev = sanitize_audit_payload(previous_state)
    sanitized_new = sanitize_audit_payload(new_state)
    sanitized_meta = sanitize_audit_payload(metadata_payload)

    log_entry = AuditLog(
        id=uuid.uuid4(),
        entity_type=entity_type,
        entity_id=str(entity_id),
        action=action,
        previous_state=sanitized_prev,
        new_state=sanitized_new,
        actor_reference=actor_reference,
        ip_address=ip_address,
        metadata_payload=sanitized_meta
    )
    session.add(log_entry)
    await session.flush()
    return log_entry
