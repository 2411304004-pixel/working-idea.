from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.core.database import get_database
from app.models.schemas import MenuItemResponse

router = APIRouter(prefix="/menu", tags=["Menu"])

@router.get("", response_model=List[MenuItemResponse])
async def get_menu_items(
    category: Optional[str] = Query(None),
    veg_only: Optional[bool] = Query(None)
):
    db = await get_database()
    query = {"is_available": True}
    if category and category.lower() != "all items" and category.lower() != "all":
        query["category"] = category
    if veg_only:
        query["is_veg"] = True
        
    cursor = db["menu_items"].find(query)
    items = await cursor.to_list(100)
    
    results = []
    for i in items:
        idoc = dict(i)
        idoc["id"] = idoc.pop("_id")
        results.append(idoc)
    return results

@router.get("/categories")
async def get_categories():
    return [
        "All Items",
        "Coffee & Beverages",
        "Bakery & Desserts",
        "Breakfast",
        "Celebration Platters",
        "Cold Brew & Tonics"
    ]

@router.get("/{item_id}", response_model=MenuItemResponse)
async def get_menu_item(item_id: str):
    db = await get_database()
    item = await db["menu_items"].find_one({"_id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    idoc = dict(item)
    idoc["id"] = idoc.pop("_id")
    return idoc
