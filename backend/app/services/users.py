from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import SessionLocal
from app.services.passwords import verify_password


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.scalar(select(User).where(User.username == username))


def verify_user(username: str, password: str) -> User | None:
    with SessionLocal() as db:
        user = get_user_by_username(db, username)
        if user is None:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user


def list_usernames() -> list[str]:
    with SessionLocal() as db:
        rows = db.scalars(select(User.username).order_by(User.username)).all()
        return list(rows)
