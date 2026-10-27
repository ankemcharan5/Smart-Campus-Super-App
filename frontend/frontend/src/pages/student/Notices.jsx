import React, { useEffect, useState, useMemo } from "react";
import {
  Megaphone,
  Calendar,
  RefreshCw,
  Search,
  Bell,
  Sparkles,
} from "lucide-react";
import API from "../../api/axios";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";

export function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/notices/");
      const data = response.data;

      if (Array.isArray(data)) {
        setNotices(data);
      } else if (Array.isArray(data.notices)) {
        setNotices(data.notices);
      } else {
        setNotices([]);
      }
    } catch (err) {
      console.error("Failed to load notices:", err);
      setError(
        err.response?.data?.detail || "Unable to load campus notices."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const q = search.toLowerCase();
      return (
        notice.title?.toLowerCase().includes(q) ||
        notice.content?.toLowerCase().includes(q)
      );
    });
  }, [notices, search]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <Megaphone size={16} />
            <span>Campus Broadcasts</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Notices & Circulars
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Official announcements from administration and academic departments.
          </p>
        </div>

        <Button
          onClick={loadNotices}
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
        >
          Refresh Notices
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search circulars and announcements..."
          className="w-full rounded-2xl border border-white/10 bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Notices List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      ) : error ? (
        <ErrorState title="Could not load notices" message={error} onRetry={loadNotices} />
      ) : filteredNotices.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No notices found"
          description={
            search
              ? "No announcements matched your search query."
              : "There are currently no active notices published."
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice, idx) => (
            <Card
              key={notice.id || idx}
              hover
              className="p-6 space-y-3 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                    <Bell size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {notice.title}
                  </h3>
                </div>

                <span className="text-xs text-slate-500 flex items-center gap-1.5 shrink-0">
                  <Calendar size={13} />
                  {notice.created_at
                    ? new Date(notice.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Recent"}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pl-0 sm:pl-13">
                {notice.content}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notices;