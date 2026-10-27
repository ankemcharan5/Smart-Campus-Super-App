import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  BookOpen,
  IndianRupee,
  GraduationCap,
  ClipboardCheck,
  ArrowRight,
  Clock,
  MapPin,
  AlertTriangle,
  Sparkles,
  Bot,
  RefreshCw,
  CreditCard,
  Building2,
  Search,
  MessageSquareWarning,
  CheckCircle2,
} from "lucide-react";
import API from "../../api/axios";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton, StatCardSkeleton } from "../../components/ui/Skeleton";
import { ErrorState } from "../../components/ui/ErrorState";

export function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [proactive, setProactive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashRes, proactRes] = await Promise.allSettled([
        API.get("/student/dashboard"),
        API.get("/ai/proactive"),
      ]);

      if (dashRes.status === "fulfilled") {
        setDashboard(dashRes.value.data);
      } else {
        throw dashRes.reason;
      }

      if (proactRes.status === "fulfilled") {
        setProactive(proactRes.value.data?.insights || []);
      }
    } catch (err) {
      console.error("Dashboard load failed:", err);
      setError(
        err.response?.data?.detail || "Unable to load student dashboard from campus server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState
          title="Student Dashboard Unavailable"
          message={error}
          onRetry={loadDashboard}
        />
      </div>
    );
  }

  const student = dashboard?.student || {};
  const sections = dashboard?.sections || {};

  const notices = sections.notices || [];
  const events = sections.events || [];
  const assignments = sections.assignments || [];
  const attendance = sections.attendance || [];
  const results = sections.results || [];
  const fees = sections.fees || [];
  const timetable = sections.timetable || [];

  // Attendance metrics
  const totalClasses = attendance.length;
  const attendedClasses = attendance.filter((a) => a.status === "Present").length;
  const attendancePct = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

  // Fee calculation matching real DB records (Total: ₹4,500, Paid: ₹1,000, Due: ₹3,500, Pending: 2)
  const totalFeesAmount = fees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const paidFeesAmount = fees
    .filter((f) => f.status === "Paid")
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const dueFeesAmount = totalFeesAmount - paidFeesAmount;
  const pendingFeesCount = fees.filter((f) => f.status !== "Paid").length;

  // Today's timetable
  const todayDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayClasses = timetable.filter(
    (t) => (t.day || "").toLowerCase() === todayDay.toLowerCase()
  );
  const displayTimetable = todayClasses.length > 0 ? todayClasses : timetable.slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome & Profile Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <GraduationCap size={16} />
            <span>Academic Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {student.name || "Student"} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {student.department || "Computer Science"} • Year {student.year || 2} • ID:{" "}
            <span className="font-mono text-slate-300 font-semibold">{student.student_id || "SC004"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={loadDashboard}
            variant="secondary"
            size="sm"
            icon={RefreshCw}
          >
            Refresh
          </Button>
          <Button
            onClick={() => navigate("/student/ai-assistant")}
            variant="primary"
            size="sm"
            icon={Bot}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-500/25"
          >
            Ask AI Assistant
          </Button>
        </div>
      </div>

      {/* 2. Proactive AI Alert Banner */}
      {proactive.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 p-5 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 ring-4 ring-amber-500/10">
                <Sparkles size={22} className="animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Bot size={14} /> Smart Campus AI Insight
                </p>
                <p className="mt-0.5 text-sm font-medium text-white">
                  {proactive[0].message}
                </p>
              </div>
            </div>

            {proactive[0].action_url && (
              <Button
                onClick={() => navigate(proactive[0].action_url)}
                size="sm"
                variant="primary"
                className="bg-amber-600 hover:bg-amber-500 text-white shrink-0 shadow-amber-600/25"
              >
                {proactive[0].action_text || "Take Action"} →
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 3. Primary Stat Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* FEES CARD - Priority & Specific Numbers */}
        <StatCard
          title="Fees Due"
          value={`₹${dueFeesAmount.toLocaleString()}`}
          subtitle={`${pendingFeesCount} pending • Paid ₹${paidFeesAmount.toLocaleString()} of ₹${totalFeesAmount.toLocaleString()}`}
          icon={IndianRupee}
          color={dueFeesAmount > 0 ? "amber" : "emerald"}
          onClick={() => navigate("/student/fees")}
        />

        {/* ATTENDANCE CARD */}
        <StatCard
          title="Overall Attendance"
          value={`${attendancePct}%`}
          subtitle={`${attendedClasses} attended / ${totalClasses} classes`}
          icon={ClipboardCheck}
          color={attendancePct >= 75 ? "emerald" : "rose"}
          trend={attendancePct >= 75 ? "Above 75%" : "Below 75%"}
          trendDirection={attendancePct >= 75 ? "up" : "down"}
          onClick={() => navigate("/student/attendance")}
        />

        {/* ASSIGNMENTS CARD */}
        <StatCard
          title="Assignments"
          value={assignments.length}
          subtitle="Department tasks listed"
          icon={BookOpen}
          color="purple"
          onClick={() => navigate("/student/assignments")}
        />

        {/* RESULTS CARD */}
        <StatCard
          title="Exam Results"
          value={results.length > 0 ? `${results[0].grade || "A"}` : "N/A"}
          subtitle={`${results.length} published record(s)`}
          icon={GraduationCap}
          color="blue"
          onClick={() => navigate("/student/exams")}
        />
      </div>

      {/* 4. Quick Actions Row */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            onClick={() => navigate("/student/fees")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all text-center group"
          >
            <CreditCard size={20} className="text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-200">Pay Fees</span>
          </button>
          <button
            onClick={() => navigate("/student/timetable")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all text-center group"
          >
            <CalendarDays size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-200">Timetable</span>
          </button>
          <button
            onClick={() => navigate("/student/complaints")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all text-center group"
          >
            <MessageSquareWarning size={20} className="text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-200">Complaints</span>
          </button>
          <button
            onClick={() => navigate("/student/lost-found")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all text-center group"
          >
            <Search size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-200">Lost & Found</span>
          </button>
          <button
            onClick={() => navigate("/student/resources")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 hover:border-blue-500/40 hover:bg-blue-500/10 transition-all text-center group"
          >
            <Building2 size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-slate-200">Resources</span>
          </button>
          <button
            onClick={() => navigate("/student/ai-assistant")}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3.5 hover:border-purple-500/60 hover:bg-purple-500/20 transition-all text-center group"
          >
            <Bot size={20} className="text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-purple-300">AI Chat</span>
          </button>
        </div>
      </div>

      {/* 5. Main Content Grid: Timetable & Notices */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Classes */}
        <Card>
          <CardHeader
            action={
              <Button
                onClick={() => navigate("/student/timetable")}
                variant="ghost"
                size="sm"
              >
                Full Schedule →
              </Button>
            }
          >
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <CalendarDays size={16} />
              <span>Today's Classes ({todayDay})</span>
            </div>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {displayTimetable.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No classes scheduled for today.
              </div>
            ) : (
              displayTimetable.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-slate-950/60 p-4 transition-all hover:border-blue-500/30"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 font-bold text-xs">
                      {item.day?.slice(0, 3)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-white">{item.subject}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{item.faculty}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <MapPin size={12} /> {item.room}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-xs font-mono font-medium text-slate-300 border border-white/10">
                      <Clock size={12} /> {item.start_time} - {item.end_time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Latest Notices */}
        <Card>
          <CardHeader
            action={
              <Button
                onClick={() => navigate("/student/notices")}
                variant="ghost"
                size="sm"
              >
                View All →
              </Button>
            }
          >
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Bell size={16} />
              <span>Campus Announcements</span>
            </div>
            <CardTitle>Official Notices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notices.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No notices published recently.
              </div>
            ) : (
              notices.slice(0, 3).map((notice) => (
                <div
                  key={notice.id}
                  className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 transition-all hover:border-indigo-500/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-semibold text-sm text-white">{notice.title}</h4>
                    <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                      {notice.created_at ? new Date(notice.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 6. Lower Grid: Upcoming Events & Active Assignments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Events */}
        <Card>
          <CardHeader
            action={
              <Button
                onClick={() => navigate("/student/events")}
                variant="ghost"
                size="sm"
              >
                All Events →
              </Button>
            }
          >
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <CalendarDays size={16} />
              <span>Campus Life</span>
            </div>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No upcoming events listed.
              </div>
            ) : (
              events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-slate-950/60 p-4 transition-all hover:border-purple-500/30"
                >
                  <div>
                    <h4 className="font-semibold text-sm text-white">{event.title}</h4>
                    <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                      {event.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-purple-300">
                        <CalendarDays size={12} /> {event.event_date} ({event.event_time})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin size={12} /> {event.location}
                      </span>
                    </div>
                  </div>
                  <Badge variant="purple" size="sm">
                    {event.organizer || "Campus"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Assignments */}
        <Card>
          <CardHeader
            action={
              <Button
                onClick={() => navigate("/student/assignments")}
                variant="ghost"
                size="sm"
              >
                All Tasks →
              </Button>
            }
          >
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <BookOpen size={16} />
              <span>Pending Submissions</span>
            </div>
            <CardTitle>Coursework & Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No pending coursework.
              </div>
            ) : (
              assignments.slice(0, 3).map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-slate-950/60 p-4 transition-all hover:border-emerald-500/30"
                >
                  <div>
                    <h4 className="font-semibold text-sm text-white">{assignment.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{assignment.subject}</p>
                    <p className="text-[11px] text-amber-400 font-medium mt-1">
                      Due: {assignment.due_date}
                    </p>
                  </div>
                  <Badge variant="warning" size="sm">
                    Pending
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;