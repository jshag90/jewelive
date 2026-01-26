from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repository.product import ProductRepository
from app.schemas.product import ProductCreate

class ProductService:
    def __init__(self):
        self.product_repo = ProductRepository()

    def get_products(self, db: Session, skip: int = 0, limit: int = 100):
        return self.product_repo.get_all(db, skip, limit)

    def get_product(self, db: Session, product_id: int):
        self.product_repo.increment_views(db, product_id)
        product = self.product_repo.get_by_id(db, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product

    def create_product(self, db: Session, product: ProductCreate, seller_id: int):
        return self.product_repo.create(db, product, seller_id)
