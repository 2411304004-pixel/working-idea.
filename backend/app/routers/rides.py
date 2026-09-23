import json
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from app.core.database import get_database
from app.models.schemas import DriverLocationUpdate, RideTrackingState, Location
from app.ws.connection_manager import ride_manager
from app.services.pricing_service import calculate_haversine_distance

router = APIRouter(prefix="/rides", tags=["Ride Tracking"])

@router.get("/{booking_id}/tracking")
async def get_ride_tracking(booking_id: str):
    db = await get_database()
    booking = await db["bookings"].find_one({"_id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    tracking = await db["ride_tracking"].find_one({"booking_id": booking_id})
    if not tracking:
        # Generate initial state based on pickup
        pickup = booking.get("pickup_location", {"lat": 18.9220, "lng": 72.8347, "address": "Pickup"})
        tracking = {
            "booking_id": booking_id,
            "driver_location": pickup,
            "progress_percent": 0.0 if booking.get("status") != "in_progress" else 35.0,
            "status": "en_route" if booking.get("status") == "in_progress" else "not_started",
            "eta_minutes": booking.get("estimated_duration_min", 40),
            "speed_kmh": 28.0,
            "updated_at": datetime.utcnow()
        }
    return tracking

@router.post("/driver/location")
async def update_driver_location(update: DriverLocationUpdate):
    db = await get_database()
    booking = await db["bookings"].find_one({"_id": update.booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    dest_dict = booking.get("destination", {"lat": 18.9894, "lng": 72.8296})
    dest_loc = Location(lat=dest_dict["lat"], lng=dest_dict["lng"])
    current_loc = Location(lat=update.lat, lng=update.lng)
    
    # Calculate remaining distance & ETA
    rem_dist_km = calculate_haversine_distance(current_loc, dest_loc)
    total_dist_km = booking.get("estimated_distance_km", 15.0)
    
    # Compute progress percentage (0 - 100)
    covered = max(0.0, total_dist_km - rem_dist_km)
    progress_percent = min(100.0, round((covered / max(1.0, total_dist_km)) * 100, 1))
    
    speed = update.speed_kmh or 30.0
    eta_min = int(max(2, (rem_dist_km / max(10.0, speed)) * 60))
    
    status_str = update.status or ("arrived" if rem_dist_km < 0.2 else "en_route")
    
    tracking_doc = {
        "booking_id": update.booking_id,
        "driver_location": {"lat": update.lat, "lng": update.lng},
        "progress_percent": progress_percent,
        "status": status_str,
        "eta_minutes": eta_min,
        "speed_kmh": speed,
        "updated_at": datetime.utcnow().isoformat()
    }
    
    # Persist
    await db["ride_tracking"].update_one(
        {"booking_id": update.booking_id},
        {"$set": tracking_doc},
    )
    # Also update booking status if en route
    if booking.get("status") == "confirmed" and status_str == "en_route":
        await db["bookings"].update_one(
            {"_id": update.booking_id},
            {"$set": {"status": "in_progress", "updated_at": datetime.utcnow()}}
        )
    
    # Broadcast to all connected customer WebSockets for this booking
    await ride_manager.broadcast_to_customers(update.booking_id, tracking_doc)
    return {"success": True, "state": tracking_doc}

@router.websocket("/ws/{booking_id}")
async def ride_websocket_endpoint(websocket: WebSocket, booking_id: str):
    # Determine client type from query param: ?client_type=driver or ?client_type=customer
    client_type = websocket.query_params.get("client_type", "customer")
    
    if client_type == "driver":
        await ride_manager.connect_driver(websocket, booking_id)
        try:
            while True:
                data = await websocket.receive_text()
                try:
                    payload = json.loads(data)
                    lat = float(payload.get("lat"))
                    lng = float(payload.get("lng"))
                    speed = float(payload.get("speed_kmh", 30.0))
                    status_text = payload.get("status", "en_route")
                    
                    update_obj = DriverLocationUpdate(
                        booking_id=booking_id,
                        lat=lat,
                        lng=lng,
                        speed_kmh=speed,
                        status=status_text
                    )
                    await update_driver_location(update_obj)
                except Exception as ex:
                    await websocket.send_text(json.dumps({"error": f"Invalid telemetry payload: {str(ex)}"}))
        except WebSocketDisconnect:
            ride_manager.disconnect_driver(booking_id)
    else:
        # Customer subscriber
        await ride_manager.connect_customer(websocket, booking_id)
        try:
            while True:
                # Keepalive ping/pong
                msg = await websocket.receive_text()
        except WebSocketDisconnect:
            ride_manager.disconnect_customer(websocket, booking_id)
