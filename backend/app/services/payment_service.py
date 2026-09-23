import hashlib
import uuid
from typing import Dict, Any
from app.core.config import settings

def generate_payu_hash(
    txnid: str,
    amount: float,
    productinfo: str,
    firstname: str,
    email: str,
    udf1: str = "",
    udf2: str = "",
    udf3: str = "",
    udf4: str = "",
    udf5: str = ""
) -> str:
    # Format amount with 2 decimal places
    amount_str = f"{amount:.2f}"
    hash_sequence = f"{settings.PAYU_MERCHANT_KEY}|{txnid}|{amount_str}|{productinfo}|{firstname}|{email}|{udf1}|{udf2}|{udf3}|{udf4}|{udf5}||||||{settings.PAYU_MERCHANT_SALT}"
    generated_hash = hashlib.sha512(hash_sequence.encode('utf-8')).hexdigest().lower()
    return generated_hash

def verify_payu_response_hash(response_data: Dict[str, Any]) -> bool:
    txnid = response_data.get("txnid", "")
    amount = response_data.get("amount", "")
    productinfo = response_data.get("productinfo", "")
    firstname = response_data.get("firstname", "")
    email = response_data.get("email", "")
    status = response_data.get("status", "")
    res_hash = response_data.get("hash", "")
    additional_charges = response_data.get("additionalCharges", "")
    
    udf1 = response_data.get("udf1", "")
    udf2 = response_data.get("udf2", "")
    udf3 = response_data.get("udf3", "")
    udf4 = response_data.get("udf4", "")
    udf5 = response_data.get("udf5", "")
    
    if additional_charges:
        hash_seq = f"{additional_charges}|{settings.PAYU_MERCHANT_SALT}|{status}||||||{udf5}|{udf4}|{udf3}|{udf2}|{udf1}|{email}|{firstname}|{productinfo}|{amount}|{txnid}|{settings.PAYU_MERCHANT_KEY}"
    else:
        hash_seq = f"{settings.PAYU_MERCHANT_SALT}|{status}||||||{udf5}|{udf4}|{udf3}|{udf2}|{udf1}|{email}|{firstname}|{productinfo}|{amount}|{txnid}|{settings.PAYU_MERCHANT_KEY}"
        
    calculated_hash = hashlib.sha512(hash_seq.encode('utf-8')).hexdigest().lower()
    return calculated_hash == res_hash.lower()

def create_payu_request_payload(
    booking_id: str,
    amount: float,
    customer_name: str,
    customer_email: str,
    customer_phone: str,
    theme_name: str
) -> Dict[str, Any]:
    txnid = f"COW_{uuid.uuid4().hex[:12].upper()}"
    productinfo = f"CafeOnWheels-{theme_name[:20]}"
    
    # Clean firstname
    firstname = customer_name.split()[0] if customer_name else "Guest"
    email = customer_email or "guest@cafeonwheels.com"
    phone = customer_phone or "9876543210"
    
    payu_hash = generate_payu_hash(
        txnid=txnid,
        amount=amount,
        productinfo=productinfo,
        firstname=firstname,
        email=email,
        udf1=booking_id
    )
    
    surl = f"{settings.FRONTEND_URL}/checkout?status=success&booking_id={booking_id}&txnid={txnid}"
    furl = f"{settings.FRONTEND_URL}/checkout?status=failure&booking_id={booking_id}&txnid={txnid}"
    
    return {
        "key": settings.PAYU_MERCHANT_KEY,
        "txnid": txnid,
        "amount": f"{amount:.2f}",
        "productinfo": productinfo,
        "firstname": firstname,
        "email": email,
        "phone": phone,
        "surl": surl,
        "furl": furl,
        "hash": payu_hash,
        "action_url": settings.PAYU_BASE_URL,
        "booking_id": booking_id,
        "udf1": booking_id
    }
