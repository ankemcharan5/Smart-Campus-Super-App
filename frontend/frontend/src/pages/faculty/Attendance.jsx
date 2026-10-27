import React, { useEffect, useState } from "react";
import { ClipboardCheck, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import API from "../../api/axios";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";

export function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/faculty/dashboard");
      setAttendance(res.data?.sections?.attendance || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Unable to load attendance records.");
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
            Class Attendance Log
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Attendance submitted by or assigned to your courses.
          </p>
        </div>

        <Button onClick={loadData} variant="secondary" size="sm" icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={4} cols={4} />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorState title="Error" message={error} onRetry={loadData} />
            </div>
          ) : attendance.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={ClipboardCheck}
                title="No attendance records"
                description="No attendance logs found for your profile."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02] border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Student ID</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {attendance.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-white">
                        {item.student_id}
                      </td>
                      <td className="px-6 py-4 text-slate-200">{item.subject}</td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {item.date}
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