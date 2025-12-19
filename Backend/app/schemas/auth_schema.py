from pydantic import BaseModel, EmailStr, Field
from pydantic import ConfigDict
from datetime import date

class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_active: bool
    nid: str | None = None
    tin: str | None = None
    date_of_birth: date | None = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str = Field(min_length=8, max_length=72)

class SendOTPRequest(BaseModel):
    email: EmailStr
    purpose: str = "login" 

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    code: str

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=8, max_length=72)
    new_password: str = Field(min_length=8, max_length=72)

class DeleteAccountRequest(BaseModel):
    confirm: bool = True

class ProfileUpdateRequest(BaseModel):
    # Optional fields for partial profile updates
    name: str | None = None
    nid: str | None = None
    tin: str | None = None
    date_of_birth: str | None = None