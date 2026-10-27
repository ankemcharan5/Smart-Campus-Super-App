from datetime import datetime, timezone
from bson import ObjectId
from typing import Dict, Any, List, Optional
from app.database.connection import db


def _get_student_from_user(current_user: Dict[str, Any]) -> Dict[str, Any]:
    """Helper to fetch student record using authenticated JWT user context."""
    user_id = current_user.get("user_id")
    if not user_id:
        return {}
    try:
        obj_id = ObjectId(user_id)
        student = db.users.find_one({"_id": obj_id})
        return student or {}
    except Exception:
        return {}


def get_student_profile(current_user: Dict[str, Any]) -> Dict[str, Any]:
    """Fetch authenticated student's profile information."""
    student = _get_student_from_user(current_user)
    if not student:
        return {"error": "Student profile not found."}
    return {
        "name": student.get("name"),
        "email": student.get("email"),
        "student_id": student.get("student_id"),
        "department": student.get("department"),
        "year": student.get("year"),
        "role": student.get("role"),
    }


def get_attendance(
    current_user: Dict[str, Any], subject: Optional[str] = None
) -> Dict[str, Any]:
    """
    Fetch attendance records and calculate attendance percentages for the student.
    Can filter by specific subject.
    """
    student = _get_student_from_user(current_user)
    student_id = student.get("student_id")
    if not student_id:
        return {"error": "Student ID not found for current user."}

    query: Dict[str, Any] = {"student_id": student_id}
    if subject:
        query["subject"] = {"$regex": f"^{subject}$", "$options": "i"}

    records = list(db.attendance.find(query).sort("date", -1))
    total_classes = len(records)
    present_classes = sum(1 for r in records if r.get("status") == "Present")
    percentage = (
        round((present_classes / total_classes) * 100, 1) if total_classes > 0 else 0
    )

    # Subject-wise breakdown
    subject_map: Dict[str, Dict[str, int]] = {}
    for r in records:
        subj = r.get("subject", "Unknown")
        if subj not in subject_map:
            subject_map[subj] = {"total": 0, "present": 0}
        subject_map[subj]["total"] += 1
        if r.get("status") == "Present":
            subject_map[subj]["present"] += 1

    subject_breakdown = []
    for s_name, counts in subject_map.items():
        pct = (
            round((counts["present"] / counts["total"]) * 100, 1)
            if counts["total"] > 0
            else 0
        )
        subject_breakdown.append(
            {
                "subject": s_name,
                "total": counts["total"],
                "present": counts["present"],
                "percentage": pct,
                "warning": pct < 75,
            }
        )

    formatted_records = [
        {
            "id": str(r["_id"]),
            "subject": r.get("subject"),
            "date": r.get("date"),
            "status": r.get("status"),
            "faculty": r.get("faculty"),
        }
        for r in records[:10]
    ]

    return {
        "student_id": student_id,
        "total_classes": total_classes,
        "present_classes": present_classes,
        "overall_percentage": percentage,
        "is_low_attendance": percentage < 75 if total_classes > 0 else False,
        "subject_breakdown": subject_breakdown,
        "recent_records": formatted_records,
    }


def get_assignments(
    current_user: Dict[str, Any], pending_only: bool = False
) -> Dict[str, Any]:
    """Fetch assignments for the student's department and year."""
    student = _get_student_from_user(current_user)
    department = student.get("department")
    year = student.get("year")

    query: Dict[str, Any] = {}
    if department:
        query["department"] = department
    if year is not None:
        query["year"] = year

    assignment_docs = list(db.assignments.find(query).sort("due_date", 1))
    assignments = []
    for a in assignment_docs:
        assignments.append(
            {
                "id": str(a["_id"]),
                "title": a.get("title"),
                "subject": a.get("subject"),
                "faculty": a.get("faculty"),
                "due_date": a.get("due_date"),
                "description": a.get("description"),
                "department": a.get("department"),
                "year": a.get("year"),
            }
        )

    return {
        "count": len(assignments),
        "assignments": assignments,
    }


def get_results(
    current_user: Dict[str, Any], semester: Optional[int] = None
) -> Dict[str, Any]:
    """Fetch academic marks, grades and exam results for the student."""
    student = _get_student_from_user(current_user)
    student_id = student.get("student_id")
    if not student_id:
        return {"error": "Student ID not found."}

    query: Dict[str, Any] = {"student_id": student_id}
    if semester is not None:
        query["semester"] = semester

    result_docs = list(
        db.results.find(query).sort([("semester", 1), ("subject", 1)])
    )
    results = []
    total_obtained = 0
    total_max = 0
    for r in result_docs:
        marks = float(r.get("marks", 0) or 0)
        max_marks = float(r.get("max_marks", 100) or 100)
        total_obtained += marks
        total_max += max_marks
        results.append(
            {
                "id": str(r["_id"]),
                "subject": r.get("subject"),
                "exam": r.get("exam"),
                "marks": marks,
                "max_marks": max_marks,
                "grade": r.get("grade"),
                "semester": r.get("semester"),
            }
        )

    average_percentage = (
        round((total_obtained / total_max) * 100, 1) if total_max > 0 else 0
    )

    return {
        "student_id": student_id,
        "count": len(results),
        "average_percentage": average_percentage,
        "results": results,
    }


def get_fees(
    current_user: Dict[str, Any], pending_only: bool = False
) -> Dict[str, Any]:
    """
    Fetch fee status for the authenticated student.
    Calculates Total Fees, Paid Amount, Due Amount, and Pending Records Count.
    """
    student = _get_student_from_user(current_user)
    student_id = student.get("student_id")
    if not student_id:
        return {"error": "Student ID not found."}

    fee_docs = list(db.fees.find({"student_id": student_id}).sort("due_date", 1))

    total_amount = sum(float(f.get("amount", 0) or 0) for f in fee_docs)
    paid_amount = sum(
        float(f.get("amount", 0) or 0)
        for f in fee_docs
        if f.get("status") == "Paid"
    )
    due_amount = total_amount - paid_amount
    pending_records = [f for f in fee_docs if f.get("status") != "Paid"]

    fees_list = []
    for f in fee_docs:
        if pending_only and f.get("status") == "Paid":
            continue
        fees_list.append(
            {
                "id": str(f["_id"]),
                "fee_type": f.get("fee_type"),
                "amount": float(f.get("amount", 0) or 0),
                "due_date": f.get("due_date"),
                "status": f.get("status"),
                "semester": f.get("semester"),
            }
        )

    return {
        "student_id": student_id,
        "total_fees": total_amount,
        "paid_amount": paid_amount,
        "due_amount": due_amount,
        "pending_count": len(pending_records),
        "fees": fees_list,
    }


def get_notices(
    current_user: Dict[str, Any], limit: int = 5
) -> Dict[str, Any]:
    """Fetch latest official university notices."""
    docs = list(db.notices.find().sort("created_at", -1).limit(limit))
    notices = [
        {
            "id": str(n["_id"]),
            "title": n.get("title"),
            "content": n.get("content"),
            "created_at": (
                n.get("created_at").isoformat()
                if isinstance(n.get("created_at"), datetime)
                else str(n.get("created_at") or "")
            ),
        }
        for n in docs
    ]
    return {"count": len(notices), "notices": notices}


def get_events(
    current_user: Dict[str, Any], limit: int = 5
) -> Dict[str, Any]:
    """Fetch upcoming campus events."""
    docs = list(db.events.find().sort("event_date", 1).limit(limit))
    events = [
        {
            "id": str(e["_id"]),
            "title": e.get("title"),
            "description": e.get("description"),
            "event_date": e.get("event_date"),
            "event_time": e.get("event_time"),
            "location": e.get("location"),
            "organizer": e.get("organizer"),
        }
        for e in docs
    ]
    return {"count": len(events), "events": events}


def get_timetable(
    current_user: Dict[str, Any], day: Optional[str] = None
) -> Dict[str, Any]:
    """Fetch weekly or daily class timetable for the student."""
    student = _get_student_from_user(current_user)
    query: Dict[str, Any] = {}
    if day:
        query["day"] = {"$regex": f"^{day}$", "$options": "i"}
    if student.get("department"):
        query["department"] = student.get("department")

    docs = list(db.timetable.find(query).sort([("day", 1), ("start_time", 1)]))
    timetable = [
        {
            "id": str(t["_id"]),
            "day": t.get("day"),
            "start_time": t.get("start_time"),
            "end_time": t.get("end_time"),
            "subject": t.get("subject"),
            "faculty": t.get("faculty"),
            "room": t.get("room"),
        }
        for t in docs
    ]
    return {"count": len(timetable), "day": day, "timetable": timetable}


def get_notifications(
    current_user: Dict[str, Any], unread_only: bool = False
) -> Dict[str, Any]:
    """Fetch notifications for the authenticated student."""
    user_id = current_user.get("user_id")
    query: Dict[str, Any] = {"user_id": user_id}
    if unread_only:
        query["is_read"] = False

    docs = list(db.notifications.find(query).sort("created_at", -1))
    notifications = [
        {
            "id": str(n["_id"]),
            "title": n.get("title"),
            "message": n.get("message"),
            "type": n.get("notification_type", "general"),
            "is_read": n.get("is_read", False),
        }
        for n in docs
    ]
    return {"count": len(notifications), "notifications": notifications}


def get_complaints(current_user: Dict[str, Any]) -> Dict[str, Any]:
    """Fetch complaints submitted by the student."""
    student = _get_student_from_user(current_user)
    student_id = student.get("student_id")
    docs = list(db.complaints.find({"student_id": student_id}).sort("created_at", -1))
    complaints = [
        {
            "id": str(c["_id"]),
            "title": c.get("title"),
            "description": c.get("description"),
            "category": c.get("category"),
            "status": c.get("status"),
        }
        for c in docs
    ]
    return {"count": len(complaints), "complaints": complaints}


def get_lost_found(
    current_user: Dict[str, Any], item_type: Optional[str] = None
) -> Dict[str, Any]:
    """Fetch lost and found campus listings."""
    query: Dict[str, Any] = {}
    if item_type:
        query["type"] = item_type
    docs = list(db.lost_found.find(query).sort("created_at", -1))
    items = [
        {
            "id": str(item["_id"]),
            "item_name": item.get("item_name"),
            "type": item.get("type"),
            "description": item.get("description"),
            "location": item.get("location"),
            "date": item.get("date"),
            "status": item.get("status"),
        }
        for item in docs
    ]
    return {"count": len(items), "items": items}


def get_campus_resources(
    current_user: Dict[str, Any], category: Optional[str] = None
) -> Dict[str, Any]:
    """Fetch campus facilities, libraries, labs, and support resources."""
    query: Dict[str, Any] = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    docs = list(db.campus_resources.find(query).sort("name", 1))
    resources = [
        {
            "id": str(r["_id"]),
            "name": r.get("name"),
            "category": r.get("category"),
            "description": r.get("description"),
            "location": r.get("location"),
            "contact": r.get("contact"),
            "opening_time": r.get("opening_time"),
            "closing_time": r.get("closing_time"),
        }
        for r in docs
    ]
    return {"count": len(resources), "resources": resources}


def get_academic_summary(current_user: Dict[str, Any]) -> Dict[str, Any]:
    """
    Synthesize complete academic summary combining attendance, assignments,
    results, and fees status for the student.
    """
    profile = get_student_profile(current_user)
    attendance = get_attendance(current_user)
    assignments = get_assignments(current_user)
    results = get_results(current_user)
    fees = get_fees(current_user)

    return {
        "student": profile,
        "attendance": {
            "percentage": attendance.get("overall_percentage", 0),
            "total_classes": attendance.get("total_classes", 0),
            "is_low": attendance.get("is_low_attendance", False),
        },
        "assignments": {
            "total": assignments.get("count", 0),
        },
        "results": {
            "average_percentage": results.get("average_percentage", 0),
            "total_exams": results.get("count", 0),
        },
        "fees": {
            "total": fees.get("total_fees", 0),
            "paid": fees.get("paid_amount", 0),
            "due": fees.get("due_amount", 0),
            "pending_count": fees.get("pending_count", 0),
        },
    }


# Map tool names to python callable functions
TOOLS_REGISTRY = {
    "get_student_profile": get_student_profile,
    "get_attendance": get_attendance,
    "get_assignments": get_assignments,
    "get_results": get_results,
    "get_fees": get_fees,
    "get_notices": get_notices,
    "get_events": get_events,
    "get_timetable": get_timetable,
    "get_notifications": get_notifications,
    "get_complaints": get_complaints,
    "get_lost_found": get_lost_found,
    "get_campus_resources": get_campus_resources,
    "get_academic_summary": get_academic_summary,
}
