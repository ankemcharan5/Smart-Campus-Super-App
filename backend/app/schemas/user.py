from pydantic import BaseModel, EmailStr
from typing import Optional


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "student"
    student_id: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    student_id: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse