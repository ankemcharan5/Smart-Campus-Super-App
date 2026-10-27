import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  GraduationCap,
  Building2,
  Calendar,
  ShieldCheck,
  CreditCard,
  ClipboardCheck,
  Award,
  RefreshCw,
  LogOut,
} from "lucide-react";
import API from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { ErrorState } from "../../components/ui/ErrorState";

export function Profile() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/users/me");
      setProfile(response.data);
    } catch (err) {
      console.error("Profile load error:", err);
      setError(
        err.response?.data?.detail || "Unable to load student profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = profile?.name || authUser?.name || "Student";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <User size={16} />
            <span>Account Details</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Student Profile
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Personal details, academic enrollment info, and security credentials.
          </p>
        </div>

        <Button
          onClick={loadProfile}
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-44 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      ) : error ? (
        <ErrorState title="Could not load profile" message={error} onRetry={loadProfile} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* User Bio Card */}
          <Card className="p-6 text-center flex flex-col items-center justify-center space-y-4 lg:col-span-1">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-3xl font-extrabold text-white shadow-2xl shadow-blue-500/30 ring-4 ring-white/10">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-emerald-500 ring-4 ring-slate-950" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {displayName}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {profile?.student_id || authUser?.student_id || "SC004"}
              </p>
              <div className="pt-2">
                <Badge variant="primary" size="md">
                  Active Student
                </Badge>
              </div>
            </div>

            <div className="w-full pt-4 border-t border-white/10 space-y-2">
              <Button
                onClick={() => navigate("/student/fees")}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                icon={CreditCard}
              >
                View Fee Statement
              </Button>
              <Button
                onClick={() => navigate("/student/attendance")}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
                icon={ClipboardCheck}
              >
                Check Attendance
              </Button>
              <Button
                onClick={handleLogout}
                variant="danger"
                size="sm"
                className="w-full justify-start text-xs mt-2"
                icon={LogOut}
              >
                Sign Out
              </Button>
            </div>
          </Card>

          {/* Academic & Enrollment Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Enrollment & Academic Records</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Mail size={12} className="text-blue-400" /> University Email
                  </span>
                  <p className="text-sm font-semibold text-white truncate">
                    {profile?.email || authUser?.email || "student@campus.edu"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <GraduationCap size={12} className="text-indigo-400" /> Student Roll ID
                  </span>
                  <p className="text-sm font-mono font-bold text-white">
                    {profile?.student_id || authUser?.student_id || "SC004"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building2 size={12} className="text-purple-400" /> Department / Major
                  </span>
                  <p className="text-sm font-semibold text-white">
                    {profile?.department || "Computer Science & Engineering"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calendar size={12} className="text-emerald-400" /> Current Year / Level
                  </span>
                  <p className="text-sm font-semibold text-white">
                    Year {profile?.year || 2} (Undergraduate)
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" /> Security & Account Status
                </h4>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                  <span>Role Permissions: <strong className="text-white capitalize">{profile?.role || "Student"}</strong></span>
                  <span>Authentication: <strong className="text-emerald-400">JWT Bearer Verified</strong></span>
                  <span>Database ID: <strong className="text-slate-400 font-mono">{profile?.id?.slice(-8)}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Profile;