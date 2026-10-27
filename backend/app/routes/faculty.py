from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.database.connection import db
from app.utils.jwt import get_current_user
from app.utils.roles import require_role


router = APIRouter(
    prefix="/faculty",
    tags=["Faculty"]
)


# =========================================================
# FACULTY DASHBOARD
# =========================================================

@router.get("/dashboard")
def faculty_dashboard(
    current_user=Depends(get_current_user)
):

    # -----------------------------------------------------
    # ONLY FACULTY CAN ACCESS THIS DASHBOARD
    # -----------------------------------------------------

    require_role(
        current_user,
        ["faculty"]
    )

    # -----------------------------------------------------
    # GET FACULTY USER
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

    faculty = db.users.find_one({
        "_id": user_object_id
    })

    if not faculty:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty not found"
        )

    faculty_id = faculty.get("faculty_id")
    faculty_name = faculty.get("name")
    faculty_email = faculty.get("email")
    department = faculty.get("department")

    # =====================================================
    # TIMETABLE
    # =====================================================

    timetable_documents = list(
        db.timetable.find({
            "faculty": faculty_name
        }).sort(
            [
                ("day", 1),
                ("start_time", 1)
            ]
        )
    )

    timetable = []

    for item in timetable_documents:

        timetable.append({
            "id": str(item["_id"]),
            "day": item.get("day"),
            "start_time": item.get("start_time"),
            "end_time": item.get("end_time"),
            "subject": item.get("subject"),
            "faculty": item.get("faculty"),
            "room": item.get("room"),
            "department": item.get("department"),
            "year": item.get("year"),
            "section": item.get("section")
        })

    # =====================================================
    # ASSIGNMENTS
    # =====================================================

    assignment_documents = list(
        db.assignments.find({
            "faculty": faculty_name
        }).sort(
            "due_date",
            1
        )
    )

    assignments = []

    for assignment in assignment_documents:

        assignments.append({
            "id": str(assignment["_id"]),
            "title": assignment.get("title"),
            "description": assignment.get("description"),
            "subject": assignment.get("subject"),
            "faculty": assignment.get("faculty"),
            "due_date": assignment.get("due_date"),
            "department": assignment.get("department"),
            "year": assignment.get("year"),
            "section": assignment.get("section")
        })

    # =====================================================
    # ATTENDANCE
    # =====================================================

    attendance_documents = list(
        db.attendance.find({
            "faculty": faculty_name
        }).sort(
            "date",
            -1
        )
    )

    attendance = []

    for record in attendance_documents:

        attendance.append({
            "id": str(record["_id"]),
            "student_id": record.get("student_id"),
            "subject": record.get("subject"),
            "date": record.get("date"),
            "status": record.get("status"),
            "faculty": record.get("faculty")
        })

    # =====================================================
    # NOTICES
    # =====================================================

    notice_documents = list(
        db.notices.find().sort(
            "created_at",
            -1
        )
    )

    notices = []

    for notice in notice_documents:

        notices.append({
            "id": str(notice["_id"]),
            "title": notice.get("title"),
            "content": notice.get("content"),
            "created_at": notice.get("created_at")
        })

    # =====================================================
    # EVENTS
    # =====================================================

    event_documents = list(
        db.events.find().sort(
            "event_date",
            1
        )
    )

    events = []

    for event in event_documents:

        events.append({
            "id": str(event["_id"]),
            "title": event.get("title"),
            "description": event.get("description"),
            "event_date": event.get("event_date"),
            "event_time": event.get("event_time"),
            "location": event.get("location"),
            "organizer": event.get("organizer")
        })

    # =====================================================
    # CAMPUS RESOURCES
    # =====================================================

    resource_documents = list(
        db.campus_resources.find().sort(
            "created_at",
            -1
        )
    )

    campus_resources = []

    for resource in resource_documents:

        campus_resources.append({
            "id": str(resource["_id"]),
            "name": resource.get("name"),
            "category": resource.get("category"),
            "description": resource.get("description"),
            "location": resource.get("location"),
            "contact": resource.get("contact"),
            "opening_time": resource.get("opening_time"),
            "closing_time": resource.get("closing_time")
        })

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {
        "message": "Faculty dashboard",
        "faculty": {
            "id": str(faculty["_id"]),
            "faculty_id": faculty_id,
            "name": faculty_name,
            "email": faculty_email,
            "department": department,
            "role": faculty.get("role")
        },
        "sections": {
            "timetable": timetable,
            "assignments": assignments,
            "attendance": attendance,
            "notices": notices,
            "events": events,
            "campus_resources": campus_resources
        }
    }