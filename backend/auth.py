import os
import datetime
import bcrypt
import jwt
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from database import get_db
from models import AdminUser

load_dotenv()

# Superadmin fallback environment configuration
DEFAULT_SUPERADMIN_USERNAME = os.getenv("SUPERADMIN_USERNAME", "admin")
DEFAULT_HASH = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode("utf-8")
DEFAULT_SUPERADMIN_PASSWORD_HASH = os.getenv("SUPERADMIN_PASSWORD_HASH", DEFAULT_HASH)

# JWT configuration
SECRET_KEY = os.getenv("JWT_SECRET", "cyber-neon-portfolio-admin-supersecret-jwt-key-2026!#$")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours

security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hashes a password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_or_create_default_admin(db: Session) -> AdminUser:
    """Initializes default superadmin record in database if none exists."""
    admin = db.query(AdminUser).first()
    if not admin:
        admin = AdminUser(
            username=DEFAULT_SUPERADMIN_USERNAME,
            password_hash=DEFAULT_SUPERADMIN_PASSWORD_HASH
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print(f"[Security] Seeded initial Superadmin identity: '{admin.username}'")
    return admin

def authenticate_superadmin(db: Session, username: str, password: str) -> Optional[AdminUser]:
    """Validates superadmin credentials against the database."""
    admin = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not admin:
        # Fallback check on first boot if table was just created
        if db.query(AdminUser).count() == 0:
            get_or_create_default_admin(db)
            admin = db.query(AdminUser).filter(AdminUser.username == username).first()

    if not admin:
        return None

    if not verify_password(password, admin.password_hash):
        return None

    return admin

def create_access_token(data: dict, expires_delta: datetime.timedelta = None) -> str:
    """Creates a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """Decodes and validates a JWT access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token has expired. Please authenticate again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> dict:
    """FastAPI dependency to protect endpoints and fetch active Superadmin."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    username: str = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token: missing subject.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    admin = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate superadmin credentials from active database records.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "id": admin.id,
        "username": admin.username,
        "role": "superadmin",
        "user_obj": admin
    }

def get_current_user_or_token_query(
    token: Optional[str] = None,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> dict:
    """
    FastAPI dependency that authenticates Superadmin from either:
    1. Standard 'Authorization: Bearer <token>' header
    2. '?token=<token>' query parameter (ideal for secure browser anchor downloads)
    """
    raw_token = None
    if credentials and credentials.credentials:
        raw_token = credentials.credentials
    elif token:
        raw_token = token

    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer authentication token or token query parameter.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(raw_token)
    username: str = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token: missing subject.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    admin = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate superadmin credentials from active database records.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "id": admin.id,
        "username": admin.username,
        "role": "superadmin",
        "user_obj": admin
    }
