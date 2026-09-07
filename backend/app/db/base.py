# Import Base from session
from app.db.session import Base

# Export for Alembic & Model discovery
__all__ = ["Base"]
