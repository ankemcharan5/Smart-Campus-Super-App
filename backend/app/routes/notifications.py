from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime

from app.database.connection import db
from app.utils.jwt import get_current_user
from app.utils.roles import require_role


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =========================================================
# REQUEST MODEL
# =========================================================

class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    notification_type: str = "general"


# =========================================================
# CREATE NOTIFICATION
# =========================================================

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED
)
def create_notification(
    notification: NotificationCreate,
    current_user=Depends(get_current_user)
):

    # Only admin and faculty can create notifications
    require_role(
        current_user,
        ["admin", "faculty"]
    )

    # Validate user ID
    try:
        user_object_id = ObjectId(
            notification.user_id
        )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid user ID"
        )

    # Check whether target user exists
    target_user = db.users.find_one({
        "_id": user_object_id
    })

    if not target_user:
        raise HTTPException(
            status_code=404,
            detail="Target user not found"
        )

    notification_document = {
        "user_id": notification.user_id,
        "title": notification.title,
        "message": notification.message,
        "notification_type": notification.notification_type,
        "is_read": False,
        "created_at": datetime.utcnow()
    }

    result = db.notifications.insert_one(
        notification_document
    )

    return {
        "message": "Notification created successfully",
        "notification": {
            "id": str(result.inserted_id),
            "user_id": notification.user_id,
            "title": notification.title,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "is_read": False,
            "created_at": notification_document[
                "created_at"
            ]
        }
    }


# =========================================================
# GET MY NOTIFICATIONS
# =========================================================

@router.get("/me")
def get_my_notifications(
    current_user=Depends(get_current_user)
):

    user_id = current_user["user_id"]

    notification_documents = list(
        db.notifications.find({
            "user_id": user_id
        }).sort(
            "created_at",
            -1
        )
    )

    notifications = []

    for notification in notification_documents:

        notifications.append({
            "id": str(notification["_id"]),
            "title": notification.get("title"),
            "message": notification.get("message"),
            "notification_type": notification.get(
                "notification_type",
                "general"
            ),
            "is_read": notification.get(
                "is_read",
                False
            ),
            "created_at": notification.get(
                "created_at"
            )
        })

    unread_count = sum(
        1
        for notification in notifications
        if not notification["is_read"]
    )

    return {
        "count": len(notifications),
        "unread_count": unread_count,
        "notifications": notifications
    }
# =========================================================
# MARK ALL MY NOTIFICATIONS AS READ
# =========================================================

@router.patch("/read-all")
def mark_all_notifications_as_read(
    current_user=Depends(get_current_user)
):

    result = db.notifications.update_many(
        {
            "user_id": current_user["user_id"],
            "is_read": False
        },
        {
            "$set": {
                "is_read": True
            }
        }
    )

    return {
        "message": "All notifications marked as read",
        "updated_count": result.modified_count
    }

# =========================================================
# MARK NOTIFICATION AS READ
# =========================================================

@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: str,
    current_user=Depends(get_current_user)
):

    try:
        notification_object_id = ObjectId(
            notification_id
        )
    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID"
        )

    notification = db.notifications.find_one({
        "_id": notification_object_id
    })

    if not notification:

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    # Users can only update their own notifications
    if notification.get(
        "user_id"
    ) != current_user["user_id"]:

        raise HTTPException(
            status_code=403,
            detail="You do not have permission to update this notification"
        )

    db.notifications.update_one(
        {
            "_id": notification_object_id
        },
        {
            "$set": {
                "is_read": True
            }
        }
    )

    return {
        "message": "Notification marked as read",
        "notification_id": notification_id,
        "is_read": True
    }


