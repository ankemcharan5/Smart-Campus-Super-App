export const API_URL = "http://127.0.0.1:8000";

export const ROLES = {
  STUDENT: "student",
  FACULTY: "faculty",
  ADMIN: "admin",
};

export const studentMenu = [
  {
    label: "Dashboard",
    path: "/student/dashboard",
    icon: "LayoutDashboard",
  },
  {
    label: "Notices",
    path: "/student/notices",
    icon: "Bell",
  },
  {
    label: "Events",
    path: "/student/events",
    icon: "CalendarDays",
  },
  {
    label: "Timetable",
    path: "/student/timetable",
    icon: "CalendarClock",
  },
  {
    label: "Assignments",
    path: "/student/assignments",
    icon: "ClipboardList",
  },
  {
    label: "Results",
    path: "/student/results",
    icon: "GraduationCap",
  },
  {
    label: "Fees",
    path: "/student/fees",
    icon: "IndianRupee",
  },
  {
    label: "Complaints",
    path: "/student/complaints",
    icon: "CircleAlert",
  },
  {
    label: "Lost & Found",
    path: "/student/lost-found",
    icon: "Search",
  },
  {
    label: "Campus Resources",
    path: "/student/resources",
    icon: "MapPin",
  },
];

export const facultyMenu = [
  {
    label: "Dashboard",
    path: "/faculty/dashboard",
    icon: "LayoutDashboard",
  },
  {
    label: "Students",
    path: "/faculty/students",
    icon: "Users",
  },
  {
    label: "Attendance",
    path: "/faculty/attendance",
    icon: "ClipboardCheck",
  },
  {
    label: "Assignments",
    path: "/faculty/assignments",
    icon: "ClipboardList",
  },
  {
    label: "Announcements",
    path: "/faculty/announcements",
    icon: "Megaphone",
  },
];

export const adminMenu = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: "LayoutDashboard",
  },
  {
    label: "Analytics",
    path: "/admin/analytics",
    icon: "BarChart3",
  },
  {
    label: "Students",
    path: "/admin/students",
    icon: "Users",
  },
  {
    label: "Faculty",
    path: "/admin/faculty",
    icon: "GraduationCap",
  },
  {
    label: "Events",
    path: "/admin/events",
    icon: "CalendarDays",
  },
  {
    label: "Clubs",
    path: "/admin/clubs",
    icon: "UsersRound",
  },
  {
    label: "Complaints",
    path: "/admin/complaints",
    icon: "CircleAlert",
  },
];