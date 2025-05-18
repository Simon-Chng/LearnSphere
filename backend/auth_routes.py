from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models
import auth
from database import get_db
from pydantic import BaseModel

router = APIRouter()

class UserCreate(BaseModel):
    """
    Schema for user registration input.
    """
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    """
    Schema for returning user details in responses.
    """
    username: str
    email: str
    is_admin: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    """
    Schema for token response after successful login.
    """
    access_token: str
    token_type: str

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user if the username or email does not already exist.

    Args:
        user (UserCreate): The user information from the request body.
        db (Session): SQLAlchemy database session.

    Returns:
        UserResponse: The created user details.
    """
    # Check if username or email already exists
    db_user = db.query(models.User).filter(
        (models.User.username == user.username) | 
        (models.User.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered"
        )
    
    # Create new user
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return a JWT access token upon successful login.

    Args:
        form_data (OAuth2PasswordRequestForm): The form data containing username and password.
        db (Session): SQLAlchemy database session.

    Returns:
        Token: The JWT access token and token type.
    """
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    """
    Retrieve the currently authenticated user's information.

    Args:
        current_user (models.User): The user retrieved from the access token.

    Returns:
        UserResponse: The current user's details.
    """
    return current_user
