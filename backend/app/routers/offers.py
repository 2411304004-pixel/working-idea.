from typing import List
from fastapi import APIRouter, HTTPException
from app.core.database import get_database
from app.models.schemas import OfferResponse

router = APIRouter(prefix="/offers", tags=["Offers"])

@router.get("", response_model=List[OfferResponse])
async def get_active_offers():
    db = await get_database()
    cursor = db["offers"].find({"is_active": True})
    offers = await cursor.to_list(100)
    
    results = []
    for o in offers:
        od = dict(o)
        od["id"] = od.pop("_id")
        results.append(od)
    return results

@router.get("/validate/{code}")
async def validate_offer_code(code: str):
    db = await get_database()
    offer = await db["offers"].find_one({"code": code.upper().strip(), "is_active": True})
    if not offer:
        raise HTTPException(status_code=404, detail="Invalid or expired promo code")
    od = dict(offer)
    od["id"] = od.pop("_id")
    return {"valid": True, "offer": od}
