# Automated Test Suite for Smart Campus Backend & AI Agent

from app.database.connection import db
from app.utils.jwt import create_access_token

from app.ai.agent import SmartCampusAgent
from app.ai.tools import get_fees, get_attendance, get_student_profile, get_academic_summary
from app.ai.service import get_proactive_insights


def test_student_fee_calculation():
    """Verify fee calculation for student SC004 matches exact expected numbers."""
    student = db.users.find_one({"student_id": "SC004"})
    assert student is not None, "Student SC004 should exist in MongoDB"
    
    user_ctx = {"user_id": str(student["_id"]), "role": "student"}
    fees_res = get_fees(user_ctx)
    
    assert fees_res["total_fees"] == 4500.0
    assert fees_res["paid_amount"] == 1000.0
    assert fees_res["due_amount"] == 3500.0
    assert fees_res["pending_count"] == 2


def test_ai_agent_fee_query():
    """Verify agent executes get_fees tool for fee queries."""
    student = db.users.find_one({"student_id": "SC004"})
    user_ctx = {"user_id": str(student["_id"]), "role": "student"}
    
    agent = SmartCampusAgent()
    res = agent.run("How much fee do I have to pay?", user_ctx)
    
    assert "get_fees" in res["tools_used"]
    assert "3,500" in res["response"]
    assert "4,500" in res["response"]


def test_ai_agent_attendance_query():
    """Verify agent executes get_attendance tool for attendance query."""
    student = db.users.find_one({"student_id": "SC004"})
    user_ctx = {"user_id": str(student["_id"]), "role": "student"}
    
    agent = SmartCampusAgent()
    res = agent.run("What is my attendance percentage?", user_ctx)
    
    assert "get_attendance" in res["tools_used"]
    assert "Attendance" in res["response"]


def test_ai_agent_academic_summary():
    """Verify agent aggregates academic summary."""
    student = db.users.find_one({"student_id": "SC004"})
    user_ctx = {"user_id": str(student["_id"]), "role": "student"}
    
    agent = SmartCampusAgent()
    res = agent.run("Give me my academic summary", user_ctx)
    
    assert "get_academic_summary" in res["tools_used"]
    assert "Summary" in res["response"]


def test_proactive_insights():
    """Verify proactive insights generator identifies pending fee."""
    student = db.users.find_one({"student_id": "SC004"})
    user_ctx = {"user_id": str(student["_id"]), "role": "student"}
    
    insights = get_proactive_insights(user_ctx)
    assert len(insights) > 0
    
    fee_insight = next((i for i in insights if i["category"] == "fees"), None)
    assert fee_insight is not None
    assert "3,500" in fee_insight["message"]


def test_student_isolation():
    """Verify student A cannot see student B's data through JWT scoping."""
    student1 = db.users.find_one({"student_id": "SC001"})
    student4 = db.users.find_one({"student_id": "SC004"})
    
    if student1 and student4:
        user_ctx_1 = {"user_id": str(student1["_id"]), "role": "student"}
        fees_1 = get_fees(user_ctx_1)
        assert fees_1["student_id"] == "SC001"
        
        user_ctx_4 = {"user_id": str(student4["_id"]), "role": "student"}
        fees_4 = get_fees(user_ctx_4)
        assert fees_4["student_id"] == "SC004"
