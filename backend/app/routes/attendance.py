from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime, timezone

from app.database.connection import db
from app.utils.jwt import get_current_user
from app.utils.roles import require_role


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)


# ==================================================
# ADMIN - CREATE ATTENDANCE
# ==================================================

@router.post("/")
def create_attendance(
    attendance: dict,
    current_user=Depends(get_current_user)
):
    # Only admin can create attendance
    require_role(current_user, ["admin"])

    student_id = attendance.get("student_id")
    subject = attendance.get("subject")
    date = attendance.get("date")
    attendance_status = attendance.get("status")
    faculty = attendance.get("faculty")

    # Validate student_id
    if not student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID is required"
        )

    # Validate subject
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject is required"
        )

    # Validate date
    if not date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Date is required"
        )

    # Validate status
    if not attendance_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance status is required"
        )

    # Only allow Present or Absent
    if attendance_status not in ["Present", "Absent"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be Present or Absent"
        )

    # Validate faculty
    if not faculty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Faculty is required"
        )

    # Check whether student exists
    student = db.users.find_one({
        "student_id": student_id
    })

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    # Create attendance document
    attendance_document = {
        "student_id": student_id,
        "subject": subject,
        "date": date,
        "status": attendance_status,
        "faculty": faculty,
        "created_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    result = db.attendance.insert_one(attendance_document)

    return {
        "message": "Attendance created successfully",
        "attendance_id": str(result.inserted_id)
    }


# ==================================================
# GET ALL ATTENDANCE
# ==================================================

@router.get("/")
def get_attendance(
    current_user=Depends(get_current_user)
):

    # Admin can view all attendance
    if current_user.get("role") == "admin":

        attendance_documents = list(
            db.attendance.find().sort("date", -1)
        )

    else:

        # Get current student's MongoDB document
        try:
            student_object_id = ObjectId(
                current_user["user_id"]
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID"
            )

        student = db.users.find_one({
            "_id": student_object_id
        })

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )

        student_id = student.get("student_id")

        attendance_documents = list(
            db.attendance.find({
                "student_id": student_id
            }).sort("date", -1)
        )

    result = []

    for record in attendance_documents:
        result.append({
            "id": str(record["_id"]),
            "student_id": record.get("student_id"),
            "subject": record.get("subject"),
            "date": record.get("date"),
            "status": record.get("status"),
            "faculty": record.get("faculty"),
            "created_at": record.get("created_at"),
            "updated_at": record.get("updated_at")
        })

    return {
        "count": len(result),
        "attendance": result
    }
    result = []

    for record in attendance_documents:
        result.append({
            "id": str(record["_id"]),
            "student_id": record.get("student_id"),
            "subject": record.get("subject"),
            "date": record.get("date"),
            "status": record.get("status"),
            "faculty": record.get("faculty"),
            "created_at": record.get("created_at"),
            "updated_at": record.get("updated_at")
        })

    return {
        "count": len(result),
        "attendance": result
    }


# ==================================================
# GET SINGLE ATTENDANCE
# ==================================================

@router.get("/{attendance_id}")
def get_single_attendance(
    attendance_id: str,
    current_user=Depends(get_current_user)
):
    # Validate ObjectId
    try:
        object_id = ObjectId(attendance_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid attendance ID"
        )

    # Find attendance
    record = db.attendance.find_one({
        "_id": object_id
    })

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )

    return {
        "id": str(record["_id"]),
        "student_id": record.get("student_id"),
        "subject": record.get("subject"),
        "date": record.get("date"),
        "status": record.get("status"),
        "faculty": record.get("faculty"),
        "created_at": record.get("created_at"),
        "updated_at": record.get("updated_at")
    }


# ==================================================
# ADMIN - DELETE ATTENDANCE
# ==================================================

@router.delete("/{attendance_id}")
def delete_attendance(
    attendance_id: str,
    current_user=Depends(get_current_user)
):
    # Only admin can delete
    require_role(current_user, ["admin"])

    # Validate ObjectId
    try:
        object_id = ObjectId(attendance_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid attendance ID"
        )

    result = db.attendance.delete_one({
        "_id": object_id
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found"
        )

    return {
        "message": "Attendance deleted successfully"
    }