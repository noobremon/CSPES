"""row_level_security_policies

Revision ID: 0006_row_level_security_policies
Revises: 0005_organization_expansion
Create Date: 2026-09-14 03:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0006_row_level_security_policies'
down_revision: Union[str, None] = '0005_organization_expansion'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if running on PostgreSQL before executing dialect-specific RLS statements
    conn = op.get_bind()
    if conn.dialect.name == "postgresql":
        # 1. Enable RLS on raw_materials (Layer 1 Tenant-Private Data)
        op.execute("ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;")
        op.execute("""
            CREATE POLICY raw_materials_tenant_isolation_policy ON raw_materials
            FOR ALL
            USING (
                current_setting('app.bypass_rls', true) = 'on'
                OR current_setting('app.current_user_role', true) IN ('NATIONAL_MASTER_ADMIN')
                OR (organization_id::text = current_setting('app.current_org_id', true))
            )
            WITH CHECK (
                current_setting('app.bypass_rls', true) = 'on'
                OR (organization_id::text = current_setting('app.current_org_id', true))
            );
        """)

        # 2. Enable RLS on ingestion_jobs (Tenant Ingestion & Uploads)
        op.execute("ALTER TABLE ingestion_jobs ENABLE ROW LEVEL SECURITY;")
        op.execute("""
            CREATE POLICY ingestion_jobs_tenant_isolation_policy ON ingestion_jobs
            FOR ALL
            USING (
                current_setting('app.bypass_rls', true) = 'on'
                OR current_setting('app.current_user_role', true) IN ('NATIONAL_MASTER_ADMIN')
                OR (organization_id::text = current_setting('app.current_org_id', true))
            )
            WITH CHECK (
                current_setting('app.bypass_rls', true) = 'on'
                OR (organization_id::text = current_setting('app.current_org_id', true))
            );
        """)

        # 3. Enable RLS on audit_logs (Immutable Audit Trail)
        op.execute("ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;")
        op.execute("""
            CREATE POLICY audit_logs_isolation_policy ON audit_logs
            FOR SELECT
            USING (
                current_setting('app.bypass_rls', true) = 'on'
                OR current_setting('app.current_user_role', true) IN ('NATIONAL_MASTER_ADMIN', 'AUDITOR', 'DOMAIN_REVIEWER')
                OR (actor_reference = current_setting('app.current_user_email', true))
            );
        """)
        op.execute("""
            CREATE POLICY audit_logs_insert_policy ON audit_logs
            FOR INSERT
            WITH CHECK (true);
        """)


def downgrade() -> None:
    conn = op.get_bind()
    if conn.dialect.name == "postgresql":
        op.execute("DROP POLICY IF EXISTS audit_logs_insert_policy ON audit_logs;")
        op.execute("DROP POLICY IF EXISTS audit_logs_isolation_policy ON audit_logs;")
        op.execute("ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;")

        op.execute("DROP POLICY IF EXISTS ingestion_jobs_tenant_isolation_policy ON ingestion_jobs;")
        op.execute("ALTER TABLE ingestion_jobs DISABLE ROW LEVEL SECURITY;")

        op.execute("DROP POLICY IF EXISTS raw_materials_tenant_isolation_policy ON raw_materials;")
        op.execute("ALTER TABLE raw_materials DISABLE ROW LEVEL SECURITY;")
