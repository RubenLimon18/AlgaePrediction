from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from models.user import UserRole, UserStatus
import re
from datetime import datetime

# Clase para registrar el usuario.
class UserRegister(BaseModel):
    email: EmailStr = Field(..., example="user@example.com")
    password: str = Field(...,min_length=8, max_length=64)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    institution: str = Field(..., min_length=1, max_length=100)
    role: UserRole = Field(default=UserRole.USER)
    status: UserStatus = Field(default=UserStatus.ACTIVE)
    


    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v


    @validator('first_name', 'last_name', 'institution')
    def validate_alpha_fields(cls, v):
        pattern = r'^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$'
        if not re.fullmatch(pattern, v.strip()):
            raise ValueError("Must contain only letters and spaces")
        return ' '.join(v.strip().title().split())  # Limpieza + capitalización

    

class UserRegisterResponse(BaseModel):
    id: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    institution: str
    role: UserRole
    status: UserStatus 
    created_at: datetime 
    updated_at: datetime 
    last_login: Optional[datetime]

    # GET Method
    @staticmethod
    def individual_serial(user) -> dict :
        return {
            "id": str(user["_id"]),
            "email": str(user["email"]),
            "password": str(user["password"]),
            "first_name": str(user["first_name"]),
            "last_name": str(user["last_name"]),
            "institution": str(user["institution"]),
            "role": str(user["role"]),
            "status": str(user["status"]),
            "created_at": user["created_at"].strftime("%d/%m/%Y"),
            "updated_at": user["updated_at"].strftime("%d/%m/%Y"),
            "last_login": user['last_login'].strftime("%d/%m/%Y") if user['last_login'] else None
        }

    @staticmethod
    def list_serial(users) -> list :
        return [UserRegisterResponse.individual_serial(user) for user in users]



class UserLogin(BaseModel):
    email: EmailStr
    password: str


class MagicLinkRequest(BaseModel):
    email: EmailStr

class InviteUser(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    institution: str
    role: UserRole

class AcceptInvitation(BaseModel):
    invitation_token: str
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    reset_token: str
    new_password: str
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class MessageResponse(BaseModel):
    message: str
    id: Optional[str] = None
    token: str
    expiresIn: int

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    institution: str
    role: UserRole
    status: str
    # email_verified: bool
    created_at: datetime
    last_login: Optional[datetime]
