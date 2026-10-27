from fastapi import APIRouter, Depends, status
from app.database.connection import db
from app.utils.jwt import get_current_user
from app.utils.roles import require_role


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/dashboard")
def admin_dashboard(
    current_user=Depends(get_current_user)
):

    # =====================================================
    # ADMIN ROLE CHECK
    # =====================================================

    require_role(
        current_user,
        ["admin"]
    )

    # =====================================================
    # ADMIN USER
    # =====================================================

    admin_user = db.users.find_one({
        "_id": __import__("bson").ObjectId(
            current_user["user_id"]
        )
    })

    if not admin_user:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )

    # =====================================================
    # USERS
    # =====================================================

    user_documents = list(
        db.users.find()
    )

    users = []

    for user in user_documents:

        users.append({
            "id": str(user["_id"]),
            "name": user.get("name"),
            "email": user.get("email"),
            "role": user.get("role"),
            "department": user.get("department"),
            "student_id": user.get("student_id"),
            "faculty_id": user.get("faculty_id")
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
    # TIMETABLE
    # =====================================================

    timetable_documents = list(
        db.timetable.find()
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
    # ATTENDANCE
    # =====================================================

    attendance_documents = list(
        db.attendance.find()
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
    # ASSIGNMENTS
    # =====================================================

    assignment_documents = list(
        db.assignments.find()
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
    # RESULTS
    # =====================================================

    result_documents = list(
        db.results.find()
    )

    results = []

    for result in result_documents:

        results.append({
            "id": str(result["_id"]),
            "student_id": result.get("student_id"),
            "subject": result.get("subject"),
            "exam": result.get("exam"),
            "marks": result.get("marks"),
            "max_marks": result.get("max_marks"),
            "grade": result.get("grade"),
            "semester": result.get("semester"),
            "department": result.get("department"),
            "year": result.get("year")
        })

    # =====================================================
    # FEES
    # =====================================================

    fee_documents = list(
        db.fees.find()
    )

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
            "year": fee.get("year")
        })

    # =====================================================
    # COMPLAINTS
    # =====================================================

    complaint_documents = list(
        db.complaints.find().sort(
            "created_at",
            -1
        )
    )

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

    # =====================================================
    # LOST & FOUND
    # =====================================================

    lost_found_documents = list(
        db.lost_found.find().sort(
            "created_at",
            -1
        )
    )

    lost_found = []

    for item in lost_found_documents:

        lost_found.append({
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

    # =====================================================
    # CAMPUS RESOURCES
    # =====================================================

    resource_documents = list(
        db.campus_resources.find()
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
    # STATISTICS
    # =====================================================

    statistics = {
        "total_users": db.users.count_documents({}),
        "total_students": db.users.count_documents({
            "role": "student"
        }),
        "total_faculty": db.users.count_documents({
            "role": "faculty"
        }),
        "total_admins": db.users.count_documents({
            "role": "admin"
        }),
        "total_notices": db.notices.count_documents({}),
        "total_events": db.events.count_documents({}),
        "total_timetable_entries": db.timetable.count_documents({}),
        "total_attendance_records": db.attendance.count_documents({}),
        "total_assignments": db.assignments.count_documents({}),
        "total_results": db.results.count_documents({}),
        "total_fees": db.fees.count_documents({}),
        "total_complaints": db.complaints.count_documents({}),
        "total_lost_found": db.lost_found.count_documents({}),
        "total_campus_resources": db.campus_resources.count_documents({})
    }

    # =====================================================
    # FINAL RESPONSE
    # =====================================================

    return {
        "message": "Admin dashboard",

        "admin": {
            "id": str(admin_user["_id"]),
            "name": admin_user.get("name"),
            "email": admin_user.get("email"),
            "role": admin_user.get("role"),
            "department": admin_user.get("department")
        },

        "statistics": statistics,

        "sections": {
            "users": users,
            "notices": notices,
            "events": events,
            "timetable": timetable,
            "attendance": attendance,
            "assignments": assignments,
            "results": results,
            "fees": fees,
            "complaints": complaints,
            "lost_found": lost_found,
            "campus_resources": campus_resources
        }
    }