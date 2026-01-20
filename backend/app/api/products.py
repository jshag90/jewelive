from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.services.product_service import ProductService
from app.services.ai_pricing_service import AIPricingService
from fastapi import UploadFile, File
from PIL import Image
import os
import uuid
import shutil
from app.schemas.product import ProductCreate, ProductResponse
from app.models.user import User

router = APIRouter()
product_service = ProductService()
ai_pricing_service = AIPricingService()
UPLOAD_DIR = "D:\\Dev\\EveryZoom\\uploads"

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    print(f"DEBUG: Starting upload for user {current_user.email}")
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_location = os.path.join(UPLOAD_DIR, filename)
    print(f"DEBUG: File location: {file_location}")

    # Save and resize
    try:
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        print("DEBUG: File saved successfully")
    except Exception as e:
        print(f"DEBUG: Error saving file: {e}")
        raise e
    
    # Resize image
    try:
        with Image.open(file_location) as img:
            img.thumbnail((800, 800))
            img.save(file_location)
        print("DEBUG: Image resized")
    except Exception as e:
        print(f"Error resizing image: {e}")

    # Predict price
    try:
        predicted_price = ai_pricing_service.predict_price(file_location)
        print(f"DEBUG: Predicted price: {predicted_price}")
    except Exception as e:
        print(f"DEBUG: Error predicting price: {e}")
        raise e

    return {
        "url": f"http://localhost:8000/uploads/{filename}",
        "predicted_price": predicted_price
    }

@router.get("/", response_model=List[ProductResponse])
def read_products(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    return product_service.get_products(db, skip=skip, limit=limit)

@router.get("/{product_id}", response_model=ProductResponse)
def read_product(
    product_id: int, 
    db: Session = Depends(get_db)
):
    return product_service.get_product(db, product_id)

@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return product_service.create_product(db, product, seller_id=current_user.id)
