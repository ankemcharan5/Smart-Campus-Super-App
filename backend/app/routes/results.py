from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime, timezone

from app.database.connection import db
from app.utils.jwt import get_current_user
from app.utils.roles import require_role


router = APIRouter(
    prefix="/results",
    tags=["Results"]
)


# ==================================================
# ADMIN - CREATE RESULT
# ==================================================

@router.post("/")
def create_result(
    result: dict,
    current_user=Depends(get_current_user)
):
    # Only admin can create results
    require_role(current_user, ["admin"])

    student_id = result.get("student_id")
    subject = result.get("subject")
    exam = result.get("exam")
    marks = result.get("marks")
    max_marks = result.get("max_marks")
    grade = result.get("grade")
    semester = result.get("semester")
    department = result.get("department")
    year = result.get("year")

    # ------------------------------
    # Validate student ID
    # ------------------------------

    if not student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID is required"
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
    # Validate exam
    # ------------------------------

    if not exam:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Exam is required"
        )

    # ------------------------------
    # Validate marks
    # ------------------------------

    if marks is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Marks are required"
        )

    # ------------------------------
    # Validate max marks
    # ------------------------------

    if max_marks is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum marks are required"
        )

    # ------------------------------
    # Validate marks range
    # ------------------------------

    if marks < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Marks cannot be negative"
        )

    if max_marks <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum marks must be greater than zero"
        )

    if marks > max_marks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Marks cannot exceed maximum marks"
        )

    # ------------------------------
    # Validate grade
    # ------------------------------

    if not grade:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Grade is required"
        )

    # ------------------------------
    # Validate semester
    # ------------------------------

    if semester is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Semester is required"
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

    # ==================================================
    # CHECK STUDENT
    # ==================================================

    student = db.users.find_one({
        "student_id": student_id
    })

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    # ==================================================
    # CREATE RESULT DOCUMENT
    # ==================================================

    result_document = {
        "student_id": student_id,
        "subject": subject,
        "exam": exam,
        "marks": marks,
        "max_marks": max_marks,
        "grade": grade,
        "semester": semester,
        "department": department,
        "year": year,
        "created_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    # Save to MongoDB
    inserted = db.results.insert_one(
        result_document
    )

    return {
        "message": "Result created successfully",
        "result_id": str(inserted.inserted_id)
    }


# ==================================================
# GET RESULTS
# ==================================================

@router.get("/")
def get_results(
    current_user=Depends(get_current_user)
):

    # Admin can see all results
    if current_user.get("role") == "admin":

        result_documents = list(
            db.results.find().sort(
                [
                    ("semester", 1),
                    ("subject", 1)
                ]
            )
        )

    else:

        # Get current student
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

        # Student sees only own results
        result_documents = list(
            db.results.find({
                "student_id": student_id
            }).sort(
                [
                    ("semester", 1),
                    ("subject", 1)
                ]
            )
        )

    results = []

    for item in result_documents:

        results.append({
            "id": str(item["_id"]),
            "student_id": item.get("student_id"),
            "subject": item.get("subject"),
            "exam": item.get("exam"),
            "marks": item.get("marks"),
            "max_marks": item.get("max_marks"),
            "grade": item.get("grade"),
            "semester": item.get("semester"),
            "department": item.get("department"),
            "year": item.get("year"),
            "created_at": item.get("created_at"),
            "updated_at": item.get("updated_at")
        })

    return {
        "count": len(results),
        "results": results
    }


# ==================================================
# GET SINGLE RESULT
# ==================================================

@router.get("/{result_id}")
def get_single_result(
    result_id: str,
    current_user=Depends(get_current_user)
):

    # Validate ObjectId
    try:
        object_id = ObjectId(result_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid result ID"
        )

    result = db.results.find_one({
        "_id": object_id
    })

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Result not found"
        )

    # Student security check
    if current_user.get("role") != "admin":

        if result.get("student_id") != current_user.get("student_id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this result"
            )

    return {
        "id": str(result["_id"]),
        "student_id": result.get("student_id"),
        "subject": result.get("subject"),
        "exam": result.get("exam"),
        "marks": result.get("marks"),
        "max_marks": result.get("max_marks"),
        "grade": result.get("grade"),
        "semester": result.get("semester"),
        "department": result.get("department"),
        "year": result.get("year"),
        "created_at": result.get("created_at"),
        "updated_at": result.get("updated_at")
    }


# ==================================================
# ADMIN - DELETE RESULT
# ==================================================

@router.delete("/{result_id}")
def delete_result(
    result_id: str,
    current_user=Depends(get_current_user)
):

    # Only admin can delete
    require_role(
        current_user,
        ["admin"]
    )

    # Validate ObjectId
    try:
        object_id = ObjectId(result_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid result ID"
        )

    deleted = db.results.delete_one({
        "_id": object_id
    })

    if deleted.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Result not found"
        )

    return {
        "message": "Result deleted successfully"
    }