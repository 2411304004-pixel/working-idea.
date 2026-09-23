from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.core.database import get_database
from app.models.schemas import VehicleResponse

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.get("", response_model=List[VehicleResponse])
async def get_all_vehicles(status: Optional[str] = Query(None)):
    db = await get_database()
    query = {}
    if status:
        query["status"] = status
    cursor = db["vehicles"].find(query)
    vehicles = await cursor.to_list(100)
    
    results = []
    for v in vehicles:
        vd = dict(v)
        vd["id"] = vd.pop("_id")
        results.append(vd)
    return results

@router.get("/slots")
async def get_slots_availability(date: str = Query(...)):
    # Standard time slots available for booking
    slots = [
        {"id": "slot-1", "time": "9:00 AM - 11:00 AM", "label": "Morning Artisan Flight", "available": True},
        {"id": "slot-2", "time": "11:30 AM - 1:30 PM", "label": "Midday Brunch & Pour-Over", "available": True},
        {"id": "slot-3", "time": "2:00 PM - 4:00 PM", "label": "Afternoon Refresh", "available": True},
        {"id": "slot-4", "time": "4:30 PM - 6:30 PM", "label": "Golden Hour & Sunset (Popular)", "available": True},
        {"id": "slot-5", "time": "7:00 PM - 9:00 PM", "label": "Twilight Starlit Experience", "available": True},
        {"id": "slot-6", "time": "9:30 PM - 11:30 PM", "label": "Late Night Comfort Cruise", "available": True}
    ]
    
    db = await get_database()
    # Check existing bookings on this date
    existing_cursor = db["bookings"].find({"scheduled_date": date, "status": {"$ne": "cancelled"}})
    existing = await existing_cursor.to_list(100)
    booked_slots = [b.get("scheduled_time_slot") for b in existing]
    
    for s in slots:
        if s["time"] in booked_slots:
            s["available"] = False
            
    return {"date": date, "slots": slots}

@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle_by_id(vehicle_id: str):
    db = await get_database()
    vehicle = await db["vehicles"].find_one({"_id": vehicle_id})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    vd = dict(vehicle)
    vd["id"] = vd.pop("_id")
    return vd
