from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None


from typing import Optional, Union

class UserResponse(BaseModel):
    id: Union[str, int]
    email: str
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
