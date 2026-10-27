from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime, timezone

from app.database.connection import db
from app.utils.jwt import get_current_user
from app.utils.roles import require_role


router = APIRouter(
    prefix="/fees",
    tags=["Fees"]
)


# ==================================================
# ADMIN - CREATE FEE
# ==================================================

@router.post("/")
def create_fee(
    fee: dict,
    current_user=Depends(get_current_user)
):

    # Only admin can create fees
    require_role(
        current_user,
        ["admin"]
    )

    student_id = fee.get("student_id")
    fee_type = fee.get("fee_type")
    amount = fee.get("amount")
    due_date = fee.get("due_date")
    fee_status = fee.get("status")
    semester = fee.get("semester")
    department = fee.get("department")
    year = fee.get("year")

    # ==================================================
    # VALIDATION
    # ==================================================

    if not student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student ID is required"
        )

    if not fee_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fee type is required"
        )

    if amount is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount is required"
        )

    if amount < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount cannot be negative"
        )

    if not due_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Due date is required"
        )

    if not fee_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status is required"
        )

    allowed_statuses = [
        "Pending",
        "Paid",
        "Overdue"
    ]

    if fee_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be Pending, Paid, or Overdue"
        )

    if semester is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Semester is required"
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
    # CREATE FEE DOCUMENT
    # ==================================================

    fee_document = {
        "student_id": student_id,
        "fee_type": fee_type,
        "amount": amount,
        "due_date": due_date,
        "status": fee_status,
        "semester": semester,
        "department": department,
        "year": year,
        "created_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    result = db.fees.insert_one(
        fee_document
    )

    return {
        "message": "Fee created successfully",
        "fee_id": str(result.inserted_id)
    }


# ==================================================
# GET FEES
# ==================================================

@router.get("/")
def get_fees(
    current_user=Depends(get_current_user)
):

    # --------------------------------------------------
    # ADMIN → ALL FEES
    # --------------------------------------------------

    if current_user.get("role") == "admin":

        fee_documents = list(
            db.fees.find().sort(
                "due_date",
                1
            )
        )

    # --------------------------------------------------
    # STUDENT → OWN FEES ONLY
    # --------------------------------------------------

    else:

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

        student_id = student.get(
            "student_id"
        )

        fee_documents = list(
            db.fees.find({
                "student_id": student_id
            }).sort(
                "due_date",
                1
            )
        )

    # ==================================================
    # FORMAT RESPONSE
    # ==================================================

    fees = []

    for fee in fee_documents:

        fees.append({
            "id": str(fee["_id"]),
            "student_id": fee.get("student_id"),
            "fee_type": fee.get("fee_type"),
            "amount": fee.get("amount"),
            "due_date": fee.get("due_date"),
            "status": fee.get("status"),
            "semester": fee.get("semester"),
            "department": fee.get("department"),
            "year": fee.get("year"),
            "created_at": fee.get("created_at"),
            "updated_at": fee.get("updated_at")
        })

    return {
        "count": len(fees),
        "fees": fees
    }


# ==================================================
# GET SINGLE FEE
# ==================================================

@router.get("/{fee_id}")
def get_single_fee(
    fee_id: str,
    current_user=Depends(get_current_user)
):

    # Validate ObjectId
    try:
        object_id = ObjectId(
            fee_id
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid fee ID"
        )

    fee = db.fees.find_one({
        "_id": object_id
    })

    if not fee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee not found"
        )

    # --------------------------------------------------
    # STUDENT SECURITY CHECK
    # --------------------------------------------------

    if current_user.get("role") != "admin":

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

        if fee.get("student_id") != student.get("student_id"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this fee"
            )

    return {
        "id": str(fee["_id"]),
        "student_id": fee.get("student_id"),
        "fee_type": fee.get("fee_type"),
        "amount": fee.get("amount"),
        "due_date": fee.get("due_date"),
        "status": fee.get("status"),
        "semester": fee.get("semester"),
        "department": fee.get("department"),
        "year": fee.get("year"),
        "created_at": fee.get("created_at"),
        "updated_at": fee.get("updated_at")
    }


# ==================================================
# ADMIN - DELETE FEE
# ==================================================

@router.delete("/{fee_id}")
def delete_fee(
    fee_id: str,
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
            fee_id
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid fee ID"
        )

    result = db.fees.delete_one({
        "_id": object_id
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fee not found"
        )

    return {
        "message": "Fee deleted successfully"
    }