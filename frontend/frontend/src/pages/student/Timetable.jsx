import React, { useEffect, useState, useMemo } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  RefreshCw,
  BookOpen,
  Calendar,
} from "lucide-react";
import API from "../../api/axios";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";

export function Timetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const [activeDay, setActiveDay] = useState(
    daysOfWeek.includes(currentDayName) ? currentDayName : "Monday"
  );

  const loadTimetable = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/timetable/");
      const data = response.data;

      if (Array.isArray(data)) {
        setTimetable(data);
      } else if (Array.isArray(data.timetable)) {
        setTimetable(data.timetable);
      } else {
        setTimetable([]);
      }
    } catch (err) {
      console.error("Failed to load timetable:", err);
      setError(
        err.response?.data?.detail || "Unable to load timetable schedule."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimetable();
  }, []);

  const daySchedule = useMemo(() => {
    return timetable.filter(
      (item) => (item.day || "").toLowerCase() === activeDay.toLowerCase()
    );
  }, [timetable, activeDay]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <CalendarDays size={16} />
            <span>Class Schedule</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Weekly Timetable
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            View your lecture schedule, room allocations, and faculty timings.
          </p>
        </div>

        <Button
          onClick={loadTimetable}
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
        >
          Refresh Schedule
        </Button>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {daysOfWeek.map((day) => {
          const isSelected = activeDay === day;
          const isToday = currentDayName.toLowerCase() === day.toLowerCase();
          const dayCount = timetable.filter(
            (t) => (t.day || "").toLowerCase() === day.toLowerCase()
          ).length;

          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-200 shrink-0 ${
                isSelected
                  ? "border-blue-500/50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                  : "border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                  Today
                </span>
              )}
              {dayCount > 0 && !isSelected && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                  {dayCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeDay}'s Schedule ({daySchedule.length} lecture{daySchedule.length === 1 ? "" : "s"})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
          ) : error ? (
            <ErrorState title="Could not load timetable" message={error} onRetry={loadTimetable} />
          ) : daySchedule.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={`No classes on ${activeDay}`}
              description={`You have no scheduled lectures or lab sessions on ${activeDay}.`}
            />
          ) : (
            <div className="space-y-4">
              {daySchedule.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-5 hover:border-blue-500/40 transition-all"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 font-bold text-sm ring-4 ring-blue-500/5">
                      0{idx + 1}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">{item.subject}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <User size={13} className="text-blue-400" />
                          {item.faculty || "Faculty Instructor"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <MapPin size={13} className="text-rose-400" />
                          Room: {item.room || "Lecture Hall"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono font-bold text-blue-400 flex items-center gap-1.5">
                      <Clock size={14} />
                      {item.start_time} - {item.end_time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Timetable;