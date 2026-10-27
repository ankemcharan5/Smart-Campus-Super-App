import React, { useEffect, useState } from "react";
import { Megaphone, Calendar, RefreshCw, Bell } from "lucide-react";
import API from "../../api/axios";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";

export function Announcements() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/notices/");
      const list = Array.isArray(res.data) ? res.data : res.data?.notices || [];
      setNotices(list);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Unable to load announcements.");
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
            Faculty Announcements
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Official department notices and broadcast updates.
          </p>
        </div>

        <Button onClick={loadData} variant="secondary" size="sm" icon={RefreshCw}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      ) : error ? (
        <ErrorState title="Error" message={error} onRetry={loadData} />
      ) : notices.length === 0 ? (
        <EmptyState icon={Megaphone} title="No notices" description="No broadcast circulars." />
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <Card key={n.id} hover className="p-6 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                    <Bell size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white">{n.title}</h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {n.created_at ? new Date(n.created_at).toLocaleDateString() : ""}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-0 sm:pl-13">
                {n.content}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Announcements;