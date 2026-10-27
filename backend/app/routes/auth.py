from fastapi import APIRouter, HTTPException

from bson import ObjectId

from app.database.connection import db
from app.models.user import user_document
from app.schemas.user import (
    RegisterRequest,
    LoginRequest,
)
from app.utils.security import (
    hash_password,
    verify_password,
)
from app.utils.jwt import create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/register")
def register(data: RegisterRequest):

    existing_user = db.users.find_one(
        {"email": data.email.lower()}
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    allowed_roles = [
        "student",
        "faculty",
        "admin",
    ]

    if data.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid role",
        )

    hashed_password = hash_password(
        data.password
    )

    document = user_document(
        name=data.name,
        email=data.email,
        password_hash=hashed_password,
        role=data.role,
        student_id=data.student_id,
        department=data.department,
        year=data.year,
    )

    result = db.users.insert_one(document)

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id),
    }


@router.post("/login")
def login(data: LoginRequest):

    user = db.users.find_one(
        {"email": data.email.lower()}
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        data.password,
        user["password_hash"],
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        str(user["_id"]),
        user["role"],
    )

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        },
    }