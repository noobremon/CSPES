"""initial_health_foundation

Revision ID: 0001_initial_health
Revises: 
Create Date: 2026-09-08 00:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0001_initial_health'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    
    # Create baseline system_health_checks table
    op.create_table(
        'system_health_checks',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('node_name', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('checked_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('system_health_checks')
    op.execute("DROP EXTENSION IF EXISTS vector;")
