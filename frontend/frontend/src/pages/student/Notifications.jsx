import React, { useEffect, useState, useMemo } from "react";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  CheckCheck,
  Calendar,
  Sparkles,
  Layers,
} from "lucide-react";
import API from "../../api/axios";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/notifications/me");
      const data = response.data;

      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError(
        err.response?.data?.detail || "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleMarkSingle = async (notifId) => {
    try {
      await API.patch(`/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          (n.id === notifId || n._id === notifId) ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {}
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.is_read);
    if (filter === "read") return notifications.filter((n) => n.is_read);
    return notifications;
  }, [notifications, filter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Bell size={16} />
            <span>Notification Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            System announcements, academic deadlines, and campus alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={loadNotifications}
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={loading}
          >
            Refresh
          </Button>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              variant="outline"
              size="sm"
              icon={CheckCheck}
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center rounded-xl border border-white/10 bg-slate-900/60 p-1">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              filter === "unread"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              filter === "read"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      ) : error ? (
        <ErrorState title="Could not load notifications" message={error} onRetry={loadNotifications} />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={
            filter === "unread"
              ? "You have caught up with all notifications!"
              : "No notification records found in your inbox."
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const notifId = notif.id || notif._id;
            const isUnread = !notif.is_read;

            return (
              <Card
                key={notifId}
                hover
                onClick={() => isUnread && handleMarkSingle(notifId)}
                className={`p-5 transition-all ${
                  isUnread
                    ? "border-blue-500/30 bg-blue-500/[0.04]"
                    : "border-white/5 bg-slate-900/40"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                        isUnread
                          ? "bg-blue-500/20 text-blue-400 ring-4 ring-blue-500/10"
                          : "bg-white/5 text-slate-400"
                      }`}
                    >
                      <Bell size={18} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {notif.title}
                        </h4>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {notif.created_at
                        ? new Date(notif.created_at).toLocaleDateString()
                        : "Recent"}
                    </span>
                    <Badge variant={isUnread ? "primary" : "default"} size="sm">
                      {notif.notification_type || "General"}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;
