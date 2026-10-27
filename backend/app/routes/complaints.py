from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime, timezone

from app.database.connection import db
from app.utils.jwt import get_current_user
from app.utils.roles import require_role


router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"]
)


# =========================================================
# STUDENT - CREATE COMPLAINT
# =========================================================

@router.post("/")
def create_complaint(
    complaint: dict,
    current_user=Depends(get_current_user)
):

    # Only students can create complaints
    require_role(
        current_user,
        ["student"]
    )

    title = complaint.get("title")
    description = complaint.get("description")
    category = complaint.get("category")

    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint title is required"
        )

    if not description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint description is required"
        )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint category is required"
        )

    allowed_categories = [
        "Academic",
        "Infrastructure",
        "Hostel",
        "Transport",
        "Fees",
        "Other"
    ]

    if category not in allowed_categories:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid complaint category"
        )

    # -----------------------------------------------------
    # GET CURRENT STUDENT
    # -----------------------------------------------------

    try:
        user_object_id = ObjectId(
            current_user["user_id"]
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )

    student = db.users.find_one({
        "_id": user_object_id
    })

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    student_id = student.get("student_id")

    if not student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID not found"
        )

    # -----------------------------------------------------
    # CREATE COMPLAINT
    # -----------------------------------------------------

    now = datetime.now(timezone.utc)

    complaint_document = {
        "student_id": student_id,
        "title": title,
        "description": description,
        "category": category,
        "status": "Pending",
        "created_at": now,
        "updated_at": now
    }

    result = db.complaints.insert_one(
        complaint_document
    )

    return {
        "message": "Complaint submitted successfully",
        "complaint_id": str(result.inserted_id)
    }


# =========================================================
# GET COMPLAINTS
# =========================================================

@router.get("/")
def get_complaints(
    current_user=Depends(get_current_user)
):

    # -----------------------------------------------------
    # ADMIN / FACULTY → ALL COMPLAINTS
    # -----------------------------------------------------

    if current_user.get("role") in [
        "admin",
        "faculty"
    ]:

        complaint_documents = list(
            db.complaints.find().sort(
                "created_at",
                -1
            )
        )

    # -----------------------------------------------------
    # STUDENT → OWN COMPLAINTS ONLY
    # -----------------------------------------------------

    elif current_user.get("role") == "student":

        try:
            user_object_id = ObjectId(
                current_user["user_id"]
            )

        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID"
            )

        student = db.users.find_one({
            "_id": user_object_id
        })

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )

        student_id = student.get("student_id")

        complaint_documents = list(
            db.complaints.find({
                "student_id": student_id
            }).sort(
                "created_at",
                -1
            )
        )

    else:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access complaints"
        )

    # -----------------------------------------------------
    # FORMAT RESPONSE
    # -----------------------------------------------------

    complaints = []

    for complaint in complaint_documents:

        complaints.append({
            "id": str(complaint["_id"]),
            "student_id": complaint.get("student_id"),
            "title": complaint.get("title"),
            "description": complaint.get("description"),
            "category": complaint.get("category"),
            "status": complaint.get("status"),
            "created_at": complaint.get("created_at"),
            "updated_at": complaint.get("updated_at")
        })

    return {
        "count": len(complaints),
        "complaints": complaints
    }


# =========================================================
# GET SINGLE COMPLAINT
# =========================================================

@router.get("/{complaint_id}")
def get_single_complaint(
    complaint_id: str,
    current_user=Depends(get_current_user)
):

    # -----------------------------------------------------
    # VALIDATE OBJECT ID
    # -----------------------------------------------------

    try:
        object_id = ObjectId(
            complaint_id
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid complaint ID"
        )

    complaint = db.complaints.find_one({
        "_id": object_id
    })

    if not complaint:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    # -----------------------------------------------------
    # STUDENT SECURITY
    # -----------------------------------------------------

    if current_user.get("role") == "student":

        try:
            user_object_id = ObjectId(
                current_user["user_id"]
            )

        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user ID"
            )

        student = db.users.find_one({
            "_id": user_object_id
        })

        if not student:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )

        if complaint.get("student_id") != student.get("student_id"):

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this complaint"
            )

    return {
        "id": str(complaint["_id"]),
        "student_id": complaint.get("student_id"),
        "title": complaint.get("title"),
        "description": complaint.get("description"),
        "category": complaint.get("category"),
        "status": complaint.get("status"),
        "created_at": complaint.get("created_at"),
        "updated_at": complaint.get("updated_at")
    }


# =========================================================
# ADMIN / FACULTY - UPDATE COMPLAINT STATUS
# =========================================================

@router.patch("/{complaint_id}/status")
def update_complaint_status(
    complaint_id: str,
    data: dict,
    current_user=Depends(get_current_user)
):

    # -----------------------------------------------------
    # ONLY ADMIN / FACULTY
    # -----------------------------------------------------

    require_role(
        current_user,
        ["admin", "faculty"]
    )

    # -----------------------------------------------------
    # VALIDATE ID
    # -----------------------------------------------------

    try:
        object_id = ObjectId(
            complaint_id
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid complaint ID"
        )

    # -----------------------------------------------------
    # CHECK COMPLAINT
    # -----------------------------------------------------

    complaint = db.complaints.find_one({
        "_id": object_id
    })

    if not complaint:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    new_status = data.get("status")

    # -----------------------------------------------------
    # VALID STATUS
    # -----------------------------------------------------

    allowed_statuses = [
        "Pending",
        "In Progress",
        "Resolved",
        "Rejected"
    ]

    if new_status not in allowed_statuses:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid complaint status"
        )

    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    db.complaints.update_one(
        {
            "_id": object_id
        },
        {
            "$set": {
                "status": new_status,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    return {
        "message": "Complaint status updated successfully",
        "complaint_id": complaint_id,
        "status": new_status
    }


# =========================================================
# ADMIN - DELETE COMPLAINT
# =========================================================

@router.delete("/{complaint_id}")
def delete_complaint(
    complaint_id: str,
    current_user=Depends(get_current_user)
):

    require_role(
        current_user,
        ["admin"]
    )

    # -----------------------------------------------------
    # VALIDATE ID
    # -----------------------------------------------------

    try:
        object_id = ObjectId(
            complaint_id
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid complaint ID"
        )

    # -----------------------------------------------------
    # DELETE
    # -----------------------------------------------------

    result = db.complaints.delete_one({
        "_id": object_id
    })

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found"
        )

    return {
        "message": "Complaint deleted successfully"
    }