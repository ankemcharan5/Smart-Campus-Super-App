import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Sparkles,
  Bot,
  CheckCircle2,
  Calendar,
  X,
  ChevronDown,
  Building2,
  BookOpen,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import API from "../../api/axios";

export function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const displayName = user?.name || user?.full_name || "Student";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Load real notifications for student
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await API.get("/notifications/me");
        const list = res.data?.notifications || res.data || [];
        if (Array.isArray(list)) {
          setNotifications(list);
          setUnreadCount(list.filter((n) => !n.is_read).length);
        }
      } catch (err) {
        // Silently handle if notifications empty
      }
    };
    loadNotifications();
  }, [location.pathname]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global search implementation
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        // Search across student dashboard or notices/events
        const res = await API.get("/student/dashboard");
        const sec = res.data?.sections || {};
        const q = searchQuery.toLowerCase();

        const results = [];
        // Notices
        (sec.notices || []).forEach((n) => {
          if (n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)) {
            results.push({ type: "Notice", title: n.title, url: "/student/notices", icon: Bell });
          }
        });
        // Events
        (sec.events || []).forEach((e) => {
          if (e.title?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)) {
            results.push({ type: "Event", title: e.title, url: "/student/events", icon: Calendar });
          }
        });
        // Assignments
        (sec.assignments || []).forEach((a) => {
          if (a.title?.toLowerCase().includes(q) || a.subject?.toLowerCase().includes(q)) {
            results.push({ type: "Assignment", title: `${a.title} (${a.subject})`, url: "/student/assignments", icon: BookOpen });
          }
        });
        // Resources
        (sec.campus_resources || []).forEach((r) => {
          if (r.name?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q)) {
            results.push({ type: "Resource", title: r.name, url: "/student/resources", icon: Building2 });
          }
        });

        setSearchResults(results);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleMarkAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path.includes("dashboard")) return "Dashboard";
    if (path.includes("attendance")) return "Attendance";
    if (path.includes("assignments")) return "Assignments";
    if (path.includes("exams")) return "Exams & Results";
    if (path.includes("timetable")) return "Timetable";
    if (path.includes("fees")) return "Fees & Payments";
    if (path.includes("notices")) return "Notices & Circulars";
    if (path.includes("events")) return "Campus Events";
    if (path.includes("resources")) return "Campus Resources";
    if (path.includes("complaints")) return "Grievances & Complaints";
    if (path.includes("lost-found")) return "Lost & Found";
    if (path.includes("ai-assistant")) return "AI Assistant";
    if (path.includes("notifications")) return "Notifications";
    if (path.includes("profile")) return "Student Profile";
    return "Portal";
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 md:px-8 backdrop-blur-2xl transition-all">
        {/* Left Side: Mobile Menu + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-xl border border-white/10 p-2.5 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden transition-colors"
          >
            <Menu size={22} />
          </button>

          <div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>SmartCampus</span>
              <span>/</span>
              <span className="text-blue-400 font-semibold">{user?.role || "Student"}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Center: Global Search Trigger */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-400 hover:border-blue-500/40 hover:bg-white/[0.07] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Search size={16} className="text-slate-400" />
              <span>Search notices, events, assignments, facilities...</span>
            </div>
            <kbd className="hidden lg:inline-block rounded-lg border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Side: Actions, Semester Badge, AI shortcut, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Semester Badge */}
          {user?.department && (
            <div className="hidden xl:flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400">
              <span>{user.department}</span>
              <span className="h-1 w-1 rounded-full bg-blue-400" />
              <span>Year {user.year || 2}</span>
            </div>
          )}

          {/* Quick AI Assistant Trigger */}
          <button
            onClick={() => navigate("/student/ai-assistant")}
            className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 px-3 py-2 text-xs font-semibold text-purple-300 hover:from-purple-600/30 hover:to-indigo-600/30 transition-all shadow-sm"
          >
            <Bot size={16} className="text-purple-400 animate-pulse" />
            <span>AI Assistant</span>
          </button>

          {/* Mobile Search Icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden rounded-xl border border-white/10 p-2.5 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Search size={20} />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative rounded-xl border border-white/10 p-2.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-lg ring-2 ring-slate-950 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl border border-white/15 bg-slate-900 shadow-2xl shadow-black/80 backdrop-blur-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-white/[0.02]">
                  <div>
                    <h4 className="text-sm font-bold text-white">Notifications</h4>
                    <p className="text-xs text-slate-400">{unreadCount} unread</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No notifications right now.
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id || n._id}
                        onClick={() => {
                          setNotifOpen(false);
                          navigate("/student/notifications");
                        }}
                        className={`rounded-2xl p-3.5 transition-all cursor-pointer ${
                          n.is_read
                            ? "bg-transparent hover:bg-white/5"
                            : "bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-white">{n.title}</p>
                          {!n.is_read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-white/10 p-3 bg-white/[0.01] text-center">
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      navigate("/student/notifications");
                    }}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 pr-3 hover:bg-white/10 transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white text-xs shadow-md">
                {initials}
              </div>
              <span className="hidden md:inline-block max-w-[100px] truncate text-xs font-semibold text-slate-200">
                {displayName}
              </span>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-60 rounded-3xl border border-white/15 bg-slate-900 shadow-2xl shadow-black/80 backdrop-blur-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-white/10 mb-1">
                  <p className="text-sm font-bold text-white truncate">{displayName}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  <span className="mt-2 inline-block rounded-md bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold text-blue-400 capitalize">
                    {user?.role || "Student"}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/student/profile");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <User size={16} className="text-slate-400" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/student/fees");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <CreditCard size={16} className="text-slate-400" />
                  <span>Fee Payments</span>
                </button>

                <div className="border-t border-white/10 my-1" />

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    navigate("/login");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={() => setSearchOpen(false)}
          />

          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-slate-900 shadow-2xl shadow-black">
            {/* Input Header */}
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 bg-white/[0.02]">
              <Search size={20} className="text-blue-400 shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notices, events, assignments, campus facilities..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto p-4 space-y-2">
              {searching ? (
                <div className="py-8 text-center text-xs text-slate-400">Searching...</div>
              ) : searchQuery && searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No matching results for "{searchQuery}".
                </div>
              ) : !searchQuery ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Type something to search across campus records.
                </div>
              ) : (
                searchResults.map((item, idx) => {
                  const Icon = item.icon || Search;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSearchOpen(false);
                        navigate(item.url);
                      }}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 hover:border-blue-500/30 hover:bg-blue-500/5 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            {item.type}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-blue-400">View →</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Topbar;
