from fastapi import APIRouter, HTTPException
from app.core.database import get_database
from app.models.schemas import PricingCalculationRequest, PricingBreakdown
from app.services.pricing_service import calculate_pricing

router = APIRouter(prefix="/pricing", tags=["Pricing"])

@router.post("/calculate", response_model=PricingBreakdown)
async def get_live_pricing_quote(req: PricingCalculationRequest):
    db = await get_database()
    theme = await db["themes"].find_one({"_id": req.theme_id})
    if not theme:
        # Check by slug
        theme = await db["themes"].find_one({"slug": req.theme_id})
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
        
    offer = None
    if req.coupon_code:
        offer = await db["offers"].find_one({"code": req.coupon_code.upper().strip(), "is_active": True})
        
    breakdown = await calculate_pricing(
        theme=theme,
        pickup=req.pickup,
        destination=req.destination,
        optional_stop=req.optional_stop,
        selected_add_ons=req.selected_add_ons,
        menu_items=req.menu_items,
        offer=offer
    )
    return breakdown
