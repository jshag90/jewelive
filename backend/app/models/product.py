from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class ProductStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    RESERVED = "RESERVED"
    SOLD = "SOLD"

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Integer, nullable=False) # KRW usually without decimals
    status = Column(String(50), default=ProductStatus.AVAILABLE, nullable=False)
    images = Column(Text, nullable=True) # Stored as JSON string
    
    # New Fields
    category_main = Column(String(100), nullable=True)
    category_medium = Column(String(100), nullable=True)
    category_small = Column(String(100), nullable=True)
    condition = Column(String(50), nullable=True)
    tags = Column(Text, nullable=True) # JSON or comma-separated
    
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    chat_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    seller = relationship("User", backref="products")
