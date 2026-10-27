from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime, timezone

from app.database.connection import db
from app.utils.jwt import get_current_user
from app.utils.roles import require_role


router = APIRouter(
    prefix="/notices",
    tags=["Notices"]
)


# --------------------------------------------------
# ADMIN - CREATE NOTICE
# --------------------------------------------------

@router.post("/")
def create_notice(
    notice: dict,
    current_user=Depends(get_current_user)
):
    # Only admin can create notices
    require_role(current_user, ["admin"])

    # Validate required fields
    title = notice.get("title")
    content = notice.get("content")

    if not title or not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title and content are required"
        )

    notice_document = {
        "title": title,
        "content": content,
        "created_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    result = db.notices.insert_one(notice_document)

    return {
        "message": "Notice created successfully",
        "notice_id": str(result.inserted_id)
    }


# --------------------------------------------------
# STUDENT / FACULTY / ADMIN - GET ALL NOTICES
# --------------------------------------------------

@router.get("/")
def get_notices(
    current_user=Depends(get_current_user)
):
    notices = list(
        db.notices.find().sort("created_at", -1)
    )

    result = []

    for notice in notices:
        result.append({
            "id": str(notice["_id"]),
            "title": notice.get("title"),
            "content": notice.get("content"),
            "created_by": notice.get("created_by"),
            "created_at": notice.get("created_at"),
            "updated_at": notice.get("updated_at")
        })

    return {
        "count": len(result),
        "notices": result
    }


# --------------------------------------------------
# GET SINGLE NOTICE
# --------------------------------------------------

@router.get("/{notice_id}")
def get_notice(
    notice_id: str,
    current_user=Depends(get_current_user)
):
    try:
        object_id = ObjectId(notice_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notice ID"
        )

    notice = db.notices.find_one({
        "_id": object_id
    })

    if not notice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notice not found"
        )

    return {
        "id": str(notice["_id"]),
        "title": notice.get("title"),
        "content": notice.get("content"),
        "created_by": notice.get("created_by"),
        "created_at": notice.get("created_at"),
        "updated_at": notice.get("updated_at")
    }


# --------------------------------------------------
# ADMIN - DELETE NOTICE
# --------------------------------------------------

@router.delete("/{notice_id}")
def delete_notice(
    notice_id: str,
    current_user=Depends(get_current_user)
):
    # Only admin can delete
    require_role(current_user, ["admin"])

    try:
        object_id = ObjectId(notice_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notice ID"
        )

    result = db.notices.delete_one({
        "_id": object_id
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notice not found"
        )

    return {
        "message": "Notice deleted successfully"
    }