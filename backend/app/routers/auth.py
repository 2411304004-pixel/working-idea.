import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.core.database import get_database
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.models.schemas import UserCreate, UserLogin, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing"
        )
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token"
        )
    user_id = payload.get("sub")
    db = await get_database()
    user = await db["users"].find_one({"_id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found"
        )
    return user

def require_role(allowed_roles: list):
    async def role_checker(user: dict = Depends(get_current_user)):
        user_role = user.get("role", "customer")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {allowed_roles}"
            )
        return user
    return role_checker

@router.post("/register", response_model=TokenResponse)
async def register_user(user_in: UserCreate):
    db = await get_database()
    existing = await db["users"].find_one({"email": user_in.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )
    
    new_user = {
        "_id": f"user-{uuid.uuid4().hex[:8]}",
        "name": user_in.name,
        "email": user_in.email,
        "phone": user_in.phone or "",
        "password_hash": get_password_hash(user_in.password),
        "role": user_in.role or "customer",
        "saved_themes": [],
        "saved_payment_methods": [],
        "preferences": {
            "favorite_cuisines": [],
            "favorite_moods": [],
            "notify_weather": True,
            "notify_events": True,
            "notify_day": True
        },
        "created_at": datetime.utcnow()
    }
    await db["users"].insert_one(new_user)
    
    access_token = create_access_token(new_user["_id"], role=new_user["role"])
    refresh_token = create_refresh_token(new_user["_id"], role=new_user["role"])
    
    user_clean = dict(new_user)
    user_clean["id"] = user_clean.pop("_id")
    user_clean.pop("password_hash", None)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_clean
    )

@router.post("/login", response_model=TokenResponse)
async def login_user(credentials: UserLogin):
    db = await get_database()
    user = await db["users"].find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(user["_id"], role=user.get("role", "customer"))
    refresh_token = create_refresh_token(user["_id"], role=user.get("role", "customer"))
    
    user_clean = dict(user)
    user_clean["id"] = user_clean.pop("_id")
    user_clean.pop("password_hash", None)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_clean
    )

@router.post("/refresh")
async def refresh_access_token(body: dict):
    refresh_token = body.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Missing refresh token")
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    role = payload.get("role", "customer")
    new_access_token = create_access_token(user_id, role=role)
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    user_clean = dict(current_user)
    user_clean["id"] = user_clean.pop("_id")
    user_clean.pop("password_hash", None)
    return user_clean
