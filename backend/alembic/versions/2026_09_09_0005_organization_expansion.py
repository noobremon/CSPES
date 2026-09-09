"""organization_expansion

Revision ID: 0005_organization_expansion
Revises: 0004_auth_and_rbac
Create Date: 2026-09-09 20:25:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0005_organization_expansion'
down_revision: Union[str, None] = '0004_auth_and_rbac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('organizations', sa.Column('short_name', sa.String(length=100), nullable=True))
    op.add_column('organizations', sa.Column('organization_type', sa.String(length=50), nullable=False, server_default='MAHARATNA'))
    op.add_column('organizations', sa.Column('onboarding_status', sa.String(length=50), nullable=False, server_default='ONBOARDED_ACTIVE'))
    op.add_column('organizations', sa.Column('demo_status', sa.String(length=100), nullable=False, server_default='DEMONSTRATION_PROFILE'))
    op.add_column('organizations', sa.Column('data_source_type', sa.String(length=50), nullable=False, server_default='MANUAL_CSV_UPLOAD'))


def downgrade() -> None:
    op.drop_column('organizations', 'data_source_type')
    op.drop_column('organizations', 'demo_status')
    op.drop_column('organizations', 'onboarding_status')
    op.drop_column('organizations', 'organization_type')
    op.drop_column('organizations', 'short_name')
