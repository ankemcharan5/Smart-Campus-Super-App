from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime, timezone

from app.database.connection import db
from app.utils.jwt import get_current_user
from app.utils.roles import require_role


router = APIRouter(
    prefix="/timetable",
    tags=["Timetable"]
)


# ==================================================
# ADMIN - CREATE TIMETABLE ENTRY
# ==================================================

@router.post("/")
def create_timetable_entry(
    timetable: dict,
    current_user=Depends(get_current_user)
):
    # Only admin can create timetable entries
    require_role(current_user, ["admin"])

    day = timetable.get("day")
    start_time = timetable.get("start_time")
    end_time = timetable.get("end_time")
    subject = timetable.get("subject")
    faculty = timetable.get("faculty")
    room = timetable.get("room")
    department = timetable.get("department")
    year = timetable.get("year")
    section = timetable.get("section")

    # Validate required fields
    if not day:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Day is required"
        )

    if not start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start time is required"
        )

    if not end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time is required"
        )

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject is required"
        )

    if not faculty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Faculty is required"
        )

    if not room:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room is required"
        )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department is required"
        )

    if year is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Year is required"
        )

    if not section:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Section is required"
        )

    # Create MongoDB document
    timetable_document = {
        "day": day,
        "start_time": start_time,
        "end_time": end_time,
        "subject": subject,
        "faculty": faculty,
        "room": room,
        "department": department,
        "year": year,
        "section": section,
        "created_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    result = db.timetable.insert_one(timetable_document)

    return {
        "message": "Timetable entry created successfully",
        "timetable_id": str(result.inserted_id)
    }


# ==================================================
# GET ALL TIMETABLE ENTRIES
# ==================================================

@router.get("/")
def get_timetable(
    current_user=Depends(get_current_user)
):
    timetable_documents = list(
        db.timetable.find().sort(
            [
                ("day", 1),
                ("start_time", 1)
            ]
        )
    )

    result = []

    for item in timetable_documents:
        result.append({
            "id": str(item["_id"]),
            "day": item.get("day"),
            "start_time": item.get("start_time"),
            "end_time": item.get("end_time"),
            "subject": item.get("subject"),
            "faculty": item.get("faculty"),
            "room": item.get("room"),
            "department": item.get("department"),
            "year": item.get("year"),
            "section": item.get("section"),
            "created_at": item.get("created_at"),
            "updated_at": item.get("updated_at")
        })

    return {
        "count": len(result),
        "timetable": result
    }


# ==================================================
# GET SINGLE TIMETABLE ENTRY
# ==================================================

@router.get("/{timetable_id}")
def get_timetable_entry(
    timetable_id: str,
    current_user=Depends(get_current_user)
):
    try:
        object_id = ObjectId(timetable_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid timetable ID"
        )

    timetable = db.timetable.find_one({
        "_id": object_id
    })

    if not timetable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable entry not found"
        )

    return {
        "id": str(timetable["_id"]),
        "day": timetable.get("day"),
        "start_time": timetable.get("start_time"),
        "end_time": timetable.get("end_time"),
        "subject": timetable.get("subject"),
        "faculty": timetable.get("faculty"),
        "room": timetable.get("room"),
        "department": timetable.get("department"),
        "year": timetable.get("year"),
        "section": timetable.get("section"),
        "created_at": timetable.get("created_at"),
        "updated_at": timetable.get("updated_at")
    }


# ==================================================
# ADMIN - DELETE TIMETABLE ENTRY
# ==================================================

@router.delete("/{timetable_id}")
def delete_timetable_entry(
    timetable_id: str,
    current_user=Depends(get_current_user)
):
    # Only admin can delete
    require_role(current_user, ["admin"])

    try:
        object_id = ObjectId(timetable_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid timetable ID"
        )

    result = db.timetable.delete_one({
        "_id": object_id
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable entry not found"
        )

    return {
        "message": "Timetable entry deleted successfully"
    }