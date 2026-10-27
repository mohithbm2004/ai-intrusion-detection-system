from pydantic import BaseModel
from app.schemas.user import UserResponse

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str | None = None

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class AuthResponse(BaseModel):
    token: Token
    user: UserResponse
