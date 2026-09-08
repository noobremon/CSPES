"""core_domain_schema

Revision ID: 0002_core_domain_schema
Revises: 0001_initial_health
Create Date: 2026-09-08 01:25:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision: str = '0002_core_domain_schema'
down_revision: Union[str, None] = '0001_initial_health'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Organizations (CPSEs)
    op.create_table(
        'organizations',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('sector', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code', name='uq_organizations_code')
    )
    op.create_index('ix_organizations_code', 'organizations', ['code'])

    # 2. Source Systems
    op.create_table(
        'source_systems',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('system_type', sa.String(length=50), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_source_systems_organization_id', 'source_systems', ['organization_id'])

    # 3. Material Taxonomies
    op.create_table(
        'material_taxonomies',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('code', sa.String(length=100), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('parent_id', sa.Uuid(), nullable=True),
        sa.Column('level', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('path', sa.String(length=500), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['parent_id'], ['material_taxonomies.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code', name='uq_material_taxonomies_code')
    )
    op.create_index('ix_material_taxonomies_code', 'material_taxonomies', ['code'])
    op.create_index('ix_material_taxonomies_parent_id', 'material_taxonomies', ['parent_id'])

    # 4. Raw Materials (Layer 1: Private Operational)
    op.create_table(
        'raw_materials',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('source_system_id', sa.Uuid(), nullable=True),
        sa.Column('material_code', sa.String(length=100), nullable=False),
        sa.Column('material_description', sa.Text(), nullable=False),
        sa.Column('specification_text', sa.Text(), nullable=True),
        sa.Column('uom', sa.String(length=50), nullable=False),
        sa.Column('category_code', sa.String(length=100), nullable=True),
        sa.Column('manufacturer_reference', sa.String(length=255), nullable=True),
        sa.Column('source_payload', sa.JSON(), nullable=True),
        sa.Column('import_batch_id', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='IMPORTED'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['source_system_id'], ['source_systems.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('organization_id', 'material_code', name='uq_raw_org_material_code')
    )
    op.create_index('ix_raw_materials_organization_id', 'raw_materials', ['organization_id'])
    op.create_index('ix_raw_materials_material_code', 'raw_materials', ['material_code'])
    op.create_index('ix_raw_materials_import_batch_id', 'raw_materials', ['import_batch_id'])

    # 5. Normalized Materials (Layer 2: Sanitized Intelligence)
    op.create_table(
        'normalized_materials',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('raw_material_id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('canonical_description', sa.Text(), nullable=False),
        sa.Column('normalized_manufacturer', sa.String(length=255), nullable=True),
        sa.Column('normalized_part_number', sa.String(length=255), nullable=True),
        sa.Column('normalized_uom', sa.String(length=50), nullable=False),
        sa.Column('taxonomy_id', sa.Uuid(), nullable=True),
        sa.Column('engineering_term', sa.String(length=255), nullable=True),
        sa.Column('standard_code', sa.String(length=100), nullable=True),
        sa.Column('material_grade', sa.String(length=100), nullable=True),
        sa.Column('normalization_status', sa.String(length=50), nullable=False, server_default='NORMALIZED'),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['raw_material_id'], ['raw_materials.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['taxonomy_id'], ['material_taxonomies.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('raw_material_id', name='uq_normalized_raw_material')
    )
    op.create_index('ix_normalized_materials_raw_material_id', 'normalized_materials', ['raw_material_id'])
    op.create_index('ix_normalized_materials_organization_id', 'normalized_materials', ['organization_id'])
    op.create_index('ix_normalized_materials_taxonomy_id', 'normalized_materials', ['taxonomy_id'])

    # 6. Material Attributes
    op.create_table(
        'material_attributes',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('normalized_material_id', sa.Uuid(), nullable=False),
        sa.Column('attribute_name', sa.String(length=100), nullable=False),
        sa.Column('original_value', sa.String(length=255), nullable=True),
        sa.Column('normalized_value', sa.String(length=255), nullable=False),
        sa.Column('normalized_unit', sa.String(length=50), nullable=True),
        sa.Column('data_type', sa.String(length=50), nullable=False, server_default='STRING'),
        sa.Column('source', sa.String(length=50), nullable=False, server_default='RULE_EXTRACTOR'),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['normalized_material_id'], ['normalized_materials.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_material_attributes_normalized_material_id', 'material_attributes', ['normalized_material_id'])
    op.create_index('ix_material_attributes_attribute_name', 'material_attributes', ['attribute_name'])

    # 7. Material Embeddings (pgvector)
    op.create_table(
        'material_embeddings',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('normalized_material_id', sa.Uuid(), nullable=False),
        sa.Column('embedding_model', sa.String(length=100), nullable=False, server_default='all-MiniLM-L6-v2'),
        sa.Column('model_version', sa.String(length=50), nullable=False, server_default='1.0.0'),
        sa.Column('dimensions', sa.Integer(), nullable=False, server_default='384'),
        sa.Column('embedding_vector', Vector(384), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['normalized_material_id'], ['normalized_materials.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('normalized_material_id', name='uq_embedding_normalized_material')
    )
    op.create_index('ix_material_embeddings_normalized_material_id', 'material_embeddings', ['normalized_material_id'])

    # 8. Standards Equivalences
    op.create_table(
        'standards_equivalences',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('source_standard', sa.String(length=100), nullable=False),
        sa.Column('target_standard', sa.String(length=100), nullable=False),
        sa.Column('equivalence_type', sa.String(length=50), nullable=False, server_default='REQUIRES_DOMAIN_REVIEW'),
        sa.Column('comparison_notes', sa.Text(), nullable=True),
        sa.Column('domain_reviewer_required', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('verification_status', sa.String(length=50), nullable=False, server_default='DRAFT'),
        sa.Column('verified_by', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('source_standard', 'target_standard', name='uq_standards_equivalence_pair')
    )
    op.create_index('ix_standards_equivalences_source_standard', 'standards_equivalences', ['source_standard'])
    op.create_index('ix_standards_equivalences_target_standard', 'standards_equivalences', ['target_standard'])

    # 9. Material Similarity Matches
    op.create_table(
        'material_similarity_matches',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('source_material_id', sa.Uuid(), nullable=False),
        sa.Column('target_material_id', sa.Uuid(), nullable=False),
        sa.Column('match_type', sa.String(length=50), nullable=False),
        sa.Column('lexical_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('vector_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('attribute_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('composite_confidence', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('methodology', sa.String(length=100), nullable=False, server_default='HYBRID_AI_RULE_V1'),
        sa.Column('match_explanation', sa.Text(), nullable=False),
        sa.Column('specification_diff', sa.JSON(), nullable=True),
        sa.Column('recommendation_status', sa.String(length=50), nullable=False, server_default='PROPOSED'),
        sa.Column('ai_model_version', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['source_material_id'], ['normalized_materials.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['target_material_id'], ['normalized_materials.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_material_similarity_matches_source', 'material_similarity_matches', ['source_material_id'])
    op.create_index('ix_material_similarity_matches_target', 'material_similarity_matches', ['target_material_id'])

    # 10. CNMC Candidates
    op.create_table(
        'cnmc_candidates',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('proposed_cnmc', sa.String(length=100), nullable=False),
        sa.Column('candidate_group_name', sa.String(length=255), nullable=False),
        sa.Column('proposed_description', sa.Text(), nullable=False),
        sa.Column('taxonomy_id', sa.Uuid(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('recommendation_explanation', sa.Text(), nullable=False),
        sa.Column('generation_source', sa.String(length=100), nullable=False, server_default='AI_CLUSTERING'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PENDING_REVIEW'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['taxonomy_id'], ['material_taxonomies.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_cnmc_candidates_proposed_cnmc', 'cnmc_candidates', ['proposed_cnmc'])
    op.create_index('ix_cnmc_candidates_taxonomy_id', 'cnmc_candidates', ['taxonomy_id'])

    # 11. CNMC Master (Layer 3: Governed Master Catalog)
    op.create_table(
        'cnmc_master',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('cnmc_code', sa.String(length=100), nullable=False),
        sa.Column('canonical_name', sa.String(length=255), nullable=False),
        sa.Column('standard_description', sa.Text(), nullable=False),
        sa.Column('taxonomy_id', sa.Uuid(), nullable=True),
        sa.Column('spec_template', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='ACTIVE'),
        sa.Column('governance_metadata', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['taxonomy_id'], ['material_taxonomies.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cnmc_code', name='uq_cnmc_master_code')
    )
    op.create_index('ix_cnmc_master_cnmc_code', 'cnmc_master', ['cnmc_code'])
    op.create_index('ix_cnmc_master_taxonomy_id', 'cnmc_master', ['taxonomy_id'])

    # 12. CPSE <-> CNMC Cross-walk Mappings
    op.create_table(
        'cpse_cnmc_mappings',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('raw_material_id', sa.Uuid(), nullable=False),
        sa.Column('normalized_material_id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('local_material_code', sa.String(length=100), nullable=False),
        sa.Column('cnmc_id', sa.Uuid(), nullable=False),
        sa.Column('mapping_type', sa.String(length=50), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False, server_default='1.0'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='ACTIVE'),
        sa.Column('approved_by', sa.String(length=255), nullable=False),
        sa.Column('effective_from', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('effective_to', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['cnmc_id'], ['cnmc_master.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['normalized_material_id'], ['normalized_materials.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['raw_material_id'], ['raw_materials.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_cpse_cnmc_mappings_raw_material_id', 'cpse_cnmc_mappings', ['raw_material_id'])
    op.create_index('ix_cpse_cnmc_mappings_normalized_material_id', 'cpse_cnmc_mappings', ['normalized_material_id'])
    op.create_index('ix_cpse_cnmc_mappings_organization_id', 'cpse_cnmc_mappings', ['organization_id'])
    op.create_index('ix_cpse_cnmc_mappings_local_material_code', 'cpse_cnmc_mappings', ['local_material_code'])
    op.create_index('ix_cpse_cnmc_mappings_cnmc_id', 'cpse_cnmc_mappings', ['cnmc_id'])

    # 13. Governance Reviews
    op.create_table(
        'governance_reviews',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=False),
        sa.Column('entity_id', sa.Uuid(), nullable=False),
        sa.Column('reviewer_reference', sa.String(length=255), nullable=False),
        sa.Column('decision', sa.String(length=50), nullable=False),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('previous_status', sa.String(length=50), nullable=True),
        sa.Column('new_status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_governance_reviews_entity_type', 'governance_reviews', ['entity_type'])
    op.create_index('ix_governance_reviews_entity_id', 'governance_reviews', ['entity_id'])

    # 14. Audit Logs (Append-Oriented)
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('entity_type', sa.String(length=100), nullable=False),
        sa.Column('entity_id', sa.String(length=100), nullable=False),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('previous_state', sa.JSON(), nullable=True),
        sa.Column('new_state', sa.JSON(), nullable=True),
        sa.Column('actor_reference', sa.String(length=255), nullable=False),
        sa.Column('ip_address', sa.String(length=100), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('metadata_payload', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_audit_logs_entity_type', 'audit_logs', ['entity_type'])
    op.create_index('ix_audit_logs_entity_id', 'audit_logs', ['entity_id'])


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('governance_reviews')
    op.drop_table('cpse_cnmc_mappings')
    op.drop_table('cnmc_master')
    op.drop_table('cnmc_candidates')
    op.drop_table('material_similarity_matches')
    op.drop_table('standards_equivalences')
    op.drop_table('material_embeddings')
    op.drop_table('material_attributes')
    op.drop_table('normalized_materials')
    op.drop_table('raw_materials')
    op.drop_table('material_taxonomies')
    op.drop_table('source_systems')
    op.drop_table('organizations')
