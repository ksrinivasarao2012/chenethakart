from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field, field_validator
from sqlmodel import Session, select

from ..config import COOKIE_SECURE
from ..db import get_session
from ..models import User
from ..ratelimit import limit
from ..security import (COOKIE_NAME, EMAIL_RE, PHONE_RE, TOKEN_DAYS, create_token, current_user,
                        hash_password, optional_user, verify_password)

router = APIRouter(prefix="/auth", tags=["auth"])


def user_out(u: User) -> dict:
    return {"id": u.id, "name": u.name, "email": u.email, "phone": u.phone,
            "joined": u.created_at.strftime("%b %Y")}


def set_cookie(response: Response, user: User) -> None:
    response.set_cookie(COOKIE_NAME, create_token(user.id), httponly=True, samesite="lax", secure=COOKIE_SECURE,
                        max_age=TOKEN_DAYS * 86400, path="/")


def _password_ok(v: str) -> str:
    # bcrypt only uses the first 72 bytes and the library rejects longer input outright.
    if len(v.encode()) > 72:
        raise ValueError("Password must be 72 bytes or fewer.")
    return v


class SignupIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL_RE.match(v):
            raise ValueError("Enter a valid email address.")
        return v

    _pw = field_validator("password")(_password_ok)


class LoginIn(BaseModel):
    email: str
    password: str


class ProfileIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    phone: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def _phone(cls, v: Optional[str]) -> Optional[str]:
        if v in (None, ""):
            return None
        if not PHONE_RE.match(v):
            raise ValueError("Enter a valid 10-digit Indian mobile number.")
        return v


class PasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)

    _pw = field_validator("new_password")(_password_ok)


@router.post("/signup", status_code=201, dependencies=[Depends(limit("signup", 10, 3600))])
def signup(data: SignupIn, response: Response, session: Session = Depends(get_session)):
    if session.exec(select(User).where(User.email == data.email)).first():
        raise HTTPException(409, "An account with this email already exists. Try logging in.")
    user = User(name=data.name.strip(), email=data.email, password_hash=hash_password(data.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    set_cookie(response, user)
    return user_out(user)


@router.post("/login", dependencies=[Depends(limit("login", 10, 300))])
def login(data: LoginIn, response: Response, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == data.email.strip().lower())).first()
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password.")
    set_cookie(response, user)
    return user_out(user)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/", httponly=True, samesite="lax", secure=COOKIE_SECURE)
    return {"ok": True}


@router.get("/session")
def session_info(user: Optional[User] = Depends(optional_user)):
    """Like /me but returns {user: null} instead of 401, so logged-out visits don't log console errors."""
    return {"user": user_out(user) if user else None}


@router.get("/me")
def me(user: User = Depends(current_user)):
    return user_out(user)


@router.patch("/me")
def update_me(data: ProfileIn, user: User = Depends(current_user), session: Session = Depends(get_session)):
    user.name = data.name.strip()
    user.phone = data.phone
    session.add(user)
    session.commit()
    return user_out(user)


@router.post("/change-password", dependencies=[Depends(limit("pwchange", 10, 300))])
def change_password(data: PasswordIn, user: User = Depends(current_user),
                    session: Session = Depends(get_session)):
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(400, "Your current password is incorrect.")
    user.password_hash = hash_password(data.new_password)
    session.add(user)
    session.commit()
    return {"ok": True}
