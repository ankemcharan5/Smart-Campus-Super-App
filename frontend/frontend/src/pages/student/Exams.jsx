import React, { useEffect, useState, useMemo } from "react";
import {
  GraduationCap,
  Award,
  TrendingUp,
  BookOpen,
  RefreshCw,
  Search,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import API from "../../api/axios";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { TableSkeleton, StatCardSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";

export function Exams() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("all");

  const loadResults = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/results/");
      const data = response.data;

      if (Array.isArray(data)) {
        setResults(data);
      } else if (Array.isArray(data.results)) {
        setResults(data.results);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Failed to load results:", err);
      setError(
        err.response?.data?.detail || "Unable to load examination results."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  // Performance calculations
  const totalObtained = results.reduce(
    (sum, r) => sum + Number(r.marks || 0),
    0
  );
  const totalMax = results.reduce(
    (sum, r) => sum + Number(r.max_marks || 100),
    0
  );
  const averagePercentage =
    totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

  // Semesters available
  const semesters = useMemo(() => {
    const sems = new Set(results.map((r) => r.semester).filter(Boolean));
    return Array.from(sems).sort();
  }, [results]);

  const filteredResults = useMemo(() => {
    if (selectedSemester === "all") return results;
    return results.filter((r) => String(r.semester) === String(selectedSemester));
  }, [results, selectedSemester]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <GraduationCap size={16} />
            <span>Academic Records</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Exams & Results
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            View course grades, semester scorecards, and cumulative performance.
          </p>
        </div>

        <Button
          onClick={loadResults}
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
        >
          Refresh Scorecard
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Overall Average"
          value={`${averagePercentage}%`}
          subtitle="Cumulative score across all exams"
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          title="Total Marks"
          value={`${totalObtained} / ${totalMax}`}
          subtitle="Marks scored vs total maximum"
          icon={Award}
          color="blue"
        />

        <StatCard
          title="Exams Recorded"
          value={results.length}
          subtitle="Published course assessments"
          icon={BookOpen}
          color="purple"
        />

        <StatCard
          title="Academic Standing"
          value={averagePercentage >= 75 ? "First Class" : "Pass"}
          subtitle="Good academic standing"
          icon={CheckCircle2}
          color="cyan"
        />
      </div>

      {/* Results Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div>
              <CardTitle>Semester Grade Card</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Official marks and grades recorded by faculty
              </p>
            </div>

            {/* Semester Tabs */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-950/60 p-1">
              <button
                onClick={() => setSelectedSemester("all")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
                  selectedSemester === "all"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Semesters
              </button>
              {semesters.map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
                    selectedSemester === sem
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sem {sem}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={3} cols={5} />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorState title="Could not load results" message={error} onRetry={loadResults} />
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={GraduationCap}
                title="No examination results"
                description="No published results found for the selected semester."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02] border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Exam Type</th>
                    <th className="px-6 py-4">Semester</th>
                    <th className="px-6 py-4 text-center">Marks Obtained</th>
                    <th className="px-6 py-4 text-center">Percentage</th>
                    <th className="px-6 py-4 text-right">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {filteredResults.map((result) => {
                    const marks = Number(result.marks || 0);
                    const maxMarks = Number(result.max_marks || 100);
                    const pct = maxMarks > 0 ? Math.round((marks / maxMarks) * 100) : 0;

                    return (
                      <tr
                        key={result.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-white">
                          {result.subject}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {result.exam || "Midterm Examination"}
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          Semester {result.semester || 3}
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-white">
                          {marks} / {maxMarks}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-emerald-400">{pct}%</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Badge variant="primary" size="md">
                            {result.grade || "A"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Exams;