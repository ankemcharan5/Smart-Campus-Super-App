import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  UserCog,
  Bell,
  CalendarDays,
  ClipboardList,
  IndianRupee,
  AlertTriangle,
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
          "/admin/dashboard"
        );

        setDashboard(response.data);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.detail ||
            "Unable to load admin dashboard"
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
        Loading admin dashboard...
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

  const statistics = dashboard?.statistics || {};

  const cards = [
    {
      title: "Total Users",
      value: statistics.total_users || 0,
      icon: Users,
    },
    {
      title: "Students",
      value: statistics.total_students || 0,
      icon: GraduationCap,
    },
    {
      title: "Faculty",
      value: statistics.total_faculty || 0,
      icon: UserCog,
    },
    {
      title: "Notices",
      value: statistics.total_notices || 0,
      icon: Bell,
    },
    {
      title: "Events",
      value: statistics.total_events || 0,
      icon: CalendarDays,
    },
    {
      title: "Assignments",
      value: statistics.total_assignments || 0,
      icon: ClipboardList,
    },
    {
      title: "Fees",
      value: statistics.total_fees || 0,
      icon: IndianRupee,
    },
    {
      title: "Complaints",
      value: statistics.total_complaints || 0,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-8">

      <div>
        <p className="text-sm text-blue-400">
          Administration
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-slate-400">
          Manage and monitor SmartCampus.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <Icon className="mb-4 text-blue-400" />

              <p className="text-sm text-slate-400">
                {card.title}
              </p>

              <p className="mt-2 text-3xl font-bold">
                {card.value}
              </p>
            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Dashboard;
