import React, { useEffect, useState } from "react";
import { Users, GraduationCap, RefreshCw, Search } from "lucide-react";
import API from "../../api/axios";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";

export function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/faculty/dashboard");
      const list = res.data?.sections?.students || [];
      setStudents(list);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Unable to load student list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Enrolled Students
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Students enrolled in your department and courses.
          </p>
        </div>

        <Button onClick={loadData} variant="secondary" size="sm" icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : error ? (
        <ErrorState title="Error" message={error} onRetry={loadData} />
      ) : students.length === 0 ? (
        <EmptyState icon={Users} title="No students" description="No enrolled students found." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <Card key={s.id} hover className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white shadow-md">
                {s.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-white truncate">{s.name}</h4>
                <p className="text-xs text-slate-400 font-mono">{s.student_id}</p>
                <span className="text-[10px] text-blue-400 font-semibold">
                  {s.department} • Year {s.year}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Students;