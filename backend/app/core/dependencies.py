from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id_raw = payload.get("sub")
        token_type = payload.get("type")
        if user_id_raw is None or token_type != "access":
            raise credentials_exc
        user_id = int(user_id_raw)
    except (ValueError, Exception):
        raise credentials_exc

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exc
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )
    return user


def require_roles(*roles: UserRole):
    def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied for this role",
            )
        return user

    return role_checker


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


def require_worker(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Worker access required",
        )
    return user


def require_company(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.COMPANY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company access required",
        )
    return user


def require_customer_or_company(user: User = Depends(get_current_user)) -> User:
    if user.role not in (UserRole.CUSTOMER, UserRole.COMPANY):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers or companies can perform this action",
        )
    return user
