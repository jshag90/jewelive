from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserPublic

class ProductBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: int
    status: str = "AVAILABLE"
    images: Optional[str] = None
    category_main: Optional[str] = None
    category_medium: Optional[str] = None
    category_small: Optional[str] = None
    condition: Optional[str] = None
    tags: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    title: Optional[str] = None
    price: Optional[int] = None
    status: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    seller_id: int
    seller: Optional[UserPublic] = None
    views: int = 0
    likes: int = 0
    chat_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
