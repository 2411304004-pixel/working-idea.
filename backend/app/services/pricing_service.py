import math
from typing import Optional, List, Dict, Any
from app.models.schemas import Location, SelectedAddOn, SelectedMenuItem, PricingBreakdown

def calculate_haversine_distance(loc1: Location, loc2: Location) -> float:
    # Earth radius in kilometers
    R = 6371.0
    lat1_rad = math.radians(loc1.lat)
    lon1_rad = math.radians(loc1.lng)
    lat2_rad = math.radians(loc2.lat)
    lon2_rad = math.radians(loc2.lng)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    # Adjust straight-line distance to practical road distance by a 1.28 factor
    road_distance = distance * 1.28
    return max(1.0, round(road_distance, 1))

def calculate_total_distance(pickup: Location, destination: Location, optional_stop: Optional[Location] = None) -> float:
    if optional_stop:
        leg1 = calculate_haversine_distance(pickup, optional_stop)
        leg2 = calculate_haversine_distance(optional_stop, destination)
        return round(leg1 + leg2, 1)
    return calculate_haversine_distance(pickup, destination)

async def calculate_pricing(
    theme: Dict[str, Any],
    pickup: Location,
    destination: Location,
    optional_stop: Optional[Location],
    selected_add_ons: List[SelectedAddOn],
    menu_items: List[SelectedMenuItem],
    offer: Optional[Dict[str, Any]] = None
) -> PricingBreakdown:
    base_price = float(theme.get("base_price_inr", 4999.0))
    included_km = float(theme.get("included_km", 10.0))
    per_km_rate = float(theme.get("per_km_rate_inr", 8.0))
    
    # Calculate distance
    actual_distance = calculate_total_distance(pickup, destination, optional_stop)
    extra_km = max(0.0, round(actual_distance - included_km, 1))
    extra_km_charge = round(extra_km * per_km_rate, 2)
    
    # Add-ons total
    add_ons_total = sum(float(addon.price_inr) for addon in selected_add_ons)
    
    # Menu total
    menu_total = sum(float(item.price_at_booking) * item.quantity for item in menu_items)
    
    subtotal = base_price + extra_km_charge + add_ons_total + menu_total
    
    # Discount calculation if coupon valid
    discount = 0.0
    if offer and offer.get("is_active"):
        dtype = offer.get("discount_type", "flat")
        val = float(offer.get("value", 0.0))
        if dtype == "flat":
            discount = min(subtotal, val)
        elif dtype == "percentage":
            calc_disc = subtotal * (val / 100.0)
            max_disc = offer.get("max_discount_inr")
            if max_disc:
                discount = min(calc_disc, float(max_disc))
            else:
                discount = calc_disc
    discount = round(discount, 2)
    
    # Tax: 5% GST on (subtotal - discount)
    taxable_amount = max(0.0, subtotal - discount)
    tax = round(taxable_amount * 0.05, 2)
    total = round(taxable_amount + tax, 2)
    
    return PricingBreakdown(
        base_price_inr=base_price,
        included_km=included_km,
        actual_distance_km=actual_distance,
        extra_km=extra_km,
        per_km_rate_inr=per_km_rate,
        extra_km_charge_inr=extra_km_charge,
        add_ons_total_inr=round(add_ons_total, 2),
        menu_total_inr=round(menu_total, 2),
        subtotal_inr=round(subtotal, 2),
        tax_inr=tax,
        discount_inr=discount,
        total_inr=total
    )
