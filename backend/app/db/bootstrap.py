from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Base, User
from app.db.session import SessionLocal, engine
from app.services.passwords import hash_password

_DEMO_USERS = (
    ("demo", "demo123", "user"),
    ("admin", "admin123", "admin"),
)


def create_schema() -> None:
    Base.metadata.create_all(bind=engine)


def seed_users(db: Session) -> None:
    existing = {row[0] for row in db.execute(select(User.username)).all()}
    for username, password, role in _DEMO_USERS:
        if username in existing:
            continue
        db.add(
            User(
                username=username,
                password_hash=hash_password(password),
                role=role,
            ),
        )
    db.commit()


def init_database() -> None:
    create_schema()
    with SessionLocal() as db:
        seed_users(db)


def reset_database_for_tests() -> None:
    Base.metadata.drop_all(bind=engine)
    create_schema()
    with SessionLocal() as db:
        seed_users(db)
