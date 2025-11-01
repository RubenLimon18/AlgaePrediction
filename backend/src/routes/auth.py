from fastapi import APIRouter, HTTPException, status, Depends, Response
from fastapi.responses import JSONResponse
from schemas.auth import (
    UserRegister, UserLogin, MagicLinkRequest, InviteUser, 
    AcceptInvitation, TokenResponse, UserRegisterResponse, UserResponse, MessageResponse
)
from services.user_service import user_service
from utils.security import create_access_token, create_refresh_token, verify_token
from dependencies.auth import get_current_active_user, require_admin, get_current_user_from_cookie
from models.user import UpdateUser, User
from database.db import get_collection
from schemas.auth import UserRegister

from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

# GET Request Method
@router.get("/users")
async def get_all():
    users = UserRegisterResponse.list_serial((get_collection("users").find()))
    return users

# GET Request Method
@router.get("/user/{userId}")
async def get_user(userId: str):
    try:
        user = await user_service.get_user_by_id(userId)
        return user
    
    except HTTPException as e:
        raise e
    except Exception as e:
        print("Unexpected error:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during deletion"
        )


# POST Request Method
@router.post("/register")
async def register(user_data: UserRegister): # UserRegister -> Schema ( Lo que va a recibir )
    """Register a new user (public access)"""
    try:
        user = await user_service.create_user(user_data)
        
        return UserRegisterResponse(
            id = user.id,
            email = user.email,
            password = user.password,
            first_name = user.first_name,
            last_name =  user.last_name,
            institution =  user.institution,
            role =  user.role,
            status =  user.status,
            created_at = user.created_at,
            updated_at = user.updated_at,
            last_login = user.last_login
        )
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )


# DELETE Request Method
@router.delete('/user/delete/{userId}')
async def deleteUser(userId: str):
    try:
        response = await user_service.delete_user(userId)
        return response
    
    except HTTPException as e:
        raise e
    except Exception as e:
        print("Unexpected error:", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during deletion"
        )

# POST Request Method
@router.post("/login", response_model=MessageResponse)
async def login(login_data: UserLogin, response: Response):
    
    """Login with email and password"""
    user = await user_service.authenticate_user(login_data.email, login_data.password)

    # Cuando retorna None o no encuentra al usuario
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # if not user.email_verified:
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Please verify your email before logging in"
    #     )
    
    # Create tokens
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})


    return {
        "message": "Login successful",
        "id": user.id,
        "token": access_token,
        "expiresIn": 3600 # 30 Minutos = 1800,  30 = 30 segundos, 3600 =  1H
    }


@router.post("/logout", response_model=MessageResponse)
async def logout(response: Response):
    """Logout user by clearing cookies"""
    response.delete_cookie("refresh_token", path="/")
    response.delete_cookie("access_token", path="/")
    return {"message": "Logout successful"}

@router.post("/magic-link", response_model=dict)
async def request_magic_link(magic_request: MagicLinkRequest):
    """Request a magic link for login"""
    await user_service.generate_magic_link(magic_request.email)
    return {"message": "If an account with this email exists, a magic link has been sent."}

@router.post("/magic-login", response_model=TokenResponse)
async def magic_login(magic_token: str):
    """Login using magic link token"""
    user = await user_service.verify_magic_link(magic_token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired magic link"
        )
    
    # Create tokens
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=1800  # 30 minutes
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    """Refresh access token using refresh token"""
    token_data = verify_token(refresh_token, "refresh")
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = token_data.get("sub")
    user = await user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Create new tokens
    access_token = create_access_token({"sub": user.id})
    new_refresh_token = create_refresh_token({"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=1800  # 30 minutes
    )

@router.post("/verify-email", response_model=dict)
async def verify_email(verification_token: str):
    """Verify email address"""
    success = await user_service.verify_email(verification_token)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    return {"message": "Email verified successfully. You can now log in."}

@router.post("/invite", response_model=dict)
async def invite_user(
    invite_data: InviteUser, 
    current_user: User = Depends(require_admin)
):
    """Invite a new researcher (admin only)"""
    try:
        user = await user_service.invite_user(invite_data, current_user.id)
        return {
            "message": f"Invitation sent to {invite_data.email}",
            "user_id": user.id
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while sending invitation"
        )

@router.post("/accept-invitation", response_model=dict)
async def accept_invitation(accept_data: AcceptInvitation):
    """Accept invitation and set password"""
    try:
        user = await user_service.accept_invitation(accept_data)
        return {
            "message": "Invitation accepted successfully. You can now log in.",
            "user_id": user.id
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while accepting invitation"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user_from_cookie)):
    """Get current user information"""
    print(f"Current user: {current_user}")
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        institution=current_user.institution,
        role=current_user.role,
        status=current_user.status,
        created_at=current_user.created_at,
        last_login=current_user.last_login
    )


@router.put("/user/{user_id}/updateProfile")
async def update_user_profile(
    user_id: str,
    user: UpdateUser
):  
    success = await user_service.update_user_profile(user_id, user)

    if not success:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = "User not found"
        )
    return {"message": f"User updated"}
        
    
    
    
        

@router.put("/user/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: str,
    current_user: User = Depends(require_admin)
):
    """Update user role (admin only)"""
    from models.user import UserRole
    
    try:
        role = UserRole(new_role)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )
    
    success = await user_service.update_user_role(user_id, role)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": f"User role updated to {new_role}"}

# @router.get("/users")
# async def get_all_users(
#     skip: int = 0,
#     limit: int = 100,
#     current_user: User = Depends(require_admin)
# ):
#     """Get all users (admin only)"""
#     users = await user_service.get_all_users(skip, limit)
#     return [
#         UserResponse(
#             id=user.id,
#             email=user.email,
#             first_name=user.first_name,
#             last_name=user.last_name,
#             institution=user.institution,
#             role=user.role,
#             status=user.status,
#             email_verified=user.email_verified,
#             created_at=user.created_at,
#             last_login=user.last_login
#         )
#         for user in users
#     ]
