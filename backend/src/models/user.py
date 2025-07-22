from datetime import datetime
from typing import Optional
from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, field_validator
from enum import Enum


# Ejemplo
class Todo(BaseModel):
    name: str
    description: str
    complete: bool

class UserRole(str, Enum):
    ADMIN = "admin"
    RESEARCHER = "researcher"
    USER = "user"

class UserStatus(str, Enum):
    PENDING_VERIFICATION = "pending_verification"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING_INVITATION = "pending_invitation"



# Estructura como se almacenara en MongoDB
class BaseUser(BaseModel):
    email: str
    password: str
    first_name: str 
    last_name: str 
    institution: str 
    role: UserRole 
    status: UserStatus



class User(BaseUser):
    id: Optional[str] = Field(None, alias="_id")
    # password_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    # email_verified: bool = False
    # invited_by: Optional[str] = None  # User ID who sent invitation
    # invitation_token: Optional[str] = None
    # verification_token: Optional[str] = None
    # magic_link_token: Optional[str] = None
    #magic_link_expires: Optional[datetime] = None
    


    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }
