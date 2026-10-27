from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime, timezone

from app.database.connection import db
from app.utils.jwt import get_current_user
from app.utils.roles import require_role


router = APIRouter(
    prefix="/lost-found",
    tags=["Lost & Found"]
)


# =========================================================
# STUDENT - CREATE LOST / FOUND ITEM
# =========================================================

@router.post("/")
def create_item(
    item: dict,
    current_user=Depends(get_current_user)
):

    # Only students can create items
    require_role(
        current_user,
        ["student"]
    )

    item_type = item.get("type")
    item_name = item.get("item_name")
    description = item.get("description")
    location = item.get("location")
    item_date = item.get("date")
    contact = item.get("contact")

    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    if not item_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item type is required"
        )

    if item_type not in ["Lost", "Found"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item type must be Lost or Found"
        )

    if not item_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item name is required"
        )

    if not description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item description is required"
        )

    if not location:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location is required"
        )

    if not item_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Date is required"
        )

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact is required"
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
    # CREATE ITEM
    # -----------------------------------------------------

    now = datetime.now(timezone.utc)

    item_document = {
        "student_id": student_id,
        "type": item_type,
        "item_name": item_name,
        "description": description,
        "location": location,
        "date": item_date,
        "contact": contact,
        "status": "Open",
        "created_at": now,
        "updated_at": now
    }

    result = db.lost_found.insert_one(
        item_document
    )

    return {
        "message": "Lost & Found item created successfully",
        "item_id": str(result.inserted_id)
    }


# =========================================================
# GET ALL LOST & FOUND ITEMS
# =========================================================

@router.get("/")
def get_items(
    current_user=Depends(get_current_user)
):

    item_documents = list(
        db.lost_found.find().sort(
            "created_at",
            -1
        )
    )

    items = []

    for item in item_documents:

        items.append({
            "id": str(item["_id"]),
            "student_id": item.get("student_id"),
            "type": item.get("type"),
            "item_name": item.get("item_name"),
            "description": item.get("description"),
            "location": item.get("location"),
            "date": item.get("date"),
            "contact": item.get("contact"),
            "status": item.get("status"),
            "created_at": item.get("created_at"),
            "updated_at": item.get("updated_at")
        })

    return {
        "count": len(items),
        "items": items
    }


# =========================================================
# GET SINGLE ITEM
# =========================================================

@router.get("/{item_id}")
def get_single_item(
    item_id: str,
    current_user=Depends(get_current_user)
):

    # -----------------------------------------------------
    # VALIDATE OBJECT ID
    # -----------------------------------------------------

    try:
        object_id = ObjectId(
            item_id
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item ID"
        )

    item = db.lost_found.find_one({
        "_id": object_id
    })

    if not item:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lost & Found item not found"
        )

    return {
        "id": str(item["_id"]),
        "student_id": item.get("student_id"),
        "type": item.get("type"),
        "item_name": item.get("item_name"),
        "description": item.get("description"),
        "location": item.get("location"),
        "date": item.get("date"),
        "contact": item.get("contact"),
        "status": item.get("status"),
        "created_at": item.get("created_at"),
        "updated_at": item.get("updated_at")
    }


# =========================================================
# UPDATE ITEM STATUS
# =========================================================

@router.patch("/{item_id}/status")
def update_item_status(
    item_id: str,
    data: dict,
    current_user=Depends(get_current_user)
):

    # Admin and students can update status
    require_role(
        current_user,
        ["student", "admin"]
    )

    # -----------------------------------------------------
    # VALIDATE ID
    # -----------------------------------------------------

    try:
        object_id = ObjectId(
            item_id
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item ID"
        )

    item = db.lost_found.find_one({
        "_id": object_id
    })

    if not item:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lost & Found item not found"
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

        # Student can update only their own item
        if item.get("student_id") != student.get("student_id"):

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can update only your own item"
            )

    # -----------------------------------------------------
    # VALIDATE STATUS
    # -----------------------------------------------------

    new_status = data.get("status")

    allowed_statuses = [
        "Open",
        "Claimed",
        "Returned"
    ]

    if new_status not in allowed_statuses:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item status"
        )

    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    db.lost_found.update_one(
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
        "message": "Lost & Found item status updated successfully",
        "item_id": item_id,
        "status": new_status
    }


# =========================================================
# ADMIN - DELETE ITEM
# =========================================================

@router.delete("/{item_id}")
def delete_item(
    item_id: str,
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
            item_id
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item ID"
        )

    result = db.lost_found.delete_one({
        "_id": object_id
    })

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lost & Found item not found"
        )

    return {
        "message": "Lost & Found item deleted successfully"
    }