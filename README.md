# 🎓 Smart Campus Super App

> A Next-Generation University & Student Portal with an **Autonomous Agentic AI Assistant**, built with **FastAPI**, **React + Vite**, and **MongoDB Atlas**.

---

## 🌟 Overview & Highlights

Smart Campus Super App is a full-stack, enterprise-grade digital university management system. It unifies academic records, student finance, timetables, grievances, campus resources, and introduces a **grounded Agentic AI Assistant** capable of multi-step tool execution over MongoDB records.

---

## 🤖 Real Agentic AI Assistant

Unlike simple text chatbots, the **Smart Campus Agentic AI** is built on a controlled multi-tool execution framework:
- **Zero Hallucination & Security First**: The AI never directly executes arbitrary MongoDB queries. It invokes strictly typed, read-only Python tools scoped strictly to the authenticated student's JWT identity (`student_id` is derived from the verified token).
- **13 Controlled Tools**:
  1. `get_student_profile` — Fetches name, roll ID, year, and department.
  2. `get_attendance` — Calculates subject-wise and overall attendance percentages.
  3. `get_assignments` — Lists upcoming coursework deadlines for the student's department.
  4. `get_results` — Aggregates exam scores, maximum marks, and GPA/grades.
  5. `get_fees` — Returns exact fee statements (`Total: ₹4,500`, `Paid: ₹1,000`, `Due: ₹3,500`, `Pending: 2`).
  6. `get_timetable` — Retrieves weekly class schedule, room numbers, and faculty details.
  7. `get_notices` — Fetches campus circulars and official university announcements.
  8. `get_events` — Lists upcoming hackathons, cultural fests, and workshops.
  9. `get_complaints` — Checks grievance status and administrative responses.
  10. `get_lost_found` — Searches lost and found listings on the community board.
  11. `get_campus_resources` — Provides library, laboratory, and sports facility hours.
  12. `get_notifications` — Lists unread student alerts and notifications.
  13. `get_academic_summary` — Multi-tool aggregator providing a holistic academic overview.
- **Proactive Intelligence**: Analyzes live student data to provide proactive warning banners (e.g. Low attendance warnings under 75%, pending fee deadlines).
- **Tool Telemetry UI**: Real-time visual pill badges indicating exactly which backend tools were executed for complete transparency.

---

## 📱 Modules & Features

### 1. Student Portal (`/student/*`)
- **Dashboard**: High-level overview featuring the verified **Fees Card** (Total: ₹4,500, Paid: ₹1,000, Due: ₹3,500, 2 Pending), attendance gauges, today's classes, and AI proactive insight banners.
- **Fee Payments (`/student/fees`)**: Full fee statement breakdown, payment gateway simulation, and instant PDF receipt generation.
- **Attendance (`/student/attendance`)**: Subject-wise percentage bars, 75% threshold warnings, and date-wise attendance log.
- **Timetable (`/student/timetable`)**: Day-selector tabs (Monday–Saturday) with lecture timings and room locations.
- **Assignments (`/student/assignments`)**: Coursework list with deadlines, status badges, and assignment submission modal.
- **Exams & Results (`/student/exams`)**: Cumulative GPA, average percentage calculation, and semester grade cards.
- **Grievance Redressal (`/student/complaints`)**: Real complaint submission form with category selection and status tracking.
- **Lost & Found (`/student/lost-found`)**: Community board with "Report Item" modal for lost/found belongings.
- **Campus Facilities (`/student/resources`)**: Operating hours, locations, and contacts for libraries, labs, and sports complexes.
- **Notifications (`/student/notifications`)**: Inbox with mark-as-read and mark-all-read actions.
- **AI Assistant (`/student/ai-assistant`)**: Dedicated full-page AI chat workspace with speech-to-text voice input.
- **Profile (`/student/profile`)**: Student identity, department enrollment, and account security credentials.

### 2. Faculty Portal (`/faculty/*`)
- Coursework assignment management.
- Class attendance logging and tracking.
- Department announcements broadcast.
- Enrolled students roster.

### 3. Admin Portal (`/admin/*`)
- University analytics and system metrics.
- Student and faculty directory management.
- Campus-wide announcements, fests, and event publishing.
- Grievance resolution workflows.

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `phase11student@example.com` | `StudentPass123!` |
| **Faculty** | `faculty1@smartcampus.edu` | `FacultyPass123!` |
| **Admin** | `admin@smartcampus.edu` | `AdminPass123!` |

*(A Quick Role Switcher is also available on the Login page for instant one-click testing)*

---

## 🛠️ Technology Stack

- **Backend**: Python 3.11+, FastAPI, Uvicorn, PyMongo, Pydantic, python-jose (JWT), Passlib (Bcrypt).
- **Database**: MongoDB Atlas (12 collections: `users`, `fees`, `attendance`, `assignments`, `results`, `notices`, `events`, `timetable`, `complaints`, `lost_found`, `campus_resources`, `notifications`).
- **Frontend**: React 18, Vite, Vanilla Tailwind CSS (Modern SaaS Glassmorphism Dark Theme), Lucide React, Axios.
- **AI Engine**: Hybrid Agentic Framework (Gemini / OpenAI tool calling with intelligent deterministic fallback execution).

---

## 🚀 Local Development Setup

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at: `http://localhost:8000`  
Swagger API Docs: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend/frontend
npm install
npm run dev
```
Frontend Web App will be live at: `http://localhost:5173`

---

## 🧪 Automated Testing

To run the automated backend test suite covering fee math, AI tool calling, proactive insights, and student isolation:

```bash
cd backend
pytest tests/test_backend.py -v
```

**Results:**
```text
tests/test_backend.py::test_student_fee_calculation PASSED
tests/test_backend.py::test_ai_agent_fee_query PASSED
tests/test_backend.py::test_ai_agent_attendance_query PASSED
tests/test_backend.py::test_ai_agent_academic_summary PASSED
tests/test_backend.py::test_proactive_insights PASSED
tests/test_backend.py::test_student_isolation PASSED

6 passed in 1.62s
```

---

## ☁️ Deployment Instructions

### Backend (Render / Railway / Heroku)
1. Push the repository to GitHub.
2. Link repository to [Render](https://render.com) using the included `render.yaml` blueprint or as a Web Service:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Set Environment Variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `DB_NAME`: `smart_campus`
   - `JWT_SECRET`: A secure random string.

### Frontend (Vercel / Netlify)
1. Link the repository to [Vercel](https://vercel.com).
2. Set Root Directory: `frontend/frontend`
3. Set Environment Variable:
   - `VITE_API_URL`: URL of your deployed backend (e.g. `https://smart-campus-backend.onrender.com`)
4. Build Command: `npm run build`, Output Directory: `dist`.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
