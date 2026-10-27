import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import StudentFees from "./pages/student/Fees";   
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./pages/student/Dashboard";
import StudentAssignments from "./pages/student/Assignments";
import StudentAttendance from "./pages/student/Attendance";
import StudentClubs from "./pages/student/Clubs";
import StudentComplaints from "./pages/student/Complaints";
import StudentEvents from "./pages/student/Events";
import StudentExams from "./pages/student/Exams";
import StudentLostFound from "./pages/student/LostFound";
import StudentNotices from "./pages/student/Notices";
import StudentProfile from "./pages/student/Profile";
import StudentTimetable from "./pages/student/Timetable";

import StudentResources from "./pages/student/Resources";
import StudentNotifications from "./pages/student/Notifications";
import StudentAIAssistant from "./pages/student/AIAssistant";

import FacultyLayout from "./layouts/FacultyLayout";
import FacultyDashboard from "./pages/faculty/Dashboard";
import FacultyAssignments from "./pages/faculty/Assignments";
import FacultyAttendance from "./pages/faculty/Attendance";
import FacultyAnnouncements from "./pages/faculty/Announcements";
import FacultyStudents from "./pages/faculty/Students";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents from "./pages/admin/Students";
import AdminFaculty from "./pages/admin/Faculty";
import AdminAnnouncements from "./pages/admin/Announcements";
import AdminEvents from "./pages/admin/Events";
import AdminComplaints from "./pages/admin/Complaints";
import AdminClubs from "./pages/admin/Clubs";
import AdminAnalytics from "./pages/admin/Analytics";

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* STUDENT ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/exams" element={<StudentExams />} />
          <Route path="/student/timetable" element={<StudentTimetable />} />
          <Route path="/student/Fees" element={<StudentFees />} />
          <Route path="/student/notices" element={<StudentNotices />} />
          <Route path="/student/events" element={<StudentEvents />} />
          <Route path="/student/resources" element={<StudentResources />} />  
          <Route path="/student/complaints" element={<StudentComplaints />} />
          <Route path="/student/lost-found" element={<StudentLostFound />} />
          <Route path="/student/clubs" element={<StudentClubs />} />
          <Route path="/student/notifications" element={<StudentNotifications />} />
          <Route path="/student/ai-assistant" element={<StudentAIAssistant />} />
          <Route path="/student/profile" element={<StudentProfile />} />
        </Route>
      </Route>

      {/* FACULTY ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={["faculty"]} />}>
        <Route element={<FacultyLayout />}>
          <Route path="/faculty" element={<Navigate to="/faculty/dashboard" replace />} />
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/faculty/assignments" element={<FacultyAssignments />} />
          <Route path="/faculty/attendance" element={<FacultyAttendance />} />
          <Route path="/faculty/announcements" element={<FacultyAnnouncements />} />
          <Route path="/faculty/students" element={<FacultyStudents />} />
        </Route>
      </Route>

      {/* ADMIN ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/faculty" element={<AdminFaculty />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/clubs" element={<AdminClubs />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Route>
      </Route>

      {/* DEFAULT REDIRECTS */}
      <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;