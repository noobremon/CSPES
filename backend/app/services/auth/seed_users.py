import uuid
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User, RoleEnum, UserStatus
from app.models.organization import Organization
from app.core.security import get_password_hash

DEMO_USERS: List[Dict[str, Any]] = [
    {
        "email": "national_admin@sih.demo",
        "full_name": "Dr. Rajesh Sharma (National Admin)",
        "password": "DemoAdmin@2026",
        "role": RoleEnum.NATIONAL_MASTER_ADMIN,
        "org_code": None,
    },
    {
        "email": "cpse_manager_a@sih.demo",
        "full_name": "Vikram Malhotra (IOCL Materials)",
        "password": "DemoManager@2026",
        "role": RoleEnum.CPSE_MATERIAL_MANAGER,
        "org_code": "IOCL",
    },
    {
        "email": "cpse_manager_b@sih.demo",
        "full_name": "Pooja Verma (ONGC Materials)",
        "password": "DemoManager@2026",
        "role": RoleEnum.CPSE_MATERIAL_MANAGER,
        "org_code": "ONGC",
    },
    {
        "email": "domain_reviewer@sih.demo",
        "full_name": "Ananya Sen (Domain Reviewer)",
        "password": "DemoReviewer@2026",
        "role": RoleEnum.DOMAIN_REVIEWER,
        "org_code": None,
    },
    {
        "email": "auditor@sih.demo",
        "full_name": "Suresh Nair (National Auditor)",
        "password": "DemoAuditor@2026",
        "role": RoleEnum.AUDITOR,
        "org_code": None,
    },
]


async def seed_demo_users(db: AsyncSession) -> List[User]:
    """
    Seeds initial demonstration accounts if they do not already exist in the database.
    """
    created_users = []

    for demo in DEMO_USERS:
        # Check if user already exists
        stmt = select(User).where(User.email == demo["email"])
        res = await db.execute(stmt)
        existing = res.scalars().first()

        if existing:
            created_users.append(existing)
            continue

        # Look up organization if org_code is provided
        org_id = None
        if demo["org_code"]:
            org_stmt = select(Organization).where(Organization.code == demo["org_code"])
            org_res = await db.execute(org_stmt)
            org = org_res.scalars().first()
            if org:
                org_id = org.id

        new_user = User(
            id=uuid.uuid4(),
            email=demo["email"],
            hashed_password=get_password_hash(demo["password"]),
            full_name=demo["full_name"],
            role=demo["role"],
            organization_id=org_id,
            status=UserStatus.ACTIVE,
        )
        db.add(new_user)
        created_users.append(new_user)

    await db.flush()
    return created_users
