from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.database.connection import db
from app.utils.jwt import get_current_user
from app.utils.roles import require_role


router = APIRouter(
    prefix="/student",
    tags=["Student Dashboard"]
)


@router.get("/dashboard")
def get_student_dashboard(
    current_user=Depends(get_current_user)
):

    # 1. Only students can access dashboard
    require_role(current_user, ["student"])

    # 2. Get user ID from JWT
    user_id = current_user.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID missing from token"
        )

    # 3. Convert user ID to MongoDB ObjectId
    try:
        object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )

    # 4. Find student in MongoDB
    student = db.users.find_one({
        "_id": object_id
    })

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )

    # ==================================================
    # 5. GET NOTICES FROM MONGODB
    # ==================================================

    notice_documents = list(
        db.notices.find().sort("created_at", -1)
    )

    notices = []

    for notice in notice_documents:
        notices.append({
            "id": str(notice["_id"]),
            "title": notice.get("title"),
            "content": notice.get("content"),
            "created_at": notice.get("created_at")
        })

    
    # Get events from MongoDB
    event_documents = list(
    db.events.find().sort("event_date", 1)
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
    # Get timetable from MongoDB
    timetable_documents = list(
        db.timetable.find().sort(
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
        # Get attendance for current student
    student_id = student.get("student_id")

    attendance_documents = list(
        db.attendance.find({
            "student_id": student_id
        }).sort("date", -1)
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
        # Get assignments for current student's department and year
        student_department = student.get("department")
    student_year = student.get("year")

    assignment_documents = list(
        db.assignments.find({
            "department": student_department,
            "year": student_year
        }).sort("due_date", 1)
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
        # Get results for current student
    student_id = student.get("student_id")

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
        # Get fees for current student

    student_id = student.get("student_id")

    fee_documents = list(
        db.fees.find({
            "student_id": student_id
        }).sort(
            "due_date",
            1
        )
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
        # ==================================================
# GET COMPLAINTS FOR CURRENT STUDENT
# ==================================================

    complaint_documents = list(
        db.complaints.find({
            "student_id": student_id
        }).sort(
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
        # ==================================================
# GET LOST & FOUND ITEMS
# ==================================================

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
        # ==================================================
# GET CAMPUS RESOURCES
# ==================================================

    resource_documents = list(
        db.campus_resources.find().sort(
            "created_at",
        -   1
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
            "closing_time": resource.get("closing_time"),
            "created_at": resource.get("created_at"),
            "updated_at": resource.get("updated_at")
        })
    # ==================================================
    # 6. RETURN STUDENT DASHBOARD
    # ==================================================

    return {
        "message": "Student dashboard",

        "student": {
            "id": str(student["_id"]),
            "name": student.get("name"),
            "email": student.get("email"),
            "student_id": student.get("student_id"),
            "department": student.get("department"),
            "year": student.get("year"),
            "role": student.get("role")
        },

        "sections": {
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