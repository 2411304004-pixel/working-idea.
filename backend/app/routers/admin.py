import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.database import get_database
from app.routers.auth import require_role
from app.models.schemas import (
    VehicleCreate, VehicleResponse,
    ThemeCreate, ThemeResponse,
    MenuItemCreate, MenuItemResponse,
    OfferBase, OfferResponse,
    BookingResponse
)

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(require_role(["admin"]))])

@router.get("/stats")
async def get_dashboard_stats():
    db = await get_database()
    
    all_bookings_cursor = db["bookings"].find({})
    bookings = await all_bookings_cursor.to_list(1000)
    
    total_bookings = len(bookings)
    completed_or_confirmed = [b for b in bookings if b.get("status") in ["confirmed", "completed", "in_progress"]]
    
    total_revenue_inr = sum(float(b.get("pricing", {}).get("total_inr", 0.0)) for b in completed_or_confirmed)
    active_rides = sum(1 for b in bookings if b.get("status") == "in_progress")
    upcoming_rides = sum(1 for b in bookings if b.get("status") == "confirmed")
    
    total_vehicles = await db["vehicles"].count_documents({})
    available_vehicles = await db["vehicles"].count_documents({"status": "available"})
    total_customers = await db["users"].count_documents({"role": "customer"})
    
    return {
        "total_revenue_inr": round(total_revenue_inr, 2),
        "total_bookings": total_bookings,
        "active_rides": active_rides,
        "upcoming_rides": upcoming_rides,
        "total_vehicles": total_vehicles,
        "available_vehicles": available_vehicles,
        "total_customers": total_customers,
        "recent_bookings": [
            {
                "id": b.get("_id"),
                "customer_id": b.get("user_id"),
                "theme_name": b.get("theme_name"),
                "scheduled_date": b.get("scheduled_date"),
                "total_inr": b.get("pricing", {}).get("total_inr"),
                "status": b.get("status"),
                "created_at": b.get("created_at")
            }
            for b in sorted(bookings, key=lambda x: str(x.get("created_at", "")), reverse=True)[:5]
        ]
    }

@router.get("/bookings", response_model=List[BookingResponse])
async def get_all_admin_bookings(status: Optional[str] = Query(None)):
    db = await get_database()
    query = {}
    if status and status != "all":
        query["status"] = status
    cursor = db["bookings"].find(query).sort("created_at", -1)
    bookings = await cursor.to_list(200)
    
    results = []
    for b in bookings:
        bd = dict(b)
        bd["id"] = bd.pop("_id")
        results.append(bd)
    return results

@router.patch("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, body: dict):
    new_status = body.get("status")
    allowed = ["pending_payment", "confirmed", "in_progress", "completed", "cancelled"]
    if new_status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of {allowed}")
        
    db = await get_database()
    result = await db["bookings"].update_one(
        {"_id": booking_id},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    return {"message": "Status updated successfully", "status": new_status}

# --- Vehicles CRUD ---
@router.post("/vehicles", response_model=VehicleResponse)
async def create_vehicle(v_in: VehicleCreate):
    db = await get_database()
    doc = v_in.dict()
    doc["_id"] = f"van-{uuid.uuid4().hex[:6]}"
    doc["created_at"] = datetime.utcnow()
    await db["vehicles"].insert_one(doc)
    doc["id"] = doc.pop("_id")
    return doc

@router.put("/vehicles/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(vehicle_id: str, v_in: VehicleCreate):
    db = await get_database()
    doc = v_in.dict()
    doc["updated_at"] = datetime.utcnow()
    await db["vehicles"].update_one({"_id": vehicle_id}, {"$set": doc})
    updated = await db["vehicles"].find_one({"_id": vehicle_id})
    if not updated:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    updated["id"] = updated.pop("_id")
    return updated

@router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str):
    db = await get_database()
    await db["vehicles"].delete_one({"_id": vehicle_id})
    return {"message": "Vehicle deleted"}

# --- Themes CRUD ---
@router.post("/themes", response_model=ThemeResponse)
async def create_theme(t_in: ThemeCreate):
    db = await get_database()
    doc = t_in.dict()
    doc["_id"] = f"theme-{uuid.uuid4().hex[:6]}"
    await db["themes"].insert_one(doc)
    doc["id"] = doc.pop("_id")
    return doc

@router.put("/themes/{theme_id}", response_model=ThemeResponse)
async def update_theme(theme_id: str, t_in: ThemeCreate):
    db = await get_database()
    doc = t_in.dict()
    await db["themes"].update_one({"_id": theme_id}, {"$set": doc})
    updated = await db["themes"].find_one({"_id": theme_id})
    if not updated:
        raise HTTPException(status_code=404, detail="Theme not found")
    updated["id"] = updated.pop("_id")
    return updated

# --- Menu Items CRUD ---
@router.post("/menu", response_model=MenuItemResponse)
async def create_menu_item(m_in: MenuItemCreate):
    db = await get_database()
    doc = m_in.dict()
    doc["_id"] = f"item-{uuid.uuid4().hex[:6]}"
    await db["menu_items"].insert_one(doc)
    doc["id"] = doc.pop("_id")
    return doc

@router.put("/menu/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(item_id: str, m_in: MenuItemCreate):
    db = await get_database()
    doc = m_in.dict()
    await db["menu_items"].update_one({"_id": item_id}, {"$set": doc})
    updated = await db["menu_items"].find_one({"_id": item_id})
    if not updated:
        raise HTTPException(status_code=404, detail="Menu item not found")
    updated["id"] = updated.pop("_id")
    return updated

@router.delete("/menu/{item_id}")
async def delete_menu_item(item_id: str):
    db = await get_database()
    await db["menu_items"].delete_one({"_id": item_id})
    return {"message": "Menu item deleted"}

# --- Offers CRUD ---
@router.post("/offers", response_model=OfferResponse)
async def create_offer(o_in: OfferBase):
    db = await get_database()
    doc = o_in.dict()
    doc["_id"] = f"offer-{uuid.uuid4().hex[:6]}"
    doc["times_used"] = 0
    await db["offers"].insert_one(doc)
    doc["id"] = doc.pop("_id")
    return doc

@router.delete("/offers/{offer_id}")
async def delete_offer(offer_id: str):
    db = await get_database()
    await db["offers"].delete_one({"_id": offer_id})
    return {"message": "Offer deleted"}
