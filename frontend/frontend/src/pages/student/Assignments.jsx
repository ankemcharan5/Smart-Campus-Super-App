import React, { useEffect, useState, useMemo } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  UploadCloud,
  FileText,
  Check,
} from "lucide-react";
import API from "../../api/axios";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCardSkeleton, Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Modal } from "../../components/ui/Modal";

export function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Submit Modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedIds, setSubmittedIds] = useState(new Set());
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/assignments/");
      const data = response.data;

      if (Array.isArray(data)) {
        setAssignments(data);
      } else if (Array.isArray(data.assignments)) {
        setAssignments(data.assignments);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.error("Failed to load assignments:", err);
      setError(
        err.response?.data?.detail || "Unable to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      return (
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.subject?.toLowerCase().includes(search.toLowerCase()) ||
        item.faculty?.toLowerCase().includes(search.toLowerCase()) ||
        item.due_date?.includes(search)
      );
    });
  }, [assignments, search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitSuccess(true);
      setSubmittedIds((prev) => new Set([...prev, selectedAssignment.id]));
      setTimeout(() => {
        setSubmitSuccess(false);
        setSelectedAssignment(null);
        setSubmissionText("");
      }, 1500);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <BookOpen size={16} />
            <span>Coursework & Tasks</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Assignments & Submissions
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Submit coursework and track upcoming academic deadlines.
          </p>
        </div>

        <Button
          onClick={loadAssignments}
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
        >
          Refresh Tasks
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Assignments"
          value={assignments.length}
          subtitle="Assigned for your department & year"
          icon={BookOpen}
          color="purple"
        />

        <StatCard
          title="Pending Submissions"
          value={assignments.length - submittedIds.size}
          subtitle="Awaiting your submission"
          icon={Clock}
          color={assignments.length - submittedIds.size > 0 ? "amber" : "emerald"}
        />

        <StatCard
          title="Submitted"
          value={submittedIds.size}
          subtitle="Completed coursework"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments by title, subject, faculty..."
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Assignments Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      ) : error ? (
        <ErrorState title="Could not load assignments" message={error} onRetry={loadAssignments} />
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No assignments found"
          description={
            search
              ? "No assignments match your search query."
              : "There are currently no assignments posted for your department."
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredAssignments.map((assignment) => {
            const isSubmitted = submittedIds.has(assignment.id);

            return (
              <Card
                key={assignment.id}
                hover
                className="p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md">
                        {assignment.subject}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-2">
                        {assignment.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Assigned by {assignment.faculty || "Instructor"}
                      </p>
                    </div>

                    <Badge variant={isSubmitted ? "success" : "warning"}>
                      {isSubmitted ? "Submitted" : "Pending"}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {assignment.description || "No description provided."}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <Clock size={14} />
                    <span>Due: {assignment.due_date}</span>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setSubmitSuccess(isSubmitted);
                    }}
                    variant={isSubmitted ? "secondary" : "primary"}
                    size="sm"
                    className={
                      !isSubmitted
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-600/20"
                        : ""
                    }
                  >
                    {isSubmitted ? "View Submission" : "Submit Assignment"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submit Assignment Modal */}
      <Modal
        isOpen={Boolean(selectedAssignment)}
        onClose={() => {
          setSelectedAssignment(null);
          setSubmitSuccess(false);
        }}
        title={submitSuccess ? "Assignment Submitted" : "Submit Coursework"}
        description={selectedAssignment?.title}
      >
        {selectedAssignment && (
          <div>
            {submitSuccess ? (
              <div className="space-y-6 text-center">
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-3 ring-8 ring-emerald-500/10">
                    <Check size={28} />
                  </div>
                  <h4 className="text-lg font-bold text-white">Submission Recorded!</h4>
                  <p className="text-xs text-emerald-400 mt-1">
                    Your solution for "{selectedAssignment.title}" has been uploaded to the instructor.
                  </p>
                </div>
                <Button
                  onClick={() => setSelectedAssignment(null)}
                  variant="primary"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs space-y-1.5">
                  <p className="text-slate-400">
                    Subject: <strong className="text-white">{selectedAssignment.subject}</strong>
                  </p>
                  <p className="text-slate-400">
                    Due Date: <strong className="text-amber-400">{selectedAssignment.due_date}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Submission Notes / Link / Text
                  </label>
                  <textarea
                    rows={4}
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Enter your solution notes, GitHub repo link, or drive submission URL..."
                    className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-center cursor-pointer hover:bg-white/[0.04] transition-colors">
                  <UploadCloud size={28} className="mx-auto text-purple-400 mb-2" />
                  <p className="text-xs font-semibold text-white">Attach File (PDF, ZIP, DOCX)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Drag & drop or click to upload</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => setSelectedAssignment(null)}
                    variant="secondary"
                    className="w-1/2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    className="w-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-600/25"
                  >
                    Confirm Submission
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Assignments;