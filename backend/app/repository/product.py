from sqlalchemy.orm import Session, joinedload
from app.models.product import Product
from app.schemas.product import ProductCreate

class ProductRepository:
    def get_all(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(Product).options(joinedload(Product.seller)).offset(skip).limit(limit).all()

    def get_by_id(self, db: Session, product_id: int):
        return db.query(Product).options(joinedload(Product.seller)).filter(Product.id == product_id).first()

    def create(self, db: Session, product: ProductCreate, seller_id: int):
        db_product = Product(
            **product.model_dump(),
            seller_id=seller_id
        )
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    
    def delete(self, db: Session, product_id: int):
        db.query(Product).filter(Product.id == product_id).delete()
        db.commit()

    def increment_views(self, db: Session, product_id: int):
        db.query(Product).filter(Product.id == product_id).update({Product.views: Product.views + 1})
        db.commit()
