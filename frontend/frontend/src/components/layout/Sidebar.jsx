import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardCheck,
  BookOpen,
  GraduationCap,
  Megaphone,
  Calendar,
  Layers,
  Search,
  Users,
  CreditCard,
  MessageSquareWarning,
  Bot,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Building2,
  ShieldCheck,
  Award,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

export function Sidebar({ role = "student", mobileOpen = false, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const studentMenu = [
    {
      group: "MAIN",
      items: [
        { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      group: "ACADEMICS",
      items: [
        { name: "Attendance", path: "/student/attendance", icon: ClipboardCheck },
        { name: "Assignments", path: "/student/assignments", icon: BookOpen },
        { name: "Exams & Results", path: "/student/exams", icon: GraduationCap },
        { name: "Timetable", path: "/student/timetable", icon: CalendarDays },
      ],
    },
    {
      group: "CAMPUS",
      items: [
        { name: "Notices", path: "/student/notices", icon: Megaphone },
        { name: "Events", path: "/student/events", icon: Calendar },
        { name: "Resources", path: "/student/resources", icon: Building2 },
        { name: "Lost & Found", path: "/student/lost-found", icon: Search },
        { name: "Clubs", path: "/student/clubs", icon: Users },
      ],
    },
    {
      group: "FINANCE",
      items: [
        { name: "Fees", path: "/student/fees", icon: CreditCard, badge: "Due" },
      ],
    },
    {
      group: "SUPPORT & AI",
      items: [
        { name: "AI Assistant", path: "/student/ai-assistant", icon: Bot, isAI: true },
        { name: "Complaints", path: "/student/complaints", icon: MessageSquareWarning },
      ],
    },
    {
      group: "ACCOUNT",
      items: [
        { name: "Notifications", path: "/student/notifications", icon: Bell },
        { name: "Profile", path: "/student/profile", icon: User },
      ],
    },
  ];

  const facultyMenu = [
    {
      group: "MAIN",
      items: [
        { name: "Dashboard", path: "/faculty/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      group: "MANAGEMENT",
      items: [
        { name: "Students", path: "/faculty/students", icon: Users },
        { name: "Assignments", path: "/faculty/assignments", icon: BookOpen },
        { name: "Attendance", path: "/faculty/attendance", icon: ClipboardCheck },
        { name: "Announcements", path: "/faculty/announcements", icon: Megaphone },
      ],
    },
  ];

  const adminMenu = [
    {
      group: "MAIN",
      items: [
        { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      group: "ADMINISTRATION",
      items: [
        { name: "Students", path: "/admin/students", icon: Users },
        { name: "Faculty", path: "/admin/faculty", icon: ShieldCheck },
        { name: "Announcements", path: "/admin/announcements", icon: Megaphone },
        { name: "Events", path: "/admin/events", icon: Calendar },
        { name: "Complaints", path: "/admin/complaints", icon: MessageSquareWarning },
        { name: "Clubs & Campus", path: "/admin/clubs", icon: Building2 },
        { name: "Analytics", path: "/admin/analytics", icon: Award },
      ],
    },
  ];

  const menuSections =
    role === "admin"
      ? adminMenu
      : role === "faculty"
        ? facultyMenu
        : studentMenu;

  const displayName = user?.name || user?.full_name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/10 bg-slate-950/95 backdrop-blur-2xl transition-all duration-300 ${
          collapsed ? "w-20" : "w-72"
        } ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header / Brand */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25">
                <GraduationCap className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Smart<span className="text-blue-400">Campus</span>
                </h1>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  {role} Portal
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500">
              <GraduationCap className="text-white" size={22} />
            </div>
          )}

          {/* Collapse Toggle for Desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Close on Mobile */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        {!collapsed && (
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/5 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white text-sm shadow-md">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {displayName}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {user?.email || "student@campus.edu"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-white/10">
          {menuSections.map((section) => (
            <div key={section.group} className="space-y-1">
              {!collapsed && (
                <p className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  {section.group}
                </p>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    title={collapsed ? item.name : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 font-semibold"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    } ${collapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon
                      size={18}
                      className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        item.isAI
                          ? "text-purple-400 group-hover:text-purple-300"
                          : active
                            ? "text-white"
                            : "text-slate-400"
                      }`}
                    />

                    {!collapsed && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}

                    {!collapsed && item.badge && (
                      <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}

                    {!collapsed && item.isAI && (
                      <span className="flex items-center gap-1 rounded-md bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-500/30">
                        <Sparkles size={10} /> AI
                      </span>
                    )}

                    {/* Active Left Indicator */}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-white" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout Footer */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors ${
              collapsed ? "justify-center px-0" : ""
            }`}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
