from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.database.connection import db
from app.utils.jwt import get_current_user


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me")
def get_my_profile(current_user=Depends(get_current_user)):

    # Get user ID from JWT
    user_id = current_user.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID missing from token"
        )

    # Convert JWT string ID to MongoDB ObjectId
    try:
        object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )

    # Find user in MongoDB
    user = db.users.find_one({
        "_id": object_id
    })

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Return user profile
    return {
        "id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role"),
        "student_id": user.get("student_id"),
        "department": user.get("department"),
        "year": user.get("year")
    }