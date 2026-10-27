import React, { useEffect, useState, useMemo } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  BookOpen,
  Calendar,
} from "lucide-react";
import API from "../../api/axios";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { TableSkeleton, StatCardSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";

export function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/attendance/");
      const data = response.data;

      if (Array.isArray(data)) {
        setAttendance(data);
      } else if (Array.isArray(data.attendance)) {
        setAttendance(data.attendance);
      } else {
        setAttendance([]);
      }
    } catch (err) {
      console.error("Failed to load attendance:", err);
      setError(
        err.response?.data?.detail || "Unable to load attendance records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  // Metrics
  const totalClasses = attendance.length;
  const attendedClasses = attendance.filter((a) => a.status === "Present").length;
  const missedClasses = totalClasses - attendedClasses;
  const overallPercentage =
    totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

  // Subject-wise Breakdown
  const subjectBreakdown = useMemo(() => {
    const map = {};
    attendance.forEach((item) => {
      const subj = item.subject || "General";
      if (!map[subj]) {
        map[subj] = { total: 0, present: 0, faculty: item.faculty };
      }
      map[subj].total += 1;
      if (item.status === "Present") {
        map[subj].present += 1;
      }
    });

    return Object.keys(map).map((subj) => {
      const s = map[subj];
      const pct = s.total > 0 ? Math.round((s.present / s.total) * 100) : 0;
      return {
        subject: subj,
        total: s.total,
        present: s.present,
        percentage: pct,
        faculty: s.faculty,
        isLow: pct < 75,
      };
    });
  }, [attendance]);

  // Filtered List
  const filteredAttendance = useMemo(() => {
    return attendance.filter((item) => {
      const matchesSearch =
        item.subject?.toLowerCase().includes(search.toLowerCase()) ||
        item.faculty?.toLowerCase().includes(search.toLowerCase()) ||
        item.date?.includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        item.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [attendance, search, statusFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <ClipboardCheck size={16} />
            <span>Academic Performance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Attendance Overview
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Track your class attendance, subject compliance, and daily log.
          </p>
        </div>

        <Button
          onClick={loadAttendance}
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
        >
          Refresh Log
        </Button>
      </div>

      {/* Warning Callout if Low */}
      {overallPercentage < 75 && totalClasses > 0 && (
        <div className="flex items-center gap-3.5 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-300 backdrop-blur-xl">
          <AlertTriangle size={24} className="text-rose-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-white">Attendance Warning</h4>
            <p className="text-xs text-rose-400/90 mt-0.5">
              Your overall attendance ({overallPercentage}%) is below the required 75% minimum university threshold.
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Overall Attendance"
          value={`${overallPercentage}%`}
          subtitle={overallPercentage >= 75 ? "Satisfies 75% requirement" : "Action required"}
          icon={ClipboardCheck}
          color={overallPercentage >= 75 ? "emerald" : "rose"}
          trend={overallPercentage >= 75 ? "Good Standing" : "Low Attendance"}
          trendDirection={overallPercentage >= 75 ? "up" : "down"}
        />

        <StatCard
          title="Total Classes"
          value={totalClasses}
          subtitle="Conducted across all subjects"
          icon={Calendar}
          color="blue"
        />

        <StatCard
          title="Classes Attended"
          value={attendedClasses}
          subtitle="Marked Present"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Classes Missed"
          value={missedClasses}
          subtitle="Marked Absent"
          icon={XCircle}
          color={missedClasses > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Subject-Wise Breakdown Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen size={20} className="text-blue-400" />
          <span>Subject-Wise Attendance</span>
        </h3>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : subjectBreakdown.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No subject data"
            description="Attendance has not yet been recorded for any subjects."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {subjectBreakdown.map((subj) => (
              <Card key={subj.subject} hover className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-white">{subj.subject}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{subj.faculty || "Faculty"}</p>
                  </div>
                  <Badge variant={subj.percentage >= 75 ? "present" : "absent"}>
                    {subj.percentage}%
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Attended: {subj.present}/{subj.total}</span>
                    <span className={subj.isLow ? "text-rose-400 font-semibold" : "text-emerald-400"}>
                      {subj.isLow ? "Low Attendance" : "Good"}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        subj.isLow ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${subj.percentage}%` }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Historical Records Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
            <div>
              <CardTitle>Attendance Log</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete date-wise attendance history
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search subject, faculty, date..."
                  className="rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center rounded-xl border border-white/10 bg-slate-950/60 p-1">
                {["all", "present", "absent"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
                      statusFilter === st
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={4} cols={4} />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorState title="Could not load attendance" message={error} onRetry={loadAttendance} />
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={ClipboardCheck}
                title="No attendance entries found"
                description={
                  search || statusFilter !== "all"
                    ? "No records match your active search filters."
                    : "No attendance logs recorded yet."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02] border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Faculty</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredAttendance.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                        {item.date}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {item.subject}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {item.faculty || "Faculty Instructor"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={item.status === "Present" ? "present" : "absent"}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Attendance;