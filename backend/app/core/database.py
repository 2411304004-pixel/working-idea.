import asyncio
import json
import os
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
import motor.motor_asyncio
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.core.config import settings
from app.core.security import get_password_hash

class AsyncMockCursor:
    def __init__(self, items: List[Dict[str, Any]]):
        self.items = items
        self._index = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self._index < len(self.items):
            item = self.items[self._index]
            self._index += 1
            return item
        raise StopAsyncIteration

    async def to_list(self, length: Optional[int] = None):
        if length is not None:
            return self.items[:length]
        return self.items

    def sort(self, key_or_list, direction=1):
        # simple sort by key
        key = key_or_list if isinstance(key_or_list, str) else key_or_list[0][0]
        reverse = (direction == -1) if isinstance(direction, int) else (key_or_list[0][1] == -1)
        self.items.sort(key=lambda x: x.get(key, ""), reverse=reverse)
        return self

    def limit(self, n: int):
        self.items = self.items[:n]
        return self

    def skip(self, n: int):
        self.items = self.items[n:]
        return self

class InMemoryCollection:
    def __init__(self, name: str, storage: Dict[str, Dict[str, Any]]):
        self.name = name
        self.storage = storage

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for k, v in query.items():
            if k == "_id":
                if str(doc.get("_id")) != str(v):
                    return False
            elif isinstance(v, dict):
                if "$in" in v and doc.get(k) not in v["$in"]:
                    return False
                if "$ne" in v and doc.get(k) == v["$ne"]:
                    return False
            else:
                if doc.get(k) != v:
                    return False
        return True

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for doc in self.storage.values():
            if self._matches(doc, query):
                return dict(doc)
        return None

    def find(self, query: Optional[Dict[str, Any]] = None) -> AsyncMockCursor:
        query = query or {}
        results = [dict(doc) for doc in self.storage.values() if self._matches(doc, query)]
        return AsyncMockCursor(results)

    async def insert_one(self, doc: Dict[str, Any]):
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(uuid.uuid4())
        else:
            doc_copy["_id"] = str(doc_copy["_id"])
        self.storage[doc_copy["_id"]] = doc_copy
        class InsertResult:
            inserted_id = doc_copy["_id"]
        return InsertResult()

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        target_id = None
        for doc_id, doc in self.storage.items():
            if self._matches(doc, query):
                target_id = doc_id
                break
        
        class UpdateResult:
            matched_count = 1 if target_id else 0
            modified_count = 1 if target_id else 0

        if target_id:
            doc = self.storage[target_id]
            if "$set" in update:
                doc.update(update["$set"])
            if "$inc" in update:
                for k, v in update["$inc"].items():
                    doc[k] = doc.get(k, 0) + v
            self.storage[target_id] = doc
        return UpdateResult()

    async def delete_one(self, query: Dict[str, Any]):
        target_id = None
        for doc_id, doc in self.storage.items():
            if self._matches(doc, query):
                target_id = doc_id
                break
        if target_id:
            del self.storage[target_id]
        class DeleteResult:
            deleted_count = 1 if target_id else 0
        return DeleteResult()

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        query = query or {}
        return sum(1 for doc in self.storage.values() if self._matches(doc, query))

class ResilientDatabase:
    def __init__(self):
        self.is_real_mongo = False
        self.client = None
        self.db = None
        self._memory_data: Dict[str, Dict[str, Dict[str, Any]]] = {}

    def get_collection(self, name: str):
        if self.is_real_mongo and self.db is not None:
            return self.db[name]
        if name not in self._memory_data:
            self._memory_data[name] = {}
        return InMemoryCollection(name, self._memory_data[name])

    def __getitem__(self, name: str):
        return self.get_collection(name)

db_wrapper = ResilientDatabase()

async def init_db():
    global db_wrapper
    try:
        real_client = motor.motor_asyncio.AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=1500
        )
        # Verify connection
        await real_client.admin.command('ping')
        db_wrapper.client = real_client
        db_wrapper.db = real_client[settings.MONGODB_DB_NAME]
        db_wrapper.is_real_mongo = True
        print(f"Connected to live MongoDB at {settings.MONGODB_URI}")
    except Exception as e:
        db_wrapper.is_real_mongo = False
        print(f"Live MongoDB not available ({e}). Seamlessly using resilient async repository mode.")
    
    await seed_initial_data()

async def get_database():
    return db_wrapper

async def seed_initial_data():
    users_col = db_wrapper["users"]
    themes_col = db_wrapper["themes"]
    vehicles_col = db_wrapper["vehicles"]
    menu_col = db_wrapper["menu_items"]
    offers_col = db_wrapper["offers"]
    bookings_col = db_wrapper["bookings"]
    
    # 1. Seed Admin & Test Customer
    if await users_col.count_documents({}) == 0:
        admin_doc = {
            "_id": "user-admin-01",
            "name": "Artisan Admin",
            "email": "admin@cafeonwheels.com",
            "phone": "+91 98765 43210",
            "password_hash": get_password_hash("Admin@123"),
            "role": "admin",
            "saved_themes": [],
            "saved_payment_methods": [],
            "preferences": {
                "favorite_cuisines": ["Coffee", "Artisanal Bakery"],
                "favorite_moods": ["Romance", "Celebration"],
                "notify_weather": True,
                "notify_events": True,
                "notify_day": True
            },
            "created_at": datetime.utcnow()
        }
        customer_doc = {
            "_id": "user-customer-01",
            "name": "Sophia Vance",
            "email": "sophia@example.com",
            "phone": "+91 98200 12345",
            "password_hash": get_password_hash("Customer@123"),
            "role": "customer",
            "saved_themes": ["theme-romance", "theme-birthday"],
            "saved_payment_methods": [
                {"id": "pm-1", "type": "card", "masked_details": "HDFC Visa •••• 4242", "is_default": True}
            ],
            "preferences": {
                "favorite_cuisines": ["Single-Origin Pour Over", "Vegan Pastry"],
                "favorite_moods": ["Sunset Romance", "Acoustic"],
                "notify_weather": True,
                "notify_events": True,
                "notify_day": True
            },
            "created_at": datetime.utcnow()
        }
        driver_doc = {
            "_id": "user-driver-01",
            "name": "Kabir Sharma",
            "email": "driver@cafeonwheels.com",
            "phone": "+91 99887 76655",
            "password_hash": get_password_hash("Driver@123"),
            "role": "driver",
            "saved_themes": [],
            "saved_payment_methods": [],
            "preferences": {},
            "created_at": datetime.utcnow()
        }
        await users_col.insert_one(admin_doc)
        await users_col.insert_one(customer_doc)
        await users_col.insert_one(driver_doc)

    # 2. Seed Themes with complete pricing (First 10km included + ₹8/km)
    if await themes_col.count_documents({}) == 0:
        themes = [
            {
                "_id": "theme-romance",
                "name": "Proposal & Sunset Romance",
                "slug": "proposal-sunset-romance",
                "tagline": "Intimate fairy-lit coastal journey with chilled flutes & acoustic vinyl",
                "description": "An intimate, dreamy atmosphere with delicate woven warm Edison stringers, chilled flute glasses, fresh blush ranunculus floral bundles, and a handpicked acoustic playlist. Ideal for cliffside sunset dates and unforgettable proposals.",
                "mood_tags": ["Romance", "Golden Hour", "Acoustic", "Fairy Lights"],
                "base_price_inr": 4999.0, # Complete ride covers first 10 km
                "included_km": 10.0,
                "per_km_rate_inr": 8.0,
                "hero_images": [
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuD-OfQKReQi1BOpLB21SCGFfqwSQBx34egjRTROVe5sIUcN68Jn2K1-ny489QzOWPcM6EI7DXd-oIG-NW4aiWXBqobjS-6uK_m8TFonRn3u3jgjH1wswXiPuPJB76SPLXXl8k-a2JRj9apS-wsqJB8G_Rl2KqK5CbdPMOfqwKXeL8ZQmshZw8qOcu9VI887ybR75ci1yrrA-4htCBkvUsheqP3hcHiXbtoYRaaXFjpb4Gne6aeedWj5",
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDavVX1FZii_4Iq_Qe26MKlfIH_Fa99EJ1hYQz4AyyaPOBewMAASiZVvTAUqkfc3hrdlvDHoUFONLpeGXbzczAqJ2LCRowMWPB8MTISVQNHSL9EnSIw8KQBsqLvhBFrMpPTooEcvOjUCKLc7dWDasfmmxWEiyr4MV4TmqCSFd7Q2bnBB3y3Mb5W1nbhb9eDZLcOjunqbw8JE_CMzlxi0i8CdJaIT3bS_dJ7qkh6gckFvvpe3nWnWR_T"
                ],
                "gallery_images": [
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDavVX1FZii_4Iq_Qe26MKlfIH_Fa99EJ1hYQz4AyyaPOBewMAASiZVvTAUqkfc3hrdlvDHoUFONLpeGXbzczAqJ2LCRowMWPB8MTISVQNHSL9EnSIw8KQBsqLvhBFrMpPTooEcvOjUCKLc7dWDasfmmxWEiyr4MV4TmqCSFd7Q2bnBB3y3Mb5W1nbhb9eDZLcOjunqbw8JE_CMzlxi0i8CdJaIT3bS_dJ7qkh6gckFvvpe3nWnWR_T",
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDKZRPX0oFFQrB4LkYTwB18pZDgfcTdQW_PD5D44LVDaV8BvJTQRp8z9YVch_Eg01CbMZMP48VfGOMUrG1c646Zq9VNniXNVkFNF_D2VDauYjwPxYL4DEa8WAZWxL3srGPYcgkLjm5ebFClR4Iz01RMttSnPsfBU8VN6Va9DquUYyUkngiV4mHeS15k30CPnr4mfLssDM9k9G5uew0q7Pm5lkwKDwhkYA_wkfxsjNK6aKBxc3EPJbmj"
                ],
                "tour_360_url": "https://pannellum.org/images/alma.jpg",
                "staging_features": [
                    "Warm Edison Festoon Stringers",
                    "Blush Ranunculus Floral Displays",
                    "Champagne Flutes & Ice Chiller",
                    "Live Edge Cedar Bar Counter",
                    "Acoustic Audio Soundstage"
                ],
                "add_ons": [
                    {
                        "id": "addon-theatre",
                        "name": "Van-Side Mini Projector & Cinema Screen",
                        "description": "Ultra-quiet battery projector casting your personal video or photos on canvas",
                        "price_inr": 1299.0,
                        "type": "toggle",
                        "is_default": False
                    },
                    {
                        "id": "addon-roses",
                        "name": "Fresh Ecuadorian Rose Posies",
                        "description": "Artisan bouquet wrapped in natural kraft paper with wax seal",
                        "price_inr": 799.0,
                        "type": "toggle",
                        "is_default": True
                    },
                    {
                        "id": "addon-chalk",
                        "name": "Handwritten Chalkboard Signage",
                        "description": "Custom calligraphy message on reclaimed cedar display board",
                        "price_inr": 0.0,
                        "type": "customizable",
                        "options": ["Sarah & Mark's Forever Brew", "Happy Anniversary My Love", "Will You Marry Me?"],
                        "selected_option": "Sarah & Mark's Forever Brew",
                        "is_default": True
                    }
                ],
                "guest_capacity": "2-6 guests",
                "is_active": True
            },
            {
                "_id": "theme-birthday",
                "name": "Golden Hour Birthday Celebration",
                "slug": "golden-hour-birthday",
                "tagline": "Linen celebratory bunting, ceremonial matcha bar & vintage polaroid nook",
                "description": "Bright, uplifting celebratory atmosphere styled with organic linen bunting, custom balloon bouquets, specialty ceremonial matcha bar, and a polaroid memory station.",
                "mood_tags": ["Celebration", "Festive", "Matcha Bar", "Party"],
                "base_price_inr": 4499.0,
                "included_km": 10.0,
                "per_km_rate_inr": 8.0,
                "hero_images": [
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuA0RZ5k7V8l0GNPxtv2nR1wLCn30U_BYKQz-8orRVXDv59F4dmAHStn05UUWKYGpwN5mxaBC6fzXwc2rCTpZc3ijd5PLJUAYNd4iEGj6HRRXbhel7EUot6XIrRRLOJTiKfrJpUruKowkMVyLxFptmgimkuM8FKLqXcrRZxdPiwYWEU6MCfzfPy1gBUUXUj49DhswnOMpIhsQOuYIECZKgqz2qhZwwpm9cvOskERsBLu0nkY7sSzQASf"
                ],
                "gallery_images": [
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuA0RZ5k7V8l0GNPxtv2nR1wLCn30U_BYKQz-8orRVXDv59F4dmAHStn05UUWKYGpwN5mxaBC6fzXwc2rCTpZc3ijd5PLJUAYNd4iEGj6HRRXbhel7EUot6XIrRRLOJTiKfrJpUruKowkMVyLxFptmgimkuM8FKLqXcrRZxdPiwYWEU6MCfzfPy1gBUUXUj49DhswnOMpIhsQOuYIECZKgqz2qhZwwpm9cvOskERsBLu0nkY7sSzQASf"
                ],
                "tour_360_url": "https://pannellum.org/images/alma.jpg",
                "staging_features": [
                    "Linen Pennant Bunting",
                    "Ceremonial Matcha Whisk Bar",
                    "Polaroid Photo Nook with Props",
                    "Birthday Platter Staging"
                ],
                "add_ons": [
                    {
                        "id": "addon-cake",
                        "name": "Artisanal Basque Burnt Cheesecake (500g)",
                        "description": "Freshly baked organic vanilla bean cheesecake with sparkling candle",
                        "price_inr": 899.0,
                        "type": "toggle",
                        "is_default": False
                    },
                    {
                        "id": "addon-balloons",
                        "name": "Sage & Champagne Balloon Garland",
                        "description": "Biodegradable balloon arch styled over the serving counter",
                        "price_inr": 699.0,
                        "type": "customizable",
                        "options": ["Champagne & Peach", "Sage & White", "Earthy Terracotta & Cream"],
                        "selected_option": "Champagne & Peach",
                        "is_default": False
                    }
                ],
                "guest_capacity": "4-10 guests",
                "is_active": True
            },
            {
                "_id": "theme-retreat",
                "name": "Executive Coastal Retreat",
                "slug": "executive-coastal-retreat",
                "tagline": "Single-origin pour-over flights, artisanal canelés & silent solar power",
                "description": "Clean, elevated minimalism featuring single-origin flight pour-overs, freshly baked French canelés, and whisper-quiet solar lithium setup. Designed for team triumphs and strategic offsites.",
                "mood_tags": ["Executive", "Single Origin", "Quiet", "Work & Chill"],
                "base_price_inr": 5499.0,
                "included_km": 10.0,
                "per_km_rate_inr": 8.0,
                "hero_images": [
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuB1tDnGfIiJ0__zI8J2Kn7Ey-4BqoutANCkdnI2rxe0j7lLR5TCvGgFu-CL0J4i-l7a22XLQcVTAocNca-p1x9_RYVXNUy90fb6_1c0OkNc0Fg8e5MyCY36PV5DG2RXd8qOd-vh6BSIhlhrOL9WP8gdmim7tlxKY9TlTMNQAtIYbowikzfET_MA2NZL23PXH-9-rfk_AJRK_2DSw8Be9-F9gtlb7WJvENfjMWGTtzYE497ssteQOqqx"
                ],
                "gallery_images": [
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuB1tDnGfIiJ0__zI8J2Kn7Ey-4BqoutANCkdnI2rxe0j7lLR5TCvGgFu-CL0J4i-l7a22XLQcVTAocNca-p1x9_RYVXNUy90fb6_1c0OkNc0Fg8e5MyCY36PV5DG2RXd8qOd-vh6BSIhlhrOL9WP8gdmim7tlxKY9TlTMNQAtIYbowikzfET_MA2NZL23PXH-9-rfk_AJRK_2DSw8Be9-F9gtlb7WJvENfjMWGTtzYE497ssteQOqqx"
                ],
                "tour_360_url": "https://pannellum.org/images/alma.jpg",
                "staging_features": [
                    "Chemex Pour-Over Bar",
                    "Dual-Barista Pour Flight",
                    "Silent Lithium 2kW Inverter",
                    "Bespoke High-Top Folding Tables"
                ],
                "add_ons": [
                    {
                        "id": "addon-flight",
                        "name": "3-Origin Tasting Experience Flight",
                        "description": "Ethiopian Yirgacheffe, Colombian Geisha & Indian Chikmagalur estate tasting cards",
                        "price_inr": 1199.0,
                        "type": "toggle",
                        "is_default": True
                    }
                ],
                "guest_capacity": "6-12 guests",
                "is_active": True
            },
            {
                "_id": "theme-comfort",
                "name": "Comfort Drive & Sunset Cruise",
                "slug": "comfort-drive-sunset",
                "tagline": "Plush seating, warm chai & hot cocoa bar, serene coastal breeze",
                "description": "Cozy, relaxed wanderlust with plush wool throws, cedar aroma diffuser, artisanal hot chocolate and spiced masala chai bar. The ultimate de-stress scenic cruise.",
                "mood_tags": ["Comfort", "Cozy", "Scenic", "Sunset"],
                "base_price_inr": 4199.0,
                "included_km": 10.0,
                "per_km_rate_inr": 8.0,
                "hero_images": [
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDYQTAXNMAQw4N9AEuHXNTkL5ZReCfW_jSx7coUd59lmJ9x-E0OXRKEkyOqLCwVEKl9mhWWTOzpz3ENkeIlVUEyLfK_PFAI7WXurnM_IeFwVm8b4ZP3wLRxLquFbcyxsH5_y-tLnlp3OFy5Y5yjira07fqoFtpfxGCMf9013VwWHZpZS9MgNlWWerlNched1DjgwG11q-nEGCvQpzKbFSDHsKTbs4zjIi2XFP736ltGzSSqvqAAHxVP"
                ],
                "gallery_images": [
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDYQTAXNMAQw4N9AEuHXNTkL5ZReCfW_jSx7coUd59lmJ9x-E0OXRKEkyOqLCwVEKl9mhWWTOzpz3ENkeIlVUEyLfK_PFAI7WXurnM_IeFwVm8b4ZP3wLRxLquFbcyxsH5_y-tLnlp3OFy5Y5yjira07fqoFtpfxGCMf9013VwWHZpZS9MgNlWWerlNched1DjgwG11q-nEGCvQpzKbFSDHsKTbs4zjIi2XFP736ltGzSSqvqAAHxVP"
                ],
                "tour_360_url": "https://pannellum.org/images/alma.jpg",
                "staging_features": [
                    "Brass Lantern Warm Lighting",
                    "Wool Tartan Throws",
                    "Aromatherapy Cedar & Vanilla Diffuser",
                    "Acoustic Ambient Melodies"
                ],
                "add_ons": [
                    {
                        "id": "addon-marshmallows",
                        "name": "Artisanal Toasted Marshmallow Skewers",
                        "description": "Flame-toasted vanilla bean marshmallows served with dark cocoa",
                        "price_inr": 499.0,
                        "type": "toggle",
                        "is_default": False
                    }
                ],
                "guest_capacity": "2-6 guests",
                "is_active": True
            }
        ]
        for t in themes:
            await themes_col.insert_one(t)

    # 3. Seed Vehicles
    if await vehicles_col.count_documents({}) == 0:
        vehicles = [
            {
                "_id": "van-04",
                "name": "Artisan Van 04 — Teal Split-Screen",
                "edition": "1971 Classic Edition",
                "seating_capacity": 6,
                "status": "available",
                "current_location": {
                    "lat": 18.9220,
                    "lng": 72.8347,
                    "address": "Gateway of India, Colaba, Mumbai"
                },
                "render_image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAOVmCDlONL98fYktGJKvRDAFN4o6sbsaM-EZqfo8c5Mh-fBrjHQHzRFbcZ9aTqJZ54Tn5FWJnkqICGAX3c4vktqkBpx-lvJDk2TJqaN-35md_Xw-DlNVJCEO-l0rYWjOZ1urNqcoly_4umOuXEZ2ZFNHOzjwpzDDcsUBL_3IAVArokf72KpPlIHOnVIkJ8QzNk2nbYPGovUi2OReXG1w37k7ym73heJqah8VVN3U_0eZ3_efbRfin8",
                "floor_plan_image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDKZRPX0oFFQrB4LkYTwB18pZDgfcTdQW_PD5D44LVDaV8BvJTQRp8z9YVch_Eg01CbMZMP48VfGOMUrG1c646Zq9VNniXNVkFNF_D2VDauYjwPxYL4DEa8WAZWxL3srGPYcgkLjm5ebFClR4Iz01RMttSnPsfBU8VN6Va9DquUYyUkngiV4mHeS15k30CPnr4mfLssDM9k9G5uew0q7Pm5lkwKDwhkYA_wkfxsjNK6aKBxc3EPJbmj",
                "assigned_driver_id": "user-driver-01",
                "features": [
                    "15-80 Guests Capacity",
                    "Dual Group La Marzocco Linea PB",
                    "Silent Lithium 2kW Inverter",
                    "Awning & 3 Bistro Tables"
                ],
                "hourly_rate_inr": 1500.0
            },
            {
                "_id": "van-03",
                "name": "Artisan Van 03 — Sage Coastrunner",
                "edition": "1968 Vintage Edition",
                "seating_capacity": 6,
                "status": "available",
                "current_location": {
                    "lat": 19.0760,
                    "lng": 72.8777,
                    "address": "Bandra Bandstand, Mumbai"
                },
                "render_image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDKZRPX0oFFQrB4LkYTwB18pZDgfcTdQW_PD5D44LVDaV8BvJTQRp8z9YVch_Eg01CbMZMP48VfGOMUrG1c646Zq9VNniXNVkFNF_D2VDauYjwPxYL4DEa8WAZWxL3srGPYcgkLjm5ebFClR4Iz01RMttSnPsfBU8VN6Va9DquUYyUkngiV4mHeS15k30CPnr4mfLssDM9k9G5uew0q7Pm5lkwKDwhkYA_wkfxsjNK6aKBxc3EPJbmj",
                "assigned_driver_id": "user-driver-01",
                "features": [
                    "Vintage Mint Cream Joinery",
                    "Slayer 2-Group Custom Espresso Bar",
                    "Acoustic Bluetooth Vinyl Player",
                    "Handcrafted Cedar Bar Top"
                ],
                "hourly_rate_inr": 1800.0
            },
            {
                "_id": "van-07",
                "name": "Artisan Van 07 — Eco-Aero Lounge",
                "edition": "2024 Modern Electric",
                "seating_capacity": 7,
                "status": "available",
                "current_location": {
                    "lat": 18.9894,
                    "lng": 72.8296,
                    "address": "Worli Sea Face, Mumbai"
                },
                "render_image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuBd4x8gEmSdMYjZQ9VAGTj6XxvXyrRkqUW4nXAdfTaa8Qwn0iorQz2Aau1zQDF8OuYBwi5meVdQWW3S-XtxvCUGilJxsdKhkFkFF3Ye3PimI6Hq76Q-jS7EY1xZPuQ1e-WboI9T6Rsj8iiTVUuc1N111hIIIHvS4nbRHJj19bxNHwP1jjlUxV8yCq9MGbkO68IaKyeSLgGMmGzxqkStXyURR1Et13JwjbKcn1dHAyBZYYFdnw_AxrlQ",
                "assigned_driver_id": "user-driver-01",
                "features": [
                    "Zero Emission 100% Electric",
                    "Panoramic Glass Roof Canopy",
                    "Ultra-Quiet 0dB Whisper Bar",
                    "Lounge Booth for 7 Guests"
                ],
                "hourly_rate_inr": 2000.0
            }
        ]
        for v in vehicles:
            await vehicles_col.insert_one(v)

    # 4. Seed Menu Items
    if await menu_col.count_documents({}) == 0:
        menu_items = [
            {
                "_id": "item-01",
                "name": "Smoked Honey Cinnamon Cortado",
                "category": "Coffee & Beverages",
                "description": "Double shot single-origin espresso, velvety steamed oat milk, raw smoked Himalayan honey, toasted Ceylon cinnamon.",
                "price_inr": 349.0,
                "is_veg": True,
                "tags": ["Oat Milk", "Barista Special", "Bestseller"],
                "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAEtJBSmsqDmrElp_3F7e7rNaS8G61AZ5GgoEBojAhSZ3dCssDGqYgrUHI9jql6Awwm7sfNdTXu3aXZeI_wU7i2d8lmjfwDg5PDTPJ9-XHAhRmGsD0Bo6nVxaBeYvlNhsvBgdJcjWExkro3_ic_QrE44VuQyngIw0_M9EUI4NvDhmfykkuP28vjmkgTJivkPbSKJ74zfmU_hCWZbuk0WYsYAlBCpCdOOwUYZxFcjb1zaYnESdZP-UlG",
                "is_available": True
            },
            {
                "_id": "item-02",
                "name": "Cardamom Rose Infused Latte",
                "category": "Coffee & Beverages",
                "description": "Slow brewed espresso, crushed green cardamom pods, Damascus rose water mist, silky microfoam.",
                "price_inr": 379.0,
                "is_veg": True,
                "tags": ["Floral", "Signature"],
                "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuCNTpmAc-mDR14sWEUoHsMmxh3LN4IGJ2pAS0YaOw43J79mEwb0zu-llyG2w06Zl2PatkPP5T5HmSsMvZ9wYnq_4OaWYtkYsmODIBXucACVvPgwkW_MM9iTEUO3dj3hC2VxDXFrcgBPhsUmuN8kYZ-KtSHyx63SoDMYPbzBSqgj2BBs01cJiEE0LJAl8JNCA16Z-Tb4MBGLEhB_mqQ3NtobBfP20KVSVNYrXf98wQBQex_8F1XScxQY",
                "is_available": True
            },
            {
                "_id": "item-03",
                "name": "Ceremonial Uji Matcha Latte",
                "category": "Coffee & Beverages",
                "description": "First-harvest stone-ground Japanese ceremonial matcha, light agave nectar, steamed almond milk.",
                "price_inr": 420.0,
                "is_veg": True,
                "tags": ["Vegan", "Antioxidant"],
                "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuA0RZ5k7V8l0GNPxtv2nR1wLCn30U_BYKQz-8orRVXDv59F4dmAHStn05UUWKYGpwN5mxaBC6fzXwc2rCTpZc3ijd5PLJUAYNd4iEGj6HRRXbhel7EUot6XIrRRLOJTiKfrJpUruKowkMVyLxFptmgimkuM8FKLqXcrRZxdPiwYWEU6MCfzfPy1gBUUXUj49DhswnOMpIhsQOuYIECZKgqz2qhZwwpm9cvOskERsBLu0nkY7sSzQASf",
                "is_available": True
            },
            {
                "_id": "item-04",
                "name": "Cold Brew Tonic & Blood Orange",
                "category": "Coffee & Beverages",
                "description": "18-hour steeped Chikmagalur cold brew, artisanal elderflower tonic, dehydrated blood orange wheel.",
                "price_inr": 389.0,
                "is_veg": True,
                "tags": ["Refreshing", "Zero Sugar Opt"],
                "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuB1tDnGfIiJ0__zI8J2Kn7Ey-4BqoutANCkdnI2rxe0j7lLR5TCvGgFu-CL0J4i-l7a22XLQcVTAocNca-p1x9_RYVXNUy90fb6_1c0OkNc0Fg8e5MyCY36PV5DG2RXd8qOd-vh6BSIhlhrOL9WP8gdmim7tlxKY9TlTMNQAtIYbowikzfET_MA2NZL23PXH-9-rfk_AJRK_2DSw8Be9-F9gtlb7WJvENfjMWGTtzYE497ssteQOqqx",
                "is_available": True
            },
            {
                "_id": "item-05",
                "name": "Sourdough Croissant & Wild Berry Preserves",
                "category": "Bakery & Desserts",
                "description": "French laminated 72-hour sourdough butter croissant served warm with house-made alpine blackberry jam.",
                "price_inr": 299.0,
                "is_veg": True,
                "tags": ["Freshly Baked", "Artisan"],
                "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuANKJQPSNiIZYnJonQooGn0nlDSsLPcFSa4HsF1H0bt2IpwP74pAF55decZ2YISZ1zrZKzBPfqyhWnoZ7x4J0281J2BM839KaetQW3KJdiL0jFR2A-hfLtmdmhVudM5WeXxF1eV6ahGMYx4KD5BbJWdA2iSunxwS8DaCRa0ERQc7NhOAPrAeJI4_h2Qir8zFKhyeHt8nw-JNvM9DM5lkK-pqmDNjL2zsTNrQke5Zl2C0xOI-r0CKKpL",
                "is_available": True
            },
            {
                "_id": "item-06",
                "name": "Celebration Patisserie Board",
                "category": "Bakery & Desserts",
                "description": "Curated tasting board with 2 Madagascar vanilla canelés, 2 pistachio macarons, and salted dark chocolate truffles.",
                "price_inr": 799.0,
                "is_veg": True,
                "tags": ["Sharing", "Celebration"],
                "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuDYQTAXNMAQw4N9AEuHXNTkL5ZReCfW_jSx7coUd59lmJ9x-E0OXRKEkyOqLCwVEKl9mhWWTOzpz3ENkeIlVUEyLfK_PFAI7WXurnM_IeFwVm8b4ZP3wLRxLquFbcyxsH5_y-tLnlp3OFy5Y5yjira07fqoFtpfxGCMf9013VwWHZpZS9MgNlWWerlNched1DjgwG11q-nEGCvQpzKbFSDHsKTbs4zjIi2XFP736ltGzSSqvqAAHxVP",
                "is_available": True
            }
        ]
        for item in menu_items:
            await menu_col.insert_one(item)

    # 5. Seed Offers
    if await offers_col.count_documents({}) == 0:
        offers = [
            {
                "_id": "offer-welcome",
                "code": "WHEELS500",
                "title": "Welcome Journey ₹500 Off",
                "description": "Flat ₹500 off on your first artisanal cafe on wheels booking",
                "discount_type": "flat",
                "value": 500.0,
                "applicable_theme_ids": [],
                "valid_to": "2026-12-31",
                "times_used": 14,
                "is_active": True
            },
            {
                "_id": "offer-sunset",
                "code": "GOLDEN15",
                "title": "Golden Hour Special 15%",
                "description": "15% discount up to ₹1,000 for romantic and sunset drives",
                "discount_type": "percentage",
                "value": 15.0,
                "max_discount_inr": 1000.0,
                "applicable_theme_ids": ["theme-romance", "theme-birthday"],
                "valid_to": "2026-12-31",
                "times_used": 28,
                "is_active": True
            }
        ]
        for off in offers:
            await offers_col.insert_one(off)

    # 6. Seed Sample Booking for Sophia (so live tracking & dashboard have real data immediately!)
    if await bookings_col.count_documents({}) == 0:
        sample_booking = {
            "_id": "booking-demo-01",
            "user_id": "user-customer-01",
            "theme_id": "theme-romance",
            "theme_name": "Proposal & Sunset Romance",
            "vehicle_id": "van-04",
            "vehicle_name": "Artisan Van 04 — Teal Split-Screen",
            "driver_id": "user-driver-01",
            "pickup_location": {
                "lat": 18.9220,
                "lng": 72.8347,
                "address": "Gateway of India, Colaba, Mumbai"
            },
            "destination": {
                "lat": 18.9894,
                "lng": 72.8296,
                "address": "Worli Sea Face, Mumbai"
            },
            "optional_stop": {
                "lat": 18.9442,
                "lng": 72.8234,
                "address": "Marine Drive Promenade (Pour-Over Stopover)"
            },
            "estimated_distance_km": 14.8,
            "estimated_duration_min": 45,
            "guest_count": 2,
            "scheduled_date": "2026-09-24",
            "scheduled_time_slot": "4:30 PM - 6:30 PM (Golden Hour)",
            "selected_add_ons": [
                {"name": "Fresh Ecuadorian Rose Posies", "price_inr": 799.0, "config": {}},
                {"name": "Handwritten Chalkboard Signage", "price_inr": 0.0, "config": {"text": "Sarah & Mark's Forever Brew"}}
            ],
            "menu_items": [
                {"item_id": "item-01", "name": "Smoked Honey Cinnamon Cortado", "quantity": 2, "price_at_booking": 349.0},
                {"item_id": "item-06", "name": "Celebration Patisserie Board", "quantity": 1, "price_at_booking": 799.0}
            ],
            "pricing": {
                "base_price_inr": 4999.0, # covers first 10 km
                "included_km": 10.0,
                "actual_distance_km": 14.8,
                "extra_km": 4.8,
                "per_km_rate_inr": 8.0,
                "extra_km_charge_inr": 38.4,
                "add_ons_total_inr": 799.0,
                "menu_total_inr": 1497.0,
                "subtotal_inr": 7333.4,
                "tax_inr": 366.67,
                "discount_inr": 500.0,
                "total_inr": 7200.0
            },
            "status": "confirmed", # confirmed, can be tracked
            "special_requests": "Play warm acoustic vinyl upon parking at Marine Drive.",
            "chalkboard_text": "Sarah & Mark's Forever Brew",
            "payment_id": "pay-demo-01",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await bookings_col.insert_one(sample_booking)
