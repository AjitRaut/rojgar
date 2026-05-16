from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.exceptions import ConflictError, NotFoundError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User, UserRole
from app.models.worker import WorkerProfile
from app.models.company import CompanyProfile
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, payload: RegisterRequest) -> AuthResponse:
        existing = self.db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise ConflictError("A user with this email already exists")

        if payload.phone:
            phone_exists = self.db.query(User).filter(User.phone == payload.phone).first()
            if phone_exists:
                raise ConflictError("A user with this phone number already exists")

        user = User(
            email=payload.email,
            password_hash=hash_password(payload.password),
            full_name=payload.full_name,
            phone=payload.phone,
            role=payload.role,
        )
        self.db.add(user)
        self.db.flush()

        if payload.role == UserRole.WORKER:
            self.db.add(WorkerProfile(user_id=user.id, skills=[]))
        elif payload.role == UserRole.COMPANY:
            self.db.add(
                CompanyProfile(
                    user_id=user.id,
                    company_name=payload.full_name,
                )
            )

        self.db.commit()
        self.db.refresh(user)
        return self._build_auth_response(user)

    def login(self, payload: LoginRequest) -> AuthResponse:
        user = self.db.query(User).filter(User.email == payload.email).first()
        if not user or not verify_password(payload.password, user.password_hash):
            raise UnauthorizedError("Invalid email or password")
        if not user.is_active:
            raise UnauthorizedError("Account is inactive. Contact support.")
        return self._build_auth_response(user)

    def refresh(self, refresh_token: str) -> TokenResponse:
        try:
            payload = decode_token(refresh_token)
        except ValueError as e:
            raise UnauthorizedError(str(e))

        if payload.get("type") != "refresh":
            raise UnauthorizedError("Invalid token type")

        user_id = int(payload.get("sub", 0))
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            raise UnauthorizedError("User not found or inactive")

        return self._build_tokens(user)

    def _build_tokens(self, user: User) -> TokenResponse:
        access = create_access_token(subject=str(user.id), role=user.role.value)
        refresh = create_refresh_token(subject=str(user.id), role=user.role.value)
        return TokenResponse(
            access_token=access,
            refresh_token=refresh,
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    def _build_auth_response(self, user: User) -> AuthResponse:
        return AuthResponse(
            user=UserResponse.model_validate(user),
            tokens=self._build_tokens(user),
        )
