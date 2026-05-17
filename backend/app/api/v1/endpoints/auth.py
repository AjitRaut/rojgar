import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.security import hash_password
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.services.email_service import send_password_reset_email

logger = logging.getLogger(__name__)

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


def _create_password_reset_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "password_reset",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def _verify_password_reset_token(token: str) -> int:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid reset token")
        return int(user_id)
    except JWTError:
        raise HTTPException(status_code=400, detail="Reset link is invalid or expired")


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    summary="Request a password reset link (sends email if SMTP configured)",
)
def forgot_password(
    payload: ForgotPasswordRequest, db: Session = Depends(get_db)
) -> ForgotPasswordResponse:
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    generic_msg = ForgotPasswordResponse(
        message="If an account exists for that email, a reset link has been sent."
    )

    if not user or not user.is_active:
        return generic_msg

    token = _create_password_reset_token(user.id)
    reset_link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={token}"

    sent = send_password_reset_email(user.email, user.full_name, reset_link)

    if not sent and settings.is_dev:
        logger.info("Dev mode: password reset link for %s -> %s", user.email, reset_link)
        return ForgotPasswordResponse(
            message="Dev mode: SMTP not configured. Use the link below to reset your password.",
            dev_reset_link=reset_link,
        )

    return generic_msg


@router.post(
    "/reset-password",
    summary="Reset password using token from email",
)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> dict:
    user_id = _verify_password_reset_token(payload.token)
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password reset successfully"}