"""ingestion_jobs

Revision ID: 0003_ingestion_jobs
Revises: 0002_core_domain_schema
Create Date: 2026-09-08 02:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0003_ingestion_jobs'
down_revision: Union[str, None] = '0002_core_domain_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'ingestion_jobs',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('source_system_id', sa.Uuid(), nullable=True),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('stored_filepath', sa.String(length=500), nullable=False),
        sa.Column('file_type', sa.String(length=50), nullable=False),
        sa.Column('file_hash', sa.String(length=64), nullable=False),
        sa.Column('total_rows', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('processed_rows', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('failed_rows', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='QUEUED'),
        sa.Column('column_mapping', sa.JSON(), nullable=True),
        sa.Column('error_summary', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['source_system_id'], ['source_systems.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_ingestion_jobs_organization_id', 'ingestion_jobs', ['organization_id'])
    op.create_index('ix_ingestion_jobs_file_hash', 'ingestion_jobs', ['file_hash'])
    op.create_index('ix_ingestion_jobs_status', 'ingestion_jobs', ['status'])


def downgrade() -> None:
    op.drop_table('ingestion_jobs')
