from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime, timezone

from app.database.connection import db
from app.utils.jwt import get_current_user
from app.utils.roles import require_role


router = APIRouter(
    prefix="/campus-resources",
    tags=["Campus Resources"]
)


# =========================================================
# CREATE CAMPUS RESOURCE
# =========================================================

@router.post("/")
def create_resource(
    resource: dict,
    current_user=Depends(get_current_user)
):

    # Only admin can create campus resources
    require_role(
        current_user,
        ["admin"]
    )

    name = resource.get("name")
    category = resource.get("category")
    description = resource.get("description")
    location = resource.get("location")
    contact = resource.get("contact")
    opening_time = resource.get("opening_time")
    closing_time = resource.get("closing_time")

    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resource name is required"
        )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resource category is required"
        )

    if not description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resource description is required"
        )

    if not location:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resource location is required"
        )

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resource contact is required"
        )

    if not opening_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Opening time is required"
        )

    if not closing_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Closing time is required"
        )

    # -----------------------------------------------------
    # CREATE DOCUMENT
    # -----------------------------------------------------

    now = datetime.now(timezone.utc)

    resource_document = {
        "name": name,
        "category": category,
        "description": description,
        "location": location,
        "contact": contact,
        "opening_time": opening_time,
        "closing_time": closing_time,
        "created_at": now,
        "updated_at": now
    }

    result = db.campus_resources.insert_one(
        resource_document
    )

    return {
        "message": "Campus resource created successfully",
        "resource_id": str(result.inserted_id)
    }


# =========================================================
# GET ALL CAMPUS RESOURCES
# =========================================================

@router.get("/")
def get_resources(
    current_user=Depends(get_current_user)
):

    resource_documents = list(
        db.campus_resources.find().sort(
            "created_at",
            -1
        )
    )

    resources = []

    for resource in resource_documents:

        resources.append({
            "id": str(resource["_id"]),
            "name": resource.get("name"),
            "category": resource.get("category"),
            "description": resource.get("description"),
            "location": resource.get("location"),
            "contact": resource.get("contact"),
            "opening_time": resource.get("opening_time"),
            "closing_time": resource.get("closing_time"),
            "created_at": resource.get("created_at"),
            "updated_at": resource.get("updated_at")
        })

    return {
        "count": len(resources),
        "resources": resources
    }


# =========================================================
# GET SINGLE RESOURCE
# =========================================================

@router.get("/{resource_id}")
def get_single_resource(
    resource_id: str,
    current_user=Depends(get_current_user)
):

    try:
        object_id = ObjectId(
            resource_id
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resource ID"
        )

    resource = db.campus_resources.find_one({
        "_id": object_id
    })

    if not resource:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campus resource not found"
        )

    return {
        "id": str(resource["_id"]),
        "name": resource.get("name"),
        "category": resource.get("category"),
        "description": resource.get("description"),
        "location": resource.get("location"),
        "contact": resource.get("contact"),
        "opening_time": resource.get("opening_time"),
        "closing_time": resource.get("closing_time"),
        "created_at": resource.get("created_at"),
        "updated_at": resource.get("updated_at")
    }


# =========================================================
# FILTER RESOURCES BY CATEGORY
# =========================================================

@router.get("/category/{category}")
def get_resources_by_category(
    category: str,
    current_user=Depends(get_current_user)
):

    resource_documents = list(
        db.campus_resources.find({
            "category": {
                "$regex": f"^{category}$",
                "$options": "i"
            }
        }).sort(
            "created_at",
            -1
        )
    )

    resources = []

    for resource in resource_documents:

        resources.append({
            "id": str(resource["_id"]),
            "name": resource.get("name"),
            "category": resource.get("category"),
            "description": resource.get("description"),
            "location": resource.get("location"),
            "contact": resource.get("contact"),
            "opening_time": resource.get("opening_time"),
            "closing_time": resource.get("closing_time"),
            "created_at": resource.get("created_at"),
            "updated_at": resource.get("updated_at")
        })

    return {
        "count": len(resources),
        "category": category,
        "resources": resources
    }


# =========================================================
# UPDATE CAMPUS RESOURCE
# =========================================================

@router.put("/{resource_id}")
def update_resource(
    resource_id: str,
    resource: dict,
    current_user=Depends(get_current_user)
):

    require_role(
        current_user,
        ["admin"]
    )

    try:
        object_id = ObjectId(
            resource_id
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resource ID"
        )

    existing_resource = db.campus_resources.find_one({
        "_id": object_id
    })

    if not existing_resource:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campus resource not found"
        )

    allowed_fields = [
        "name",
        "category",
        "description",
        "location",
        "contact",
        "opening_time",
        "closing_time"
    ]

    update_data = {}

    for field in allowed_fields:

        if field in resource:
            update_data[field] = resource[field]

    if not update_data:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update"
        )

    update_data["updated_at"] = datetime.now(
        timezone.utc
    )

    db.campus_resources.update_one(
        {
            "_id": object_id
        },
        {
            "$set": update_data
        }
    )

    return {
        "message": "Campus resource updated successfully",
        "resource_id": resource_id
    }


# =========================================================
# DELETE CAMPUS RESOURCE
# =========================================================

@router.delete("/{resource_id}")
def delete_resource(
    resource_id: str,
    current_user=Depends(get_current_user)
):

    require_role(
        current_user,
        ["admin"]
    )

    try:
        object_id = ObjectId(
            resource_id
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resource ID"
        )

    result = db.campus_resources.delete_one({
        "_id": object_id
    })

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campus resource not found"
        )

    return {
        "message": "Campus resource deleted successfully"
    }