from typing import Dict, Any, List, Optional
from app.ai.agent import SmartCampusAgent
from app.ai.tools import (
    get_attendance,
    get_fees,
    get_assignments,
    get_events,
    get_notices,
    get_student_profile,
)

_agent = SmartCampusAgent()


def process_chat(
    message: str,
    current_user: Dict[str, Any],
    history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """Execute student request via SmartCampusAgent."""
    return _agent.run(message, current_user, history)


def get_proactive_insights(current_user: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate proactive notifications and recommendations by analyzing real MongoDB records.
    """
    insights = []

    # 1. Fee Proactive Insights
    try:
        fees_data = get_fees(current_user)
        due_amount = fees_data.get("due_amount", 0)
        pending_count = fees_data.get("pending_count", 0)
        if due_amount > 0:
            insights.append(
                {
                    "id": "fee-due",
                    "type": "warning",
                    "category": "fees",
                    "title": "Pending Fee Payment",
                    "message": f"You have ₹{int(due_amount):,} in pending fees across {pending_count} record(s). Please clear dues on time.",
                    "action_text": "Pay Fees",
                    "action_url": "/student/fees",
                }
            )
    except Exception:
        pass

    # 2. Attendance Proactive Insights
    try:
        att_data = get_attendance(current_user)
        pct = att_data.get("overall_percentage", 0)
        if att_data.get("is_low_attendance"):
            insights.append(
                {
                    "id": "low-attendance",
                    "type": "danger",
                    "category": "attendance",
                    "title": "Low Attendance Warning",
                    "message": f"Your overall attendance is {pct}%, which is below the mandatory 75% threshold.",
                    "action_text": "View Attendance",
                    "action_url": "/student/attendance",
                }
            )
        for subj in att_data.get("subject_breakdown", []):
            if subj.get("warning"):
                insights.append(
                    {
                        "id": f"low-att-{subj['subject']}",
                        "type": "warning",
                        "category": "attendance",
                        "title": f"Low Attendance in {subj['subject']}",
                        "message": f"{subj['subject']} attendance is {subj['percentage']}% ({subj['present']}/{subj['total']} classes).",
                        "action_text": "Check Details",
                        "action_url": "/student/attendance",
                    }
                )
    except Exception:
        pass

    # 3. Assignment Proactive Insights
    try:
        assign_data = get_assignments(current_user)
        assignments = assign_data.get("assignments", [])
        if assignments:
            insights.append(
                {
                    "id": "assignments-active",
                    "type": "info",
                    "category": "assignments",
                    "title": "Active Assignments",
                    "message": f"You have {len(assignments)} assignment(s) assigned to your department.",
                    "action_text": "View Assignments",
                    "action_url": "/student/assignments",
                }
            )
    except Exception:
        pass

    # 4. Events Proactive Insights
    try:
        events_data = get_events(current_user, limit=2)
        events = events_data.get("events", [])
        if events:
            ev = events[0]
            insights.append(
                {
                    "id": f"event-{ev['id']}",
                    "type": "info",
                    "category": "events",
                    "title": f"Upcoming: {ev['title']}",
                    "message": f"Scheduled for {ev['event_date']} at {ev['event_time']} in {ev['location']}.",
                    "action_text": "View Events",
                    "action_url": "/student/events",
                }
            )
    except Exception:
        pass

    return insights
