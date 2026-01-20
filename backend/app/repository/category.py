from sqlalchemy.orm import Session
from app.models.category import Category

class CategoryRepository:
    def get_root_categories(self, db: Session):
        return db.query(Category).filter(Category.parent_id == None).all()

    def get_all(self, db: Session):
        return db.query(Category).all()

    def create(self, db: Session, name: str, parent_id: int = None):
        db_category = Category(name=name, parent_id=parent_id)
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category
