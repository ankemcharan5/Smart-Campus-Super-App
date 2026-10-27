import os
import re
import json
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.ai.tools import TOOLS_REGISTRY
from app.ai.prompts import SYSTEM_PROMPT, TOOL_DEFINITIONS


class SmartCampusAgent:
    """
    Autonomous Agentic AI for Smart Campus Super App.
    Understands student intent, selects and executes backend tools with authenticated context,
    and synthesizes accurate, factual responses.
    """

    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY")
        self.groq_key = os.getenv("GROQ_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")

    def run(
        self,
        message: str,
        current_user: Dict[str, Any],
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """
        Main execution loop for student requests.
        """
        msg_clean = (message or "").strip()
        if not msg_clean:
            return {
                "response": "Hello! How can I assist you with your campus academics, timetable, fees, or events today?",
                "tools_used": [],
                "suggestions": [
                    "How is my attendance?",
                    "Do I have pending fees?",
                    "What assignments are due?",
                    "Show my timetable today",
                ],
            }

        # Try LLM tool calling if API key is configured
        if self.gemini_key or self.openai_key or self.groq_key:
            try:
                llm_res = self._try_llm_agent(msg_clean, current_user, history)
                if llm_res and llm_res.get("response"):
                    return llm_res
            except Exception as e:
                # Graceful fallback to native intent agent
                pass

        # Native autonomous intent-driven tool executor
        return self._native_agentic_reasoning(msg_clean, current_user)

    def _try_llm_agent(
        self,
        message: str,
        current_user: Dict[str, Any],
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Attempt to use Google Gemini / OpenAI with function calling.
        """
        try:
            if self.gemini_key:
                from google import genai
                from google.genai import types

                client = genai.Client(api_key=self.gemini_key)

                # Convert tools to genai declarations
                # For safety and speed, execute intent mapping tools and provide grounded data
                tools_used, tool_data = self._determine_and_execute_tools(
                    message, current_user
                )

                prompt = (
                    f"{SYSTEM_PROMPT}\n\n"
                    f"AUTHENTICATED STUDENT DATA RETRIEVED VIA CONTROLLED TOOLS:\n"
                    f"{json.dumps(tool_data, indent=2, default=str)}\n\n"
                    f"USER MESSAGE: {message}\n\n"
                    f"Please provide a helpful, concise, well-formatted response using ONLY the retrieved data above."
                )

                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                )

                return {
                    "response": response.text,
                    "tools_used": tools_used,
                    "suggestions": self._generate_suggestions(tools_used),
                }
        except Exception:
            return None
        return None

    def _determine_and_execute_tools(
        self, message: str, current_user: Dict[str, Any]
    ) -> tuple[List[str], Dict[str, Any]]:
        """
        Intelligently identify and execute all required tools for the query.
        """
        lowered = message.lower()
        tools_to_run = []

        # Intent classification rules
        if any(
            w in lowered
            for w in [
                "academic status",
                "academic summary",
                "overall status",
                "how am i doing",
                "performance",
            ]
        ):
            tools_to_run.append(("get_academic_summary", {}))
        else:
            if any(
                w in lowered
                for w in [
                    "attendance",
                    "absent",
                    "present",
                    "attended",
                    "classes",
                    "bunk",
                ]
            ):
                # Extract potential subject
                subject_match = None
                for subj in [
                    "Data Structures",
                    "Computer Networks",
                    "Operating Systems",
                    "Database Management",
                    "Algorithms",
                    "Mathematics",
                    "Software Engineering",
                ]:
                    if subj.lower() in lowered:
                        subject_match = subj
                        break
                tools_to_run.append(
                    ("get_attendance", {"subject": subject_match} if subject_match else {})
                )

            if any(
                w in lowered
                for w in [
                    "fee",
                    "fees",
                    "due",
                    "dues",
                    "payment",
                    "balance",
                    "paid",
                    "rupee",
                    "pending fee",
                ]
            ):
                tools_to_run.append(("get_fees", {}))

            if any(
                w in lowered
                for w in ["assignment", "assignments", "homework", "submission", "due date"]
            ):
                tools_to_run.append(("get_assignments", {}))

            if any(
                w in lowered
                for w in [
                    "result",
                    "results",
                    "marks",
                    "grade",
                    "grades",
                    "exam",
                    "exams",
                    "score",
                    "cgpa",
                    "gpa",
                ]
            ):
                tools_to_run.append(("get_results", {}))

            if any(
                w in lowered
                for w in [
                    "timetable",
                    "schedule",
                    "class today",
                    "next class",
                    "routine",
                    "period",
                ]
            ):
                # Check for day
                day = None
                for d in [
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                ]:
                    if d in lowered:
                        day = d.capitalize()
                        break
                if "today" in lowered and not day:
                    day = datetime.now().strftime("%A")
                tools_to_run.append(
                    ("get_timetable", {"day": day} if day else {})
                )

            if any(
                w in lowered
                for w in ["notice", "notices", "announcement", "circular", "broadcast"]
            ):
                tools_to_run.append(("get_notices", {"limit": 5}))

            if any(
                w in lowered
                for w in ["event", "events", "fest", "workshop", "webinar", "seminar"]
            ):
                tools_to_run.append(("get_events", {"limit": 5}))

            if any(w in lowered for w in ["complaint", "complaints", "grievance", "issue"]):
                tools_to_run.append(("get_complaints", {}))

            if any(
                w in lowered
                for w in ["lost", "found", "lost and found", "lost item", "wallet", "bottle"]
            ):
                tools_to_run.append(("get_lost_found", {}))

            if any(
                w in lowered
                for w in [
                    "resource",
                    "resources",
                    "library",
                    "lab",
                    "facility",
                    "cafeteria",
                    "sports",
                ]
            ):
                tools_to_run.append(("get_campus_resources", {}))

            if any(
                w in lowered
                for w in ["notification", "notifications", "alerts", "inbox"]
            ):
                tools_to_run.append(("get_notifications", {}))

            if any(
                w in lowered
                for w in ["who am i", "my profile", "student id", "my details", "student info"]
            ):
                tools_to_run.append(("get_student_profile", {}))

        # Default to academic summary if none matched but greetings or queries about status
        if not tools_to_run:
            if any(
                w in lowered
                for w in ["summary", "overview", "dashboard", "status", "profile"]
            ):
                tools_to_run.append(("get_academic_summary", {}))

        tools_used = []
        tool_data = {}

        for tool_name, params in tools_to_run:
            func = TOOLS_REGISTRY.get(tool_name)
            if func:
                tools_used.append(tool_name)
                try:
                    result = func(current_user, **params)
                    tool_data[tool_name] = result
                except Exception as ex:
                    tool_data[tool_name] = {"error": str(ex)}

        return tools_used, tool_data

    def _native_agentic_reasoning(
        self, message: str, current_user: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Native intent-based reasoning and synthesis generator when LLM is offline or no key is present.
        """
        tools_used, tool_data = self._determine_and_execute_tools(
            message, current_user
        )

        lowered = message.lower()

        # Handle greetings
        if not tools_used:
            if any(
                g in lowered
                for g in ["hi", "hello", "hey", "good morning", "good evening", "help"]
            ):
                profile = TOOLS_REGISTRY["get_student_profile"](current_user)
                name = profile.get("name", "Student")
                return {
                    "response": (
                        f"👋 Hello **{name}**! I am your **Smart Campus AI Assistant**.\n\n"
                        f"I can check your real-time academic records, fees, attendance, timetable, assignments, and campus updates. What would you like to check?"
                    ),
                    "tools_used": ["get_student_profile"],
                    "suggestions": [
                        "How is my attendance?",
                        "How much fee do I have pending?",
                        "What assignments are due?",
                        "Give me my academic status",
                    ],
                }
            return {
                "response": (
                    "I can help you look up your **attendance**, **fee dues**, **timetable**, "
                    "**assignments**, **results**, **notices**, and **campus resources**. "
                    "Try asking a specific question like *'What is my attendance?'* or *'Show my pending fees'*."
                ),
                "tools_used": [],
                "suggestions": [
                    "Check my attendance",
                    "Pending fee details",
                    "Upcoming assignments",
                    "Today's timetable",
                ],
            }

        response_parts = []

        # Format Tool Results into cohesive response
        if "get_academic_summary" in tool_data:
            summary = tool_data["get_academic_summary"]
            std = summary.get("student", {})
            att = summary.get("attendance", {})
            fees = summary.get("fees", {})
            assign = summary.get("assignments", {})
            res = summary.get("results", {})

            name = std.get("name", "Student")
            dept = std.get("department", "CSE")
            year = std.get("year", 2)
            pct = att.get("percentage", 0)
            due = fees.get("due", 0)
            p_assign = assign.get("total", 0)
            avg_marks = res.get("average_percentage", 0)

            status_icon = "⚠️" if (pct < 75 or due > 0) else "✅"

            response_parts.append(
                f"### {status_icon} Academic & Financial Summary for {name} ({dept}, Year {year})\n\n"
                f"- **📊 Overall Attendance:** **{pct}%** {'(⚠️ Low - Below 75% requirement)' if pct < 75 else '(Good standing)'}\n"
                f"- **📝 Active Assignments:** **{p_assign} assignments** currently listed\n"
                f"- **🎯 Average Marks:** **{avg_marks}%** across recorded exams\n"
                f"- **💰 Fee Status:** **₹{int(due):,} Due** (Total: ₹{int(fees.get('total', 0)):,} | Paid: ₹{int(fees.get('paid', 0)):,})\n"
            )

        if "get_attendance" in tool_data:
            att = tool_data["get_attendance"]
            pct = att.get("overall_percentage", 0)
            tot = att.get("total_classes", 0)
            prs = att.get("present_classes", 0)
            warning = "⚠️ **Warning:** Your attendance is below the 75% threshold." if att.get("is_low_attendance") else "✅ Your attendance satisfies campus requirements."

            breakdown_text = ""
            for s in att.get("subject_breakdown", []):
                flag = "⚠️ " if s.get("warning") else "✔️ "
                breakdown_text += f"\n  - {flag}**{s['subject']}**: {s['percentage']}% ({s['present']}/{s['total']} attended)"

            response_parts.append(
                f"### 📋 Attendance Details\n\n"
                f"- **Overall Percentage:** **{pct}%** ({prs} attended out of {tot} total classes)\n"
                f"- **Status:** {warning}\n"
                + (f"- **Subject Breakdown:**{breakdown_text}\n" if breakdown_text else "")
            )

        if "get_fees" in tool_data:
            f = tool_data["get_fees"]
            tot = int(f.get("total_fees", 0))
            paid = int(f.get("paid_amount", 0))
            due = int(f.get("due_amount", 0))
            pending_count = f.get("pending_count", 0)

            fee_records_text = ""
            for item in f.get("fees", []):
                badge = "🟢 Paid" if item["status"] == "Paid" else f"🔴 Pending (Due: {item['due_date']})"
                fee_records_text += f"\n  - **{item['fee_type']}**: ₹{int(item['amount']):,} — *{badge}*"

            response_parts.append(
                f"### 💳 Fee Summary\n\n"
                f"- **Total Fees:** **₹{tot:,}**\n"
                f"- **Paid Amount:** **₹{paid:,}**\n"
                f"- **Amount Due:** **₹{due:,}**\n"
                f"- **Pending Records:** **{pending_count} record(s)**\n"
                + (f"\n**Fee Breakdown:**{fee_records_text}\n" if fee_records_text else "")
            )

        if "get_assignments" in tool_data:
            a = tool_data["get_assignments"]
            items = a.get("assignments", [])
            if not items:
                response_parts.append("### 📚 Assignments\n\nYou currently have no active assignments listed.")
            else:
                items_text = ""
                for item in items:
                    items_text += f"\n  - **{item['title']}** ({item['subject']})\n    *Due Date: {item['due_date']}* | Faculty: {item['faculty']}"
                response_parts.append(
                    f"### 📚 Assignments ({len(items)} found)\n{items_text}\n"
                )

        if "get_results" in tool_data:
            r = tool_data["get_results"]
            results = r.get("results", [])
            avg = r.get("average_percentage", 0)
            if not results:
                response_parts.append("### 🎓 Examination Results\n\nNo exam results published yet.")
            else:
                res_text = ""
                for res in results:
                    res_text += f"\n  - **{res['subject']}** ({res['exam']}): **{res['marks']}/{res['max_marks']}** (Grade: {res['grade']})"
                response_parts.append(
                    f"### 🎓 Examination Results (Average: {avg}%)\n{res_text}\n"
                )

        if "get_timetable" in tool_data:
            t = tool_data["get_timetable"]
            day = t.get("day") or "Weekly"
            timetable = t.get("timetable", [])
            if not timetable:
                response_parts.append(f"### 🗓️ Timetable ({day})\n\nNo classes scheduled.")
            else:
                tt_text = ""
                for item in timetable:
                    tt_text += f"\n  - **{item['start_time']} - {item['end_time']}**: **{item['subject']}** | Room: {item['room']} ({item['faculty']})"
                response_parts.append(
                    f"### 🗓️ Timetable Schedule ({day})\n{tt_text}\n"
                )

        if "get_notices" in tool_data:
            n = tool_data["get_notices"]
            notices = n.get("notices", [])
            if not notices:
                response_parts.append("### 📢 Notices\n\nNo recent notices available.")
            else:
                n_text = ""
                for notice in notices:
                    n_text += f"\n  - **{notice['title']}**: {notice['content']}"
                response_parts.append(
                    f"### 📢 Official Notices\n{n_text}\n"
                )

        if "get_events" in tool_data:
            e = tool_data["get_events"]
            events = e.get("events", [])
            if not events:
                response_parts.append("### 🎪 Campus Events\n\nNo upcoming events listed.")
            else:
                e_text = ""
                for ev in events:
                    e_text += f"\n  - **{ev['title']}**: {ev['description']} (📅 {ev['event_date']} at {ev['event_time']}, 📍 {ev['location']})"
                response_parts.append(
                    f"### 🎪 Upcoming Events\n{e_text}\n"
                )

        if "get_complaints" in tool_data:
            c = tool_data["get_complaints"]
            complaints = c.get("complaints", [])
            if not complaints:
                response_parts.append("### 📝 Complaints\n\nYou have no complaints on record.")
            else:
                c_text = ""
                for comp in complaints:
                    c_text += f"\n  - **{comp['title']}** [{comp['category']}]: Status: *{comp['status']}*"
                response_parts.append(
                    f"### 📝 Your Complaints\n{c_text}\n"
                )

        if "get_lost_found" in tool_data:
            lf = tool_data["get_lost_found"]
            items = lf.get("items", [])
            if not items:
                response_parts.append("### 🔍 Lost & Found\n\nNo lost or found items reported.")
            else:
                lf_text = ""
                for item in items:
                    badge = "🔴 Lost" if item["type"] == "Lost" else "🟢 Found"
                    lf_text += f"\n  - {badge} **{item['item_name']}**: {item['description']} (📍 {item['location']}, Status: {item['status']})"
                response_parts.append(
                    f"### 🔍 Lost & Found Items\n{lf_text}\n"
                )

        if "get_campus_resources" in tool_data:
            cr = tool_data["get_campus_resources"]
            resources = cr.get("resources", [])
            if not resources:
                response_parts.append("### 🏛️ Campus Resources\n\nNo campus resources listed.")
            else:
                cr_text = ""
                for res in resources:
                    cr_text += f"\n  - **{res['name']}** ({res['category']}): {res['description']} | 📍 {res['location']} (🕒 {res['opening_time']} - {res['closing_time']})"
                response_parts.append(
                    f"### 🏛️ Campus Facilities & Resources\n{cr_text}\n"
                )

        if "get_student_profile" in tool_data and "get_academic_summary" not in tool_data:
            p = tool_data["get_student_profile"]
            response_parts.append(
                f"### 👤 Student Profile\n\n"
                f"- **Name:** {p.get('name')}\n"
                f"- **Student ID:** {p.get('student_id')}\n"
                f"- **Department:** {p.get('department')}\n"
                f"- **Year:** {p.get('year')}\n"
                f"- **Email:** {p.get('email')}\n"
            )

        final_response = "\n\n".join(response_parts)
        return {
            "response": final_response,
            "tools_used": tools_used,
            "suggestions": self._generate_suggestions(tools_used),
        }

    def _generate_suggestions(self, tools_used: List[str]) -> List[str]:
        suggestions_pool = [
            "How is my attendance in Data Structures?",
            "Show my fee dues",
            "What assignments are due?",
            "What is today's timetable?",
            "Show upcoming campus events",
            "Give me my academic summary",
        ]
        return [s for s in suggestions_pool if not any(t.replace("get_", "") in s.lower() for t in tools_used)][:4]
