from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repository.user import UserRepository
from app.schemas.user import UserCreate, Token
from app.core.security import verify_password, create_access_token
from datetime import timedelta

class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()

    def authenticate_user(self, db: Session, email: str, password: str):
        user = self.user_repo.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def register_user(self, db: Session, user: UserCreate):
        existing_user = self.user_repo.get_by_email(db, user.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        return self.user_repo.create(db, user)

    def login_access_token(self, db: Session, form_data):
        user = self.authenticate_user(db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=30) # Should verify config but hardcode default for safety or use settings
        # Import settings to use properly
        from app.core.config import settings
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        access_token = create_access_token(
            subject=user.email, expires_delta=access_token_expires
        )
        return Token(access_token=access_token, token_type="bearer")
