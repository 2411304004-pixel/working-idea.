from datetime import datetime
from typing import Dict, Any, Optional
from app.models.schemas import AIRecommendationResponse

def get_rule_based_recommendation(
    city: str = "Mumbai",
    current_hour: Optional[int] = None,
    weather_condition: Optional[str] = None,
    day_of_week: Optional[str] = None
) -> AIRecommendationResponse:
    now = datetime.now()
    hour = current_hour if current_hour is not None else now.hour
    day = day_of_week if day_of_week is not None else now.strftime("%A")
    
    # Defaults or simulated ambient weather based on season & time
    if not weather_condition:
        if 16 <= hour <= 19:
            weather_condition = "Golden Hour & Gentle Sea Breeze (27°C)"
        elif 20 <= hour or hour <= 4:
            weather_condition = "Starlit Cool Night (24°C)"
        elif 5 <= hour <= 11:
            weather_condition = "Crisp Morning Dew (25°C)"
        else:
            weather_condition = "Warm Sunlit Afternoon (31°C)"

    # Rule set:
    # 1. Friday/Saturday/Sunday Evening (16:00 - 20:00) -> Proposal & Sunset Romance or Golden Hour Birthday
    if 16 <= hour <= 19:
        return AIRecommendationResponse(
            suggested_theme_id="theme-romance",
            theme_name="Proposal & Sunset Romance",
            headline="Sunset Romance Along Marine Drive",
            message=f"Golden hour window active ({weather_condition}). Our fairy-lit caravan with acoustic vinyl is staged for twilight along coastal vantage points.",
            tag="Golden Hour Pick",
            weather_summary=weather_condition,
            reason="Optimal twilight lighting conditions and gentle sea breeze"
        )
    # 2. Weekend Daytime (11:00 - 16:00) -> Golden Hour Birthday / Festive
    elif day in ["Saturday", "Sunday"] and 11 <= hour < 16:
        return AIRecommendationResponse(
            suggested_theme_id="theme-birthday",
            theme_name="Golden Hour Birthday Celebration",
            headline="Weekend Birthday Caravan Experience",
            message="Celebrate milestones with friends! Includes ceremonial matcha bar, linen pennant bunting, and polaroid photo memories.",
            tag="Weekend Favorite",
            weather_summary=weather_condition,
            reason="Weekend social peak hours"
        )
    # 3. Morning (06:00 - 11:00) -> Executive Retreat / Chemex Pour-overs
    elif 6 <= hour < 12:
        return AIRecommendationResponse(
            suggested_theme_id="theme-retreat",
            theme_name="Executive Coastal Retreat",
            headline="Artisanal Morning Espresso Flight",
            message=f"Crisp early air ({weather_condition}). Experience 3 single-origin tasting flights with warm sourdough pastries and ultra-quiet solar power.",
            tag="Morning Brew Master",
            weather_summary=weather_condition,
            reason="Prime single-origin tasting temperature"
        )
    # 4. Late Evening / Night -> Comfort Drive & Sunset Cruise
    else:
        return AIRecommendationResponse(
            suggested_theme_id="theme-comfort",
            theme_name="Comfort Drive & Sunset Cruise",
            headline="Relaxing Nighttime Comfort Drive",
            message=f"Wind down the evening with warm cedar diffuser aroma, spiced chai bar, and plush wool throws on an unhurried scenic cruise.",
            tag="Cozy Evening Pick",
            weather_summary=weather_condition,
            reason="Quiet coastal roads and calming nighttime ambiance"
        )
