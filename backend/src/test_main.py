from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime, timedelta
from typing import Optional, Dict
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets
import re
from enum import Enum
from contextlib import asynccontextmanager

# ===== CONFIGURACIÓN =====
JWT_SECRET_KEY = "test-secret-key-change-in-production"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# ===== STORAGE IN MEMORY =====
users_db: Dict[str, dict] = {}
tokens_db: Dict[str, dict] = {}  # Para magic links y verification tokens

# ===== ENUMS =====
class UserRole(str, Enum):
    ADMIN = "admin"
    RESEARCHER = "researcher"
    USER = "user"

class UserStatus(str, Enum):
    PENDING_VERIFICATION = "pending_verification"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    PENDING_INVITATION = "pending_invitation"

# ===== MODELS =====
class UserRegister(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    institution: str = Field(..., min_length=1, max_length=100)
    password: str
    
    @field_validator('password')
    @classmethod
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
    
    @field_validator('password')
    @classmethod
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

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    institution: str
    role: UserRole
    status: str
    email_verified: bool
    created_at: datetime
    last_login: Optional[datetime]

# ===== SECURITY UTILS =====
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: Dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: Dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str, token_type: str = "access") -> Optional[Dict]:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != token_type:
            return None
        return payload
    except JWTError:
        return None

def generate_token() -> str:
    return secrets.token_urlsafe(32)

# ===== AUTH DEPENDENCIES =====
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise credentials_exception
    
    user_id = token_data.get("sub")
    if user_id is None or user_id not in users_db:
        raise credentials_exception
    
    return users_db[user_id]

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    if current_user["status"] != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user

def require_admin(current_user: dict = Depends(get_current_active_user)):
    if current_user["role"] != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_researcher(current_user: dict = Depends(get_current_active_user)):
    if current_user["role"] not in [UserRole.ADMIN, UserRole.RESEARCHER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Researcher access required"
        )
    return current_user

# ===== EMAIL MOCK =====
def mock_send_email(email: str, subject: str, content: str):
    print(f"\n📧 EMAIL SENT TO: {email}")
    print(f"📌 SUBJECT: {subject}")
    print(f"🔗 CONTENT: {content}")
    print("-" * 50)

# ===== LIFESPAN MANAGEMENT =====
async def create_default_admin():
    admin_id = "admin_001"
    admin_user = {
        "id": admin_id,
        "email": "admin@algaetrack.com",
        "first_name": "Admin",
        "last_name": "AlgaeTrack", 
        "institution": "AlgaeTrack Team",
        "role": UserRole.ADMIN,
        "status": UserStatus.ACTIVE,
        "email_verified": True,
        "password_hash": get_password_hash("Admin123!"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_login": None
    }
    users_db[admin_id] = admin_user
    print(f"🔧 Default admin created: admin@algaetrack.com / Admin123!")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await create_default_admin()
    yield
    # Shutdown (if needed)
    pass

# ===== FASTAPI APP =====
app = FastAPI(
    title="AlgaeTrack API - Test Version",
    description="Test version with in-memory storage",
    version="1.0.0-test",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== ROUTES =====

@app.get("/")
async def root():
    return {
        "message": "AlgaeTrack API - Test Version", 
        "users_count": len(users_db),
        "default_admin": {
            "email": "admin@algaetrack.com",
            "password": "Admin123!"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# AUTH ROUTES
@app.post("/auth/register", response_model=dict)
async def register(user_data: UserRegister):
    # Check if user exists
    for user in users_db.values():
        if user["email"] == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Create user
    user_id = f"user_{len(users_db) + 1:03d}"
    verification_token = generate_token()
    
    new_user = {
        "id": user_id,
        "email": user_data.email,
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "institution": user_data.institution,
        "role": UserRole.USER,
        "status": UserStatus.PENDING_VERIFICATION,
        "email_verified": False,
        "password_hash": get_password_hash(user_data.password),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_login": None
    }
    
    users_db[user_id] = new_user
    tokens_db[verification_token] = {"user_id": user_id, "type": "verification"}
    
    # Mock email
    verification_url = f"http://localhost:8000/auth/verify-email?token={verification_token}"
    mock_send_email(
        user_data.email,
        "Verify your AlgaeTrack account",
        f"Click here to verify: {verification_url}"
    )
    
    return {
        "message": "User registered successfully. Check console for verification link.",
        "user_id": user_id,
        "verification_token": verification_token  # Solo para testing
    }

@app.post("/auth/login", response_model=TokenResponse)
async def login(login_data: UserLogin):
    # Find user
    user = None
    for u in users_db.values():
        if u["email"] == login_data.email:
            user = u
            break
    
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user["email_verified"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please verify your email before logging in"
        )
    
    if user["status"] != UserStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is not active"
        )
    
    # Update last login
    user["last_login"] = datetime.utcnow()
    
    # Create tokens
    access_token = create_access_token({"sub": user["id"]})
    refresh_token = create_refresh_token({"sub": user["id"]})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@app.post("/auth/magic-link", response_model=dict)
async def request_magic_link(magic_request: MagicLinkRequest):
    # Find user
    user = None
    for u in users_db.values():
        if u["email"] == magic_request.email:
            user = u
            break
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If an account with this email exists, a magic link has been sent."}
    
    if user["status"] != UserStatus.ACTIVE:
        return {"message": "If an account with this email exists, a magic link has been sent."}
    
    # Generate magic token
    magic_token = generate_token()
    tokens_db[magic_token] = {
        "user_id": user["id"], 
        "type": "magic_link",
        "expires": datetime.utcnow() + timedelta(minutes=15)
    }
    
    # Mock email
    magic_url = f"http://localhost:8000/auth/magic-login?token={magic_token}"
    mock_send_email(
        magic_request.email,
        "Your AlgaeTrack login link",
        f"Click here to login: {magic_url}"
    )
    
    return {
        "message": "Magic link sent! Check console for the link.",
        "magic_token": magic_token  # Solo para testing
    }

@app.post("/auth/magic-login", response_model=TokenResponse)
async def magic_login(token: str):
    # Verify magic token
    token_data = tokens_db.get(token)
    if not token_data or token_data["type"] != "magic_link":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid magic link"
        )
    
    # Check expiration
    if datetime.utcnow() > token_data.get("expires", datetime.utcnow()):
        del tokens_db[token]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Magic link expired"
        )
    
    user = users_db.get(token_data["user_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Clean up token and update last login
    del tokens_db[token]
    user["last_login"] = datetime.utcnow()
    
    # Create tokens
    access_token = create_access_token({"sub": user["id"]})
    refresh_token = create_refresh_token({"sub": user["id"]})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@app.post("/auth/verify-email", response_model=dict)
async def verify_email(token: str):
    token_data = tokens_db.get(token)
    if not token_data or token_data["type"] != "verification":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    user = users_db.get(token_data["user_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )
    
    # Verify email
    user["email_verified"] = True
    user["status"] = UserStatus.ACTIVE
    user["updated_at"] = datetime.utcnow()
    
    # Clean up token
    del tokens_db[token]
    
    return {"message": "Email verified successfully. You can now log in."}

@app.post("/auth/invite", response_model=dict)
async def invite_user(invite_data: InviteUser, current_user: dict = Depends(require_admin)):
    # Check if user exists
    for user in users_db.values():
        if user["email"] == invite_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
    
    # Create invited user
    user_id = f"user_{len(users_db) + 1:03d}"
    invitation_token = generate_token()
    
    invited_user = {
        "id": user_id,
        "email": invite_data.email,
        "first_name": invite_data.first_name,
        "last_name": invite_data.last_name,
        "institution": invite_data.institution,
        "role": invite_data.role,
        "status": UserStatus.PENDING_INVITATION,
        "email_verified": False,
        "password_hash": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_login": None,
        "invited_by": current_user["id"]
    }
    
    users_db[user_id] = invited_user
    tokens_db[invitation_token] = {"user_id": user_id, "type": "invitation"}
    
    # Mock email
    invitation_url = f"http://localhost:8000/auth/accept-invitation?token={invitation_token}"
    mock_send_email(
        invite_data.email,
        f"Invitation to join AlgaeTrack as {invite_data.role}",
        f"Accept invitation: {invitation_url}"
    )
    
    return {
        "message": f"Invitation sent to {invite_data.email}",
        "user_id": user_id,
        "invitation_token": invitation_token  # Solo para testing
    }

@app.post("/auth/accept-invitation", response_model=dict)
async def accept_invitation(accept_data: AcceptInvitation):
    token_data = tokens_db.get(accept_data.invitation_token)
    if not token_data or token_data["type"] != "invitation":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid invitation token"
        )
    
    user = users_db.get(token_data["user_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )
    
    # Accept invitation
    user["password_hash"] = get_password_hash(accept_data.password)
    user["status"] = UserStatus.ACTIVE
    user["email_verified"] = True
    user["updated_at"] = datetime.utcnow()
    
    # Clean up token
    del tokens_db[accept_data.invitation_token]
    
    return {
        "message": "Invitation accepted successfully. You can now log in.",
        "user_id": user["id"]
    }

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_active_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        first_name=current_user["first_name"],
        last_name=current_user["last_name"],
        institution=current_user["institution"],
        role=current_user["role"],
        status=current_user["status"],
        email_verified=current_user["email_verified"],
        created_at=current_user["created_at"],
        last_login=current_user["last_login"]
    )

@app.put("/auth/user/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: UserRole,
    current_user: dict = Depends(require_admin)
):
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    users_db[user_id]["role"] = new_role
    users_db[user_id]["updated_at"] = datetime.utcnow()
    
    return {"message": f"User role updated to {new_role}"}

@app.get("/auth/users")
async def get_all_users(current_user: dict = Depends(require_admin)):
    return [
        UserResponse(
            id=user["id"],
            email=user["email"],
            first_name=user["first_name"],
            last_name=user["last_name"],
            institution=user["institution"],
            role=user["role"],
            status=user["status"],
            email_verified=user["email_verified"],
            created_at=user["created_at"],
            last_login=user["last_login"]
        )
        for user in users_db.values()
    ]

# DEBUG ENDPOINTS (solo para testing)
@app.get("/debug/users")
async def debug_users():
    return {"users": list(users_db.values()), "tokens": list(tokens_db.keys())}

@app.get("/debug/reset")
async def debug_reset():
    global users_db, tokens_db
    users_db.clear()
    tokens_db.clear()
    await create_default_admin()
    return {"message": "Database reset, default admin recreated"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("test_main:app", host="0.0.0.0", port=8000, reload=True)