from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.repository.category import CategoryRepository
from app.schemas.category import CategoryResponse

router = APIRouter()
repository = CategoryRepository()

@router.get("/", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    # Fetch all categories and build hierarchy in memory for simplicity
    all_categories = repository.get_all(db)
    
    # Store categories in a map for easy access
    cat_map = {cat.id: CategoryResponse(id=cat.id, name=cat.name, parent_id=cat.parent_id, children=[]) for cat in all_categories}
    
    root_categories = []
    for cat in all_categories:
        res_cat = cat_map[cat.id]
        if cat.parent_id is None:
            root_categories.append(res_cat)
        else:
            parent = cat_map.get(cat.parent_id)
            if parent:
                parent.children.append(res_cat)
                
    return root_categories
