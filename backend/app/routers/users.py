import uuid
from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_database
from app.routers.auth import get_current_user
from app.models.schemas import UserResponse, UserPreferences, UserSavedPaymentMethod

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    user = dict(current_user)
    user["id"] = user.pop("_id")
    user.pop("password_hash", None)
    return user

@router.put("/profile", response_model=UserResponse)
async def update_profile(updates: dict, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    allowed_fields = ["name", "phone", "preferences"]
    clean_updates = {k: v for k, v in updates.items() if k in allowed_fields}
    
    if clean_updates:
        await db["users"].update_one({"_id": current_user["_id"]}, {"$set": clean_updates})
    
    updated = await db["users"].find_one({"_id": current_user["_id"]})
    updated["id"] = updated.pop("_id")
    updated.pop("password_hash", None)
    return updated

@router.post("/save-theme/{theme_id}")
async def toggle_save_theme(theme_id: str, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    saved = list(current_user.get("saved_themes", []))
    if theme_id in saved:
        saved.remove(theme_id)
        msg = "Theme removed from saved"
    else:
        saved.append(theme_id)
        msg = "Theme saved"
    
    await db["users"].update_one({"_id": current_user["_id"]}, {"$set": {"saved_themes": saved}})
    return {"message": msg, "saved_themes": saved}

@router.post("/payment-methods")
async def add_payment_method(method: UserSavedPaymentMethod, current_user: dict = Depends(get_current_user)):
    db = await get_database()
    methods = list(current_user.get("saved_payment_methods", []))
    new_method = method.dict()
    new_method["id"] = f"pm-{uuid.uuid4().hex[:6]}"
    methods.append(new_method)
    await db["users"].update_one({"_id": current_user["_id"]}, {"$set": {"saved_payment_methods": methods}})
    return {"message": "Payment method added", "payment_methods": methods}
