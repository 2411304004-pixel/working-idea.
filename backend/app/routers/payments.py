import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, Form
from fastapi.responses import RedirectResponse
from app.core.config import settings
from app.core.database import get_database
from app.routers.auth import get_current_user
from app.models.schemas import PayUInitiateRequest, PayUInitiateResponse
from app.services.payment_service import (
    create_payu_request_payload,
    verify_payu_response_hash
)

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/payu/initiate", response_model=PayUInitiateResponse)
async def initiate_payu_payment(
    req: PayUInitiateRequest,
    current_user: dict = Depends(get_current_user)
):
    db = await get_database()
    booking = await db["bookings"].find_one({"_id": req.booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    if booking["user_id"] != current_user["_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to pay for this booking")
        
    total_amount = float(booking["pricing"]["total_inr"])
    
    payu_data = create_payu_request_payload(
        booking_id=booking["_id"],
        amount=total_amount,
        customer_name=current_user.get("name", "Sophia Vance"),
        customer_email=current_user.get("email", "sophia@example.com"),
        customer_phone=current_user.get("phone", "9820012345"),
        theme_name=booking.get("theme_name", "Artisanal Experience")
    )
    
    # Create or update pending payment record
    payment_id = f"pay-{uuid.uuid4().hex[:10]}"
    payment_doc = {
        "_id": payment_id,
        "booking_id": booking["_id"],
        "user_id": current_user["_id"],
        "gateway": "payu",
        "payu_txn_id": payu_data["txnid"],
        "amount_inr": total_amount,
        "status": "initiated",
        "raw_gateway_response": {},
        "created_at": datetime.utcnow()
    }
    await db["payments"].insert_one(payment_doc)
    await db["bookings"].update_one(
        {"_id": booking["_id"]},
        {"$set": {"payment_id": payment_id, "updated_at": datetime.utcnow()}}
    )
    
    return PayUInitiateResponse(**payu_data)

@router.post("/payu/callback")
async def payu_callback(request: Request):
    form_data = await request.form()
    data = dict(form_data)
    
    booking_id = data.get("udf1")
    txnid = data.get("txnid")
    status = data.get("status")
    
    db = await get_database()
    
    # Verify hash integrity
    is_valid_hash = verify_payu_response_hash(data)
    
    payment_status = "success" if (status == "success" and is_valid_hash) else "failed"
    
    if booking_id:
        new_booking_status = "confirmed" if payment_status == "success" else "pending_payment"
        await db["bookings"].update_one(
            {"_id": booking_id},
            {"$set": {"status": new_booking_status, "updated_at": datetime.utcnow()}}
        )
        if txnid:
            await db["payments"].update_one(
                {"payu_txn_id": txnid},
                {"$set": {
                    "status": payment_status,
                    "raw_gateway_response": data,
                    "updated_at": datetime.utcnow()
                }}
            )
            
    redirect_target = f"{settings.FRONTEND_URL}/checkout?status={payment_status}&booking_id={booking_id}&txnid={txnid}"
    return RedirectResponse(url=redirect_target, status_code=303)

@router.post("/simulate")
async def simulate_instant_payment(
    body: dict,
    current_user: dict = Depends(get_current_user)
):
    """Convenience endpoint for instantaneous checkout testing and demonstration without external PayU redirection"""
    booking_id = body.get("booking_id")
    simulate_status = body.get("status", "success")
    
    db = await get_database()
    booking = await db["bookings"].find_one({"_id": booking_id})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    payment_id = f"pay-{uuid.uuid4().hex[:10]}"
    txn_id = f"SIM_{uuid.uuid4().hex[:8].upper()}"
    
    payment_doc = {
        "_id": payment_id,
        "booking_id": booking_id,
        "user_id": current_user["_id"],
        "gateway": "payu",
        "payu_txn_id": txn_id,
        "amount_inr": booking["pricing"]["total_inr"],
        "status": simulate_status,
        "raw_gateway_response": {"simulation": True, "mode": "sandbox"},
        "created_at": datetime.utcnow()
    }
    await db["payments"].insert_one(payment_doc)
    
    new_status = "confirmed" if simulate_status == "success" else "pending_payment"
    await db["bookings"].update_one(
        {"_id": booking_id},
        {"$set": {
            "status": new_status,
            "payment_id": payment_id,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {
        "success": (simulate_status == "success"),
        "booking_id": booking_id,
        "payment_id": payment_id,
        "txnid": txn_id,
        "status": new_status,
        "message": f"Payment successfully simulated ({new_status})"
    }
