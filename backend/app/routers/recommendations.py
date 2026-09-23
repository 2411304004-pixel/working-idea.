from fastapi import APIRouter, Query
from typing import Optional
from app.models.schemas import AIRecommendationResponse
from app.services.recommendation_service import get_rule_based_recommendation

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=AIRecommendationResponse)
async def get_theme_recommendation(
    city: str = Query("Mumbai"),
    hour: Optional[int] = Query(None),
    weather: Optional[str] = Query(None)
):
    recommendation = get_rule_based_recommendation(
        city=city,
        current_hour=hour,
        weather_condition=weather
    )
    return recommendation
