from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, Field

from app.deps import get_current_user
from app.services.tokens import create_access_token, decode_token_claims
from app.services.users import verify_user

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=64)
    password: str = Field(..., min_length=4, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str


class MeResponse(BaseModel):
    username: str
    role: str


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest) -> TokenResponse:
    user = verify_user(body.username, body.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Nesprávné údaje")
    token = create_access_token(user.username, role=user.role)
    return TokenResponse(access_token=token, username=user.username, role=user.role)


@router.get("/me", response_model=MeResponse)
def me(
    username: str = Depends(get_current_user),
    authorization: str | None = Header(default=None, alias="Authorization"),
) -> MeResponse:
    role = "user"
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
        claims = decode_token_claims(token)
        if claims and claims.username == username:
            role = claims.role
    return MeResponse(username=username, role=role)
