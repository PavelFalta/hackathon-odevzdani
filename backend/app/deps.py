import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.models import User
from app.db.session import get_db
from app.services.tokens import TokenClaims, decode_token_claims
from app.services.users import get_user_by_username

_bearer = HTTPBearer(auto_error=False)


def _claims(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> TokenClaims:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Nejsi přihlášen")
    claims = decode_token_claims(credentials.credentials)
    if claims is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Neplatný token")
    return claims


def get_current_user(claims: TokenClaims = Depends(_claims)) -> str:
    return claims.username


def get_current_user_row(
    claims: TokenClaims = Depends(_claims),
    db: Session = Depends(get_db),
) -> User:
    user = get_user_by_username(db, claims.username)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Neplatný uživatel")
    return user


def require_admin(user: User = Depends(get_current_user_row)) -> User:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Pouze pro administrátora"
        )
    return user


def parse_conversation_header(value: str | None) -> uuid.UUID | None:
    if not value:
        return None
    try:
        return uuid.UUID(value.strip())
    except ValueError:
        return None
