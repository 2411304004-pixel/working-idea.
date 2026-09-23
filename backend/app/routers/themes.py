from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.core.database import get_database
from app.models.schemas import ThemeResponse

router = APIRouter(prefix="/themes", tags=["Themes"])

@router.get("", response_model=List[ThemeResponse])
async def get_all_themes(mood: Optional[str] = Query(None)):
    db = await get_database()
    query = {"is_active": True}
    if mood and mood.lower() != "all":
        query["mood_tags"] = {"$in": [mood]}
        
    cursor = db["themes"].find(query)
    themes = await cursor.to_list(100)
    
    results = []
    for t in themes:
        td = dict(t)
        td["id"] = td.pop("_id")
        results.append(td)
    return results

@router.get("/{theme_id}", response_model=ThemeResponse)
async def get_theme_by_id(theme_id: str):
    db = await get_database()
    theme = await db["themes"].find_one({"_id": theme_id})
    if not theme:
        # Also check by slug
        theme = await db["themes"].find_one({"slug": theme_id})
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    td = dict(theme)
    td["id"] = td.pop("_id")
    return td
