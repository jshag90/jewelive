from pydantic import BaseModel
from typing import List, Optional

class CategoryBase(BaseModel):
    name: str
    parent_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategorySimple(BaseModel):
    id: int
    name: str

class CategoryResponse(CategorySimple):
    parent_id: Optional[int] = None
    children: List['CategoryResponse'] = []

    class Config:
        from_attributes = True

# Required for recursive children list
CategoryResponse.model_rebuild()
