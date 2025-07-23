from datetime import datetime, timedelta
from typing import Optional, List
from bson import ObjectId
from pymongo.collection import Collection
from models.user import BaseUser, User, UserRole, UserStatus
from schemas.auth import UserRegister, InviteUser, AcceptInvitation
from utils.security import get_password_hash, verify_password, generate_verification_token, generate_magic_link_token, generate_invitation_token
from services.email_service import email_service
from database.db import get_database
from config.settings import settings
from fastapi import HTTPException, status

class UserService:
    def __init__(self):
        self.db = None
        self.users_collection: Collection = None

    def get_users_collection(self) -> Collection:
        if self.db is None:
            self.db = get_database()
            self.users_collection = self.db.users
        return self.users_collection

    async def create_user(self, user_data: UserRegister) -> User:
        
        # Return the collection users
        collection = self.get_users_collection()
        
        # Check if user already exists
        if collection.find_one({"email": user_data.email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create user
        verification_token = generate_verification_token()
        user = User(
            email=user_data.email,
            password = get_password_hash(user_data.password),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            institution=user_data.institution,
            role = user_data.role,
            status = user_data.status
            #password_hash=get_password_hash(user_data.password),
            #verification_token=verification_token
        )

        # Save to database
        result = collection.insert_one(user.dict(by_alias=True, exclude={"id"}))
        user.id = str(result.inserted_id)

        # Send verification email
        # await email_service.send_verification_email(user.email, verification_token)

        return user

    async def delete_user(self, user_id: str):

        # Return the collection users
        collection = self.get_users_collection()

        # Verify ID
        if not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code = status.HTTP_400_BAD_REQUEST,
                detail = "Invalid user ID format"
            )

        result = collection.delete_one({"_id": ObjectId(user_id)})
        print(result)

        if result.deleted_count == 0:
            raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

        return {"message": "User deleted successfully"}

    async def invite_user(self, invite_data: InviteUser, inviter_id: str) -> User:
        collection = self.get_users_collection()
        
        # Check if user already exists
        if collection.find_one({"email": invite_data.email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )

        # Generate invitation token
        invitation_token = generate_invitation_token()
        
        # Create user with pending invitation status
        user = User(
            email=invite_data.email,
            first_name=invite_data.first_name,
            last_name=invite_data.last_name,
            institution=invite_data.institution,
            role=invite_data.role,
            status=UserStatus.PENDING_INVITATION,
            invited_by=inviter_id,
            invitation_token=invitation_token
        )

        # Save to database
        result = collection.insert_one(user.dict(by_alias=True, exclude={"id"}))
        user.id = str(result.inserted_id)

        # Get inviter name
        inviter = collection.find_one({"_id": inviter_id})
        inviter_name = f"{inviter['first_name']} {inviter['last_name']}" if inviter else "AlgaeTrack Team"

        # Send invitation email
        await email_service.send_invitation_email(
            user.email, 
            invitation_token, 
            inviter_name, 
            invite_data.role.value
        )

        return user

    async def accept_invitation(self, accept_data: AcceptInvitation) -> User:
        collection = self.get_users_collection()
        
        # Find user by invitation token
        user_data = collection.find_one({"invitation_token": accept_data.invitation_token})
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid invitation token"
            )

        # Update user with password and activate
        collection.update_one(
            {"_id": user_data["_id"]},
            {
                "$set": {
                    "password_hash": get_password_hash(accept_data.password),
                    "status": UserStatus.ACTIVE,
                    "email_verified": True,
                    "updated_at": datetime.utcnow()
                },
                "$unset": {
                    "invitation_token": ""
                }
            }
        )

        # Return updated user
        updated_user_data = collection.find_one({"_id": user_data["_id"]})
        return User(**updated_user_data)

    async def verify_email(self, verification_token: str) -> bool:
        collection = self.get_users_collection()
        
        result = collection.update_one(
            {"verification_token": verification_token},
            {
                "$set": {
                    "email_verified": True,
                    "status": UserStatus.ACTIVE,
                    "updated_at": datetime.utcnow()
                },
                "$unset": {
                    "verification_token": ""
                }
            }
        )

        return result.modified_count > 0

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        collection = self.get_users_collection()
        
        user_data = collection.find_one({"email": email})
        if not user_data:
            return None

        user = User(**{
                **user_data,
                "_id": str(user_data["_id"])
            })
        
        if not user or not user.password:
            return None  # Usuario no existe o no tiene contraseña configurada

        # 2. Luego verifica la contraseña
        if not verify_password(password, user.password):
            return None  # Contraseña incorrecta

        # if user.status != UserStatus.ACTIVE:
        #     return None

        # Update last login
        collection.update_one(
            {"_id": user_data["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )

        return user

    async def generate_magic_link(self, email: str) -> bool:
        collection = self.get_users_collection()
        
        user_data = collection.find_one({"email": email})
        if not user_data:
            # Don't reveal if email exists or not
            return True

        user = User(**user_data)
        if user.status != UserStatus.ACTIVE:
            return True

        # Generate magic link token
        magic_token = generate_magic_link_token()
        magic_link_expires = datetime.utcnow() + timedelta(minutes=settings.MAGIC_LINK_EXPIRE_MINUTES)

        # Save magic link token
        collection.update_one(
            {"_id": user_data["_id"]},
            {
                "$set": {
                    "magic_link_token": magic_token,
                    "magic_link_expires": magic_link_expires
                }
            }
        )

        # Send magic link email
        await email_service.send_magic_link(email, magic_token)
        return True

    async def verify_magic_link(self, magic_token: str) -> Optional[User]:
        collection = self.get_users_collection()
        
        user_data = collection.find_one({
            "magic_link_token": magic_token,
            "magic_link_expires": {"$gt": datetime.utcnow()}
        })

        if not user_data:
            return None

        # Clear magic link token and update last login
        collection.update_one(
            {"_id": user_data["_id"]},
            {
                "$set": {"last_login": datetime.utcnow()},
                "$unset": {
                    "magic_link_token": "",
                    "magic_link_expires": ""
                }
            }
        )

        return User(**user_data)

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        collection = self.get_users_collection()
        user_data = collection.find_one({"_id": user_id})
        return User(**user_data) if user_data else None

    async def get_user_by_email(self, email: str) -> Optional[User]:
        collection = self.get_users_collection()
        user_data = collection.find_one({"email": email})
        return User(**user_data) if user_data else None

    async def update_user_role(self, user_id: str, new_role: UserRole) -> bool:
        collection = self.get_users_collection()
        result = collection.update_one(
            {"_id": user_id},
            {"$set": {"role": new_role, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0

    async def get_all_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        collection = self.get_users_collection()
        users_data = collection.find().skip(skip).limit(limit)
        return [User(**user_data) for user_data in users_data]

user_service = UserService()