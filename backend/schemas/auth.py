from pydantic import BaseModel
from typing import Optional

class LoginSchema(BaseModel):
    login_id: str
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str

class ChangePasswordSchema(BaseModel):
    new_password: str
    confirm_password: str

class UserSchema(BaseModel):
    public_id: str
    email: str
    role: str
    is_active: bool
    must_change_password: bool

    class Config:
        from_attributes = True
