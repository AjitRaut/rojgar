from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user (customer / worker / company)",
)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    return AuthService(db).register(payload)


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Login with email and password (JSON body)",
)
def login_json(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    return AuthService(db).login(payload)


@router.post(
    "/token",
    response_model=TokenResponse,
    summary="OAuth2 compatible login (form data) - for Swagger UI",
)
def login_form(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> TokenResponse:
    auth = AuthService(db).login(LoginRequest(email=form.username, password=form.password))
    return auth.tokens


@router.post("/refresh", response_model=TokenResponse, summary="Refresh access token")
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    return AuthService(db).refresh(payload.refresh_token)


@router.get("/me", response_model=UserResponse, summary="Get current authenticated user")
def me(user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(user)
