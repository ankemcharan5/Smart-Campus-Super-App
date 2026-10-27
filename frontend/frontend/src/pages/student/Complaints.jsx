import React, { useEffect, useState, useMemo } from "react";
import {
  MessageSquareWarning,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import API from "../../api/axios";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton, StatCardSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Modal } from "../../components/ui/Modal";

export function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Academic");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const categories = [
    "Academic",
    "Infrastructure",
    "Hostel",
    "Canteen",
    "Library",
    "Transport",
    "Other",
  ];

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/complaints/");
      const data = response.data;

      if (Array.isArray(data)) {
        setComplaints(data);
      } else if (Array.isArray(data.complaints)) {
        setComplaints(data.complaints);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      console.error("Failed to load complaints:", err);
      setError(
        err.response?.data?.detail || "Unable to load complaints records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError("Title and description are required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      await API.post("/complaints/", {
        title,
        description,
        category,
      });

      setTitle("");
      setDescription("");
      setCategory("Academic");
      setCreateOpen(false);
      loadComplaints();
    } catch (err) {
      console.error("Submit complaint error:", err);
      setFormError(
        err.response?.data?.detail || "Failed to submit complaint. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        c.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [complaints, search, statusFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
            <MessageSquareWarning size={16} />
            <span>Support & Grievance Redressal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Student Complaints
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Submit grievances, track administrative resolution, and report issues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={loadComplaints}
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            variant="danger"
            size="sm"
            icon={Plus}
          >
            File Complaint
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          title="Total Complaints"
          value={complaints.length}
          subtitle="Submitted across all categories"
          icon={MessageSquareWarning}
          color="purple"
        />

        <StatCard
          title="Pending Resolution"
          value={pendingCount}
          subtitle="Currently under investigation"
          icon={Clock}
          color={pendingCount > 0 ? "amber" : "emerald"}
        />

        <StatCard
          title="Resolved Grievances"
          value={resolvedCount}
          subtitle="Resolved by administration"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaints by title, category, details..."
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        <div className="flex items-center rounded-xl border border-white/10 bg-slate-900/60 p-1">
          {["all", "pending", "resolved"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
                statusFilter === st
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      ) : error ? (
        <ErrorState title="Could not load complaints" message={error} onRetry={loadComplaints} />
      ) : filteredComplaints.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="No complaints found"
          description={
            search || statusFilter !== "all"
              ? "No complaints match your active filters."
              : "You haven't filed any complaints yet."
          }
          actionText="File a New Complaint"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((c) => {
            const isResolved = c.status === "Resolved";

            return (
              <Card key={c.id} hover className="p-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-semibold text-rose-400">
                      {c.category || "General"}
                    </span>
                    <h3 className="text-base font-bold text-white">{c.title}</h3>
                  </div>

                  <Badge variant={isResolved ? "success" : "pending"}>
                    {c.status || "Pending"}
                  </Badge>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {c.description}
                </p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Complaint ID: {c.id?.slice(-8)}</span>
                  <span>{c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* File Complaint Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="File a Campus Grievance"
        description="Submit a complaint to university administration"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Complaint Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hostel water supply issue, Lab equipment repair..."
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-rose-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-white outline-none focus:border-rose-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Detailed Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details, room/building number, and date when the issue occurred..."
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-rose-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={() => setCreateOpen(false)}
              variant="secondary"
              className="w-1/2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={submitting}
              className="w-1/2"
            >
              Submit Grievance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Complaints;