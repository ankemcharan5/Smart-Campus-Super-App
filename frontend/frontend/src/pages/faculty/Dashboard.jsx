import { useEffect, useState } from "react";
import {
  ClipboardList,
  Users,
  Bell,
  CalendarDays,
  CheckCircle,
  BookOpen,
} from "lucide-react";

import API from "../../api/axios";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await API.get(
          "/faculty/dashboard"
        );

        setDashboard(response.data);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.detail ||
            "Unable to load faculty dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-400">
        Loading faculty dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
        {error}
      </div>
    );
  }

  const faculty = dashboard?.faculty;
  const sections = dashboard?.sections || {};

  const assignments = sections.assignments || [];
  const attendance = sections.attendance || [];
  const notices = sections.notices || [];
  const events = sections.events || [];
  const resources = sections.campus_resources || [];

  return (
    <div className="space-y-8">

      <div>
        <p className="text-sm text-blue-400">
          Faculty Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Welcome, {faculty?.name}
        </h1>

        <p className="mt-2 text-slate-400">
          {faculty?.department} •{" "}
          {faculty?.faculty_id}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <ClipboardList className="mb-4 text-blue-400" />

          <p className="text-sm text-slate-400">
            Assignments
          </p>

          <p className="mt-2 text-3xl font-bold">
            {assignments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <Users className="mb-4 text-green-400" />

          <p className="text-sm text-slate-400">
            Attendance Records
          </p>

          <p className="mt-2 text-3xl font-bold">
            {attendance.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <Bell className="mb-4 text-purple-400" />

          <p className="text-sm text-slate-400">
            Notices
          </p>

          <p className="mt-2 text-3xl font-bold">
            {notices.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <CalendarDays className="mb-4 text-orange-400" />

          <p className="text-sm text-slate-400">
            Events
          </p>

          <p className="mt-2 text-3xl font-bold">
            {events.length}
          </p>
        </div>

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

          <h2 className="mb-5 text-xl font-semibold">
            My Assignments
          </h2>

          <div className="space-y-4">

            {assignments.length === 0 ? (
              <p className="text-slate-500">
                No assignments found.
              </p>
            ) : (
              assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-xl bg-slate-900/60 p-4"
                >
                  <h3 className="font-semibold">
                    {assignment.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    {assignment.description}
                  </p>

                  <p className="mt-3 text-xs text-orange-400">
                    Due: {assignment.due_date}
                  </p>
                </div>
              ))
            )}

          </div>

        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

          <h2 className="mb-5 text-xl font-semibold">
            Attendance
          </h2>

          <div className="space-y-4">

            {attendance.length === 0 ? (
              <p className="text-slate-500">
                No attendance records.
              </p>
            ) : (
              attendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-xl bg-slate-900/60 p-4"
                >
                  <div>
                    <p className="font-medium">
                      {record.student_id}
                    </p>

                    <p className="text-sm text-slate-400">
                      {record.subject}
                    </p>
                  </div>

                  <CheckCircle
                    size={20}
                    className="text-green-400"
                  />
                </div>
              ))
            )}

          </div>

        </div>

      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

        <div className="mb-5 flex items-center gap-3">
          <BookOpen className="text-blue-400" />

          <h2 className="text-xl font-semibold">
            Campus Resources
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">

          {resources.map((resource) => (
            <div
              key={resource.id}
              className="rounded-xl bg-slate-900/60 p-4"
            >
              <h3 className="font-semibold">
                {resource.name}
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                {resource.category}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {resource.location}
              </p>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;