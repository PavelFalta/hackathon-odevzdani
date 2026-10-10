from datetime import UTC, datetime, timedelta

import jwt

from app.config import settings

_ALGORITHM = "HS256"
_TOKEN_HOURS = 12


def create_access_token(subject: str, role: str = "user") -> str:
    expire = datetime.now(UTC) + timedelta(hours=_TOKEN_HOURS)
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=_ALGORITHM)


def decode_token(token: str) -> str | None:
    claims = decode_token_claims(token)
    return claims.username if claims else None


class TokenClaims:
    def __init__(self, username: str, role: str) -> None:
        self.username = username
        self.role = role


def decode_token_claims(token: str) -> TokenClaims | None:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[_ALGORITHM])
    except jwt.PyJWTError:
        return None
    sub = payload.get("sub")
    role = payload.get("role")
    if not isinstance(sub, str):
        return None
    if not isinstance(role, str):
        role = "user"
    return TokenClaims(username=sub, role=role)
