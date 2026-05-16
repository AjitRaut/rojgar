"""
Seed an initial admin user.

Usage:
    python -m scripts.seed_admin

Requires .env with valid DATABASE_URL.
"""
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole


ADMIN_EMAIL = "admin@rojgarfind.com"
ADMIN_PASSWORD = "Admin@12345"
ADMIN_NAME = "Platform Admin"


def main() -> None:
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if existing:
            print(f"Admin already exists: {ADMIN_EMAIL}")
            return

        admin = User(
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            full_name=ADMIN_NAME,
            role=UserRole.ADMIN,
            is_verified=True,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print("Admin user created:")
        print(f"  Email:    {ADMIN_EMAIL}")
        print(f"  Password: {ADMIN_PASSWORD}")
        print("  CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
