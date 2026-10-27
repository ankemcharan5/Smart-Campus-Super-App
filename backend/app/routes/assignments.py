from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime, timezone

from app.database.connection import db
from app.utils.jwt import get_current_user
from app.utils.roles import require_role


router = APIRouter(
    prefix="/assignments",
    tags=["Assignments"]
)


# ==================================================
# ADMIN - CREATE ASSIGNMENT
# ==================================================

@router.post("/")
def create_assignment(
    assignment: dict,
    current_user=Depends(get_current_user)
):
    # Only admin can create assignments
    require_role(current_user, ["admin"])

    title = assignment.get("title")
    description = assignment.get("description")
    subject = assignment.get("subject")
    faculty = assignment.get("faculty")
    due_date = assignment.get("due_date")
    department = assignment.get("department")
    year = assignment.get("year")
    section = assignment.get("section")

    # ------------------------------
    # Validate title
    # ------------------------------

    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title is required"
        )

    # ------------------------------
    # Validate description
    # ------------------------------

    if not description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description is required"
        )

    # ------------------------------
    # Validate subject
    # ------------------------------

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject is required"
        )

    # ------------------------------
    # Validate faculty
    # ------------------------------

    if not faculty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Faculty is required"
        )

    # ------------------------------
    # Validate due date
    # ------------------------------

    if not due_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Due date is required"
        )

    # ------------------------------
    # Validate department
    # ------------------------------

    if not department:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department is required"
        )

    # ------------------------------
    # Validate year
    # ------------------------------

    if year is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Year is required"
        )

    # ------------------------------
    # Validate section
    # ------------------------------

    if not section:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Section is required"
        )

    # ==================================================
    # CREATE ASSIGNMENT DOCUMENT
    # ==================================================

    assignment_document = {
        "title": title,
        "description": description,
        "subject": subject,
        "faculty": faculty,
        "due_date": due_date,
        "department": department,
        "year": year,
        "section": section,
        "created_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    # Save to MongoDB
    result = db.assignments.insert_one(
        assignment_document
    )

    return {
        "message": "Assignment created successfully",
        "assignment_id": str(result.inserted_id)
    }


# ==================================================
# GET ASSIGNMENTS
# ==================================================

@router.get("/")
def get_assignments(
    current_user=Depends(get_current_user)
):

    # Admin can see all assignments
    if current_user.get("role") == "admin":

        assignment_documents = list(
            db.assignments.find().sort(
                "due_date",
                1
            )
        )

    else:

        # Student profile
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

        department = student.get("department")
        year = student.get("year")

        # Students see assignments for
        # their department and year
        assignment_documents = list(
            db.assignments.find({
                "department": department,
                "year": year
            }).sort(
                "due_date",
                1
            )
        )

    result = []

    for assignment in assignment_documents:

        result.append({
            "id": str(assignment["_id"]),
            "title": assignment.get("title"),
            "description": assignment.get("description"),
            "subject": assignment.get("subject"),
            "faculty": assignment.get("faculty"),
            "due_date": assignment.get("due_date"),
            "department": assignment.get("department"),
            "year": assignment.get("year"),
            "section": assignment.get("section"),
            "created_at": assignment.get("created_at"),
            "updated_at": assignment.get("updated_at")
        })

    return {
        "count": len(result),
        "assignments": result
    }


# ==================================================
# GET SINGLE ASSIGNMENT
# ==================================================

@router.get("/{assignment_id}")
def get_single_assignment(
    assignment_id: str,
    current_user=Depends(get_current_user)
):

    # Validate ObjectId
    try:
        object_id = ObjectId(
            assignment_id
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid assignment ID"
        )

    assignment = db.assignments.find_one({
        "_id": object_id
    })

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    return {
        "id": str(assignment["_id"]),
        "title": assignment.get("title"),
        "description": assignment.get("description"),
        "subject": assignment.get("subject"),
        "faculty": assignment.get("faculty"),
        "due_date": assignment.get("due_date"),
        "department": assignment.get("department"),
        "year": assignment.get("year"),
        "section": assignment.get("section"),
        "created_at": assignment.get("created_at"),
        "updated_at": assignment.get("updated_at")
    }


# ==================================================
# ADMIN - DELETE ASSIGNMENT
# ==================================================

@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: str,
    current_user=Depends(get_current_user)
):

    # Only admin can delete
    require_role(
        current_user,
        ["admin"]
    )

    # Validate ObjectId
    try:
        object_id = ObjectId(
            assignment_id
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid assignment ID"
        )

    result = db.assignments.delete_one({
        "_id": object_id
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )

    return {
        "message": "Assignment deleted successfully"
    }