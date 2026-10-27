import React, { useEffect, useState } from "react";
import { BookOpen, Plus, Calendar, Clock, RefreshCw, CheckCircle2 } from "lucide-react";
import API from "../../api/axios";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";

export function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/faculty/dashboard");
      setAssignments(res.data?.sections?.assignments || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Unable to load assignments.");
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
            Faculty Course Assignments
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Coursework and homework tasks assigned to students.
          </p>
        </div>

        <Button onClick={loadData} variant="secondary" size="sm" icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-44 rounded-3xl" />
          <Skeleton className="h-44 rounded-3xl" />
        </div>
      ) : error ? (
        <ErrorState title="Error" message={error} onRetry={loadData} />
      ) : assignments.length === 0 ? (
        <EmptyState icon={BookOpen} title="No assignments" description="No coursework created yet." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {assignments.map((a) => (
            <Card key={a.id} hover className="p-6 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="purple" size="sm">
                    {a.subject}
                  </Badge>
                  <h3 className="text-lg font-bold text-white mt-2">{a.title}</h3>
                </div>
                <span className="text-xs text-amber-400 font-mono">
                  Due: {a.due_date}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {a.description}
              </p>

              <div className="pt-3 border-t border-white/10 text-xs text-slate-400 flex justify-between">
                <span>{a.department} • Year {a.year}</span>
                <span>Section: {a.section || "A"}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Assignments;