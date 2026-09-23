from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, EmailStr, Field

# --- User Schemas ---
class UserPreferences(BaseModel):
    favorite_cuisines: List[str] = []
    favorite_moods: List[str] = []
    notify_weather: bool = True
    notify_events: bool = True
    notify_day: bool = True

class UserSavedPaymentMethod(BaseModel):
    id: str
    type: str = "card" # card, upi, netbanking
    masked_details: str
    is_default: bool = False

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "customer" # "customer" | "admin" | "driver"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(UserBase):
    id: str
    saved_themes: List[str] = []
    saved_payment_methods: List[UserSavedPaymentMethod] = []
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    created_at: Optional[datetime] = None

# --- Vehicle Schemas ---
class Location(BaseModel):
    lat: float
    lng: float
    address: Optional[str] = None

class VehicleBase(BaseModel):
    name: str
    edition: str = "Classic Edition"
    seating_capacity: int = 6
    status: str = "available" # "available" | "on_ride" | "maintenance"
    current_location: Location = Field(default_factory=lambda: Location(lat=18.9220, lng=72.8347, address="Gateway of India, Mumbai"))
    render_image_url: str
    floor_plan_image_url: Optional[str] = None
    assigned_driver_id: Optional[str] = None
    features: List[str] = []
    hourly_rate_inr: float = 1200.0

class VehicleCreate(VehicleBase):
    pass

class VehicleResponse(VehicleBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# --- Theme Schemas ---
class ThemeAddOn(BaseModel):
    id: str
    name: str
    description: str
    price_inr: float
    type: str = "toggle" # "toggle" | "customizable"
    options: Optional[List[str]] = None
    selected_option: Optional[str] = None
    is_default: bool = False

class ThemeBase(BaseModel):
    name: str
    slug: str
    tagline: str = ""
    description: str
    mood_tags: List[str] = []
    base_price_inr: float = 4999.0 # Flat complete ride price covering first 10 km
    included_km: float = 10.0
    per_km_rate_inr: float = 8.0 # ₹8/km beyond 10 km
    hero_images: List[str] = []
    gallery_images: List[str] = []
    tour_360_url: Optional[str] = None
    staging_features: List[str] = []
    add_ons: List[ThemeAddOn] = []
    guest_capacity: str = "2-8 guests"
    is_active: bool = True

class ThemeCreate(ThemeBase):
    pass

class ThemeResponse(ThemeBase):
    id: str

# --- Menu Schemas ---
class MenuItemBase(BaseModel):
    name: str
    category: str # "Coffee & Beverages"|"Bakery & Desserts"|"Breakfast"|"Full Meals"|"Regional Cuisine"|"Vegan/Vegetarian"|"Kids Menu"
    description: str = ""
    price_inr: float
    is_veg: bool = True
    tags: List[str] = []
    image_url: str
    is_available: bool = True

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemResponse(MenuItemBase):
    id: str

# --- Booking & Pricing Schemas ---
class SelectedAddOn(BaseModel):
    name: str
    price_inr: float
    config: Optional[Dict[str, Any]] = None

class SelectedMenuItem(BaseModel):
    item_id: str
    name: str
    quantity: int = 1
    price_at_booking: float

class PricingBreakdown(BaseModel):
    base_price_inr: float
    included_km: float = 10.0
    actual_distance_km: float
    extra_km: float
    per_km_rate_inr: float = 8.0
    extra_km_charge_inr: float
    add_ons_total_inr: float
    menu_total_inr: float
    subtotal_inr: float
    tax_inr: float # 5% GST
    discount_inr: float = 0.0
    total_inr: float

class PricingCalculationRequest(BaseModel):
    theme_id: str
    pickup: Location
    destination: Location
    optional_stop: Optional[Location] = None
    selected_add_ons: List[SelectedAddOn] = []
    menu_items: List[SelectedMenuItem] = []
    coupon_code: Optional[str] = None

class BookingCreate(BaseModel):
    theme_id: str
    vehicle_id: Optional[str] = None
    pickup_location: Location
    destination: Location
    optional_stop: Optional[Location] = None
    selected_add_ons: List[SelectedAddOn] = []
    menu_items: List[SelectedMenuItem] = []
    guest_count: int = 2
    scheduled_date: str # YYYY-MM-DD
    scheduled_time_slot: str # e.g. "4:30 PM - 6:30 PM (Golden Hour)"
    special_requests: Optional[str] = None
    chalkboard_text: Optional[str] = None
    coupon_code: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    user_id: str
    theme_id: str
    theme_name: str
    vehicle_id: Optional[str] = None
    vehicle_name: Optional[str] = None
    driver_id: Optional[str] = None
    pickup_location: Location
    destination: Location
    optional_stop: Optional[Location] = None
    estimated_distance_km: float
    estimated_duration_min: int
    guest_count: int
    scheduled_date: str
    scheduled_time_slot: str
    selected_add_ons: List[SelectedAddOn]
    menu_items: List[SelectedMenuItem]
    pricing: PricingBreakdown
    status: str # "pending_payment"|"confirmed"|"in_progress"|"completed"|"cancelled"
    special_requests: Optional[str] = None
    chalkboard_text: Optional[str] = None
    payment_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# --- Payment Schemas ---
class PayUInitiateRequest(BaseModel):
    booking_id: str

class PayUInitiateResponse(BaseModel):
    key: str
    txnid: str
    amount: str
    productinfo: str
    firstname: str
    email: str
    phone: str
    surl: str
    furl: str
    hash: str
    action_url: str
    booking_id: str

class PaymentRecordResponse(BaseModel):
    id: str
    booking_id: str
    user_id: str
    gateway: str
    payu_txn_id: str
    amount_inr: float
    status: str
    created_at: datetime

# --- Offer Schemas ---
class OfferBase(BaseModel):
    code: str
    title: str
    description: str
    discount_type: str = "percentage" # "flat" | "percentage"
    value: float
    max_discount_inr: Optional[float] = None
    applicable_theme_ids: List[str] = []
    valid_to: str
    is_active: bool = True

class OfferResponse(OfferBase):
    id: str
    times_used: int = 0

# --- Live Ride Tracking Schemas ---
class DriverLocationUpdate(BaseModel):
    booking_id: str
    lat: float
    lng: float
    speed_kmh: Optional[float] = 30.0
    status: Optional[str] = "en_route" # "en_route" | "arrived_stop" | "serving" | "trip_ended"

class RideTrackingState(BaseModel):
    booking_id: str
    driver_location: Location
    progress_percent: float
    status: str
    eta_minutes: int
    speed_kmh: float
    updated_at: datetime

# --- AI Recommendation Schemas ---
class AIRecommendationResponse(BaseModel):
    suggested_theme_id: str
    theme_name: str
    headline: str
    message: str
    tag: str
    weather_summary: str
    reason: str
