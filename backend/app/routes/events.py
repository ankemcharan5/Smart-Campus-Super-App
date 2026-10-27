from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime, timezone

from app.database.connection import db
from app.utils.jwt import get_current_user
from app.utils.roles import require_role


router = APIRouter(
    prefix="/events",
    tags=["Events"]
)


# ==================================================
# ADMIN - CREATE EVENT
# ==================================================

@router.post("/")
def create_event(
    event: dict,
    current_user=Depends(get_current_user)
):
    # Only admin can create events
    require_role(current_user, ["admin"])

    # Required fields
    title = event.get("title")
    description = event.get("description")
    event_date = event.get("event_date")
    event_time = event.get("event_time")
    location = event.get("location")
    organizer = event.get("organizer")

    # Validate required fields
    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title is required"
        )

    if not description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description is required"
        )

    if not event_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event date is required"
        )

    if not event_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event time is required"
        )

    if not location:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location is required"
        )

    if not organizer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Organizer is required"
        )

    # Create MongoDB document
    event_document = {
        "title": title,
        "description": description,
        "event_date": event_date,
        "event_time": event_time,
        "location": location,
        "organizer": organizer,
        "created_by": current_user["user_id"],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    # Save event
    result = db.events.insert_one(event_document)

    return {
        "message": "Event created successfully",
        "event_id": str(result.inserted_id)
    }


# ==================================================
# GET ALL EVENTS
# ==================================================

@router.get("/")
def get_events(
    current_user=Depends(get_current_user)
):
    events = list(
        db.events.find().sort("event_date", 1)
    )

    result = []

    for event in events:
        result.append({
            "id": str(event["_id"]),
            "title": event.get("title"),
            "description": event.get("description"),
            "event_date": event.get("event_date"),
            "event_time": event.get("event_time"),
            "location": event.get("location"),
            "organizer": event.get("organizer"),
            "created_by": event.get("created_by"),
            "created_at": event.get("created_at"),
            "updated_at": event.get("updated_at")
        })

    return {
        "count": len(result),
        "events": result
    }


# ==================================================
# GET SINGLE EVENT
# ==================================================

@router.get("/{event_id}")
def get_event(
    event_id: str,
    current_user=Depends(get_current_user)
):
    # Validate ObjectId
    try:
        object_id = ObjectId(event_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID"
        )

    # Find event
    event = db.events.find_one({
        "_id": object_id
    })

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    return {
        "id": str(event["_id"]),
        "title": event.get("title"),
        "description": event.get("description"),
        "event_date": event.get("event_date"),
        "event_time": event.get("event_time"),
        "location": event.get("location"),
        "organizer": event.get("organizer"),
        "created_by": event.get("created_by"),
        "created_at": event.get("created_at"),
        "updated_at": event.get("updated_at")
    }


# ==================================================
# ADMIN - DELETE EVENT
# ==================================================

@router.delete("/{event_id}")
def delete_event(
    event_id: str,
    current_user=Depends(get_current_user)
):
    # Only admin can delete
    require_role(current_user, ["admin"])

    # Validate ObjectId
    try:
        object_id = ObjectId(event_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID"
        )

    # Delete event
    result = db.events.delete_one({
        "_id": object_id
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    return {
        "message": "Event deleted successfully"
    }