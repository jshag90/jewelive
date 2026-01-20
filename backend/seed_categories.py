from app.core.database import SessionLocal
from app.models.category import Category

def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Category).first():
            print("Categories already exist. Skipping seed.")
            return

        categories_data = {
            "반지": ["다이아몬드 반지", "커플링", "금반지", "은반지", "패션반지", "기타 반지"],
            "목걸이": ["금목걸이", "은목걸이", "다이아몬드 목걸이", "진주 목걸이", "펜던트", "기타 목걸이"],
            "귀걸이": ["피어싱", "귀걸이", "이어커프", "기타 귀걸이"],
            "팔찌/발찌": ["금팔찌", "은팔찌", "가죽팔찌", "발찌", "기타"],
            "기계/시계": ["명품시계", "패션시계", "시계 소품"],
            "원석/나석": ["다이아몬드", "진주", "유색보석", "기타"],
        }

        for main_cat_name, sub_cats in categories_data.items():
            main_cat = Category(name=main_cat_name)
            db.add(main_cat)
            db.flush() # Get the ID

            for sub_cat_name in sub_cats:
                sub_cat = Category(name=sub_cat_name, parent_id=main_cat.id)
                db.add(sub_cat)
        
        db.commit()
        print("Successfully seeded categories!")
    except Exception as e:
        print(f"Error seeding categories: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
