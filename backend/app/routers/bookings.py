import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.database import get_database
from app.routers.auth import get_current_user
from app.models.schemas import BookingCreate, BookingResponse, PricingBreakdown
from app.services.pricing_service import calculate_pricing

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("", response_model=BookingResponse)
async def create_booking(
    booking_in: BookingCreate,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    theme = await db["themes"].find_one({"_id": booking_in.theme_id})
    if not theme:
        theme = await db["themes"].find_one({"slug": booking_in.theme_id})
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
        
    vehicle = None
    if booking_in.vehicle_id:
        vehicle = await db["vehicles"].find_one({"_id": booking_in.vehicle_id})
    if not vehicle:
        # Assign first available vehicle
        vehicle = await db["vehicles"].find_one({"status": "available"})
        
    offer = None
    if booking_in.coupon_code:
        offer = await db["offers"].find_one({"code": booking_in.coupon_code.upper().strip(), "is_active": True})
        
    pricing = await calculate_pricing(
        theme=theme,
        pickup=booking_in.pickup_location,
        destination=booking_in.destination,
        optional_stop=booking_in.optional_stop,
        selected_add_ons=booking_in.selected_add_ons,
        menu_items=booking_in.menu_items,
        offer=offer
    )
    
    booking_id = f"booking-{uuid.uuid4().hex[:10]}"
    doc = {
        "_id": booking_id,
        "user_id": current_user["_id"],
        "theme_id": theme["_id"],
        "theme_name": theme["name"],
        "vehicle_id": vehicle["_id"] if vehicle else None,
        "vehicle_name": vehicle["name"] if vehicle else "Artisan Van 04 — Teal Split-Screen",
        "driver_id": vehicle.get("assigned_driver_id") if vehicle else "user-driver-01",
        "pickup_location": booking_in.pickup_location.dict(),
        "destination": booking_in.destination.dict(),
        "optional_stop": booking_in.optional_stop.dict() if booking_in.optional_stop else None,
        "estimated_distance_km": pricing.actual_distance_km,
        "estimated_duration_min": int(max(30, pricing.actual_distance_km * 2.8)),
        "guest_count": booking_in.guest_count,
        "scheduled_date": booking_in.scheduled_date,
        "scheduled_time_slot": booking_in.scheduled_time_slot,
        "selected_add_ons": [a.dict() for a in booking_in.selected_add_ons],
        "menu_items": [m.dict() for m in booking_in.menu_items],
        "pricing": pricing.dict(),
        "status": "pending_payment",
        "special_requests": booking_in.special_requests or "",
        "chalkboard_text": booking_in.chalkboard_text or "Curated Coffee Experience",
        "payment_id": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db["bookings"].insert_one(doc)
    
    res = dict(doc)
    res["id"] = res.pop("_id")
    return res

@router.get("", response_model=List[BookingResponse])
async def get_my_bookings(
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    query = {"user_id": current_user["_id"]}
    if status:
        query["status"] = status
    cursor = db["bookings"].find(query).sort("created_at", -1)
    bookings = await cursor.to_list(100)
    
    results = []
    for b in bookings:
        bd = dict(b)
        bd["id"] = bd.pop("_id")
        results.append(bd)
    return results

@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking_by_id(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    booking = await db["bookings"].find_one({"_id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Check authorization (admin, driver, or owner)
    if current_user["role"] not in ["admin", "driver"] and booking["user_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this booking")
        
    bd = dict(booking)
    bd["id"] = bd.pop("_id")
    return bd

@router.patch("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    booking = await db["bookings"].find_one({"_id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if current_user["role"] != "admin" and booking["user_id"] != current_user["_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")
        
    if booking["status"] in ["completed", "in_progress"]:
        raise HTTPException(status_code=400, detail="Cannot cancel an active or completed journey")
        
    await db["bookings"].update_one(
        {"_id": booking_id},
        {"$set": {"status": "cancelled", "updated_at": datetime.utcnow()}}
    )
    return {"message": "Booking successfully cancelled", "status": "cancelled"}
