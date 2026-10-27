import React, { useEffect, useState, useMemo } from "react";
import {
  Building2,
  Clock,
  MapPin,
  Phone,
  Search,
  RefreshCw,
  BookOpen,
  Dumbbell,
  HeartPulse,
  Coffee,
  Laptop,
} from "lucide-react";
import API from "../../api/axios";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";

export function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const loadResources = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/campus-resources/");
      const data = response.data;

      if (Array.isArray(data)) {
        setResources(data);
      } else if (Array.isArray(data.resources)) {
        setResources(data.resources);
      } else {
        setResources([]);
      }
    } catch (err) {
      console.error("Failed to load resources:", err);
      setError(
        err.response?.data?.detail || "Unable to load campus resources."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(resources.map((r) => r.category).filter(Boolean));
    return Array.from(cats);
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "all" ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [resources, search, selectedCategory]);

  const getCategoryIcon = (category) => {
    const lower = (category || "").toLowerCase();
    if (lower.includes("library")) return BookOpen;
    if (lower.includes("lab") || lower.includes("computer")) return Laptop;
    if (lower.includes("sport") || lower.includes("gym")) return Dumbbell;
    if (lower.includes("health") || lower.includes("medical")) return HeartPulse;
    if (lower.includes("cafe") || lower.includes("canteen")) return Coffee;
    return Building2;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <Building2 size={16} />
            <span>Campus Infrastructure</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Campus Resources & Facilities
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Find university libraries, research labs, sports complexes, and emergency contacts.
          </p>
        </div>

        <Button
          onClick={loadResources}
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
        >
          Refresh Facilities
        </Button>
      </div>

      {/* Filter & Search */}
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
            placeholder="Search libraries, labs, cafeteria, locations..."
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              selectedCategory === "all"
                ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300 shadow-sm"
                : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            All Facilities
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                selectedCategory === cat
                  ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300 shadow-sm"
                  : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-56 rounded-3xl" />
          <Skeleton className="h-56 rounded-3xl" />
          <Skeleton className="h-56 rounded-3xl" />
        </div>
      ) : error ? (
        <ErrorState title="Could not load resources" message={error} onRetry={loadResources} />
      ) : filteredResources.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No campus resources found"
          description={
            search || selectedCategory !== "all"
              ? "No campus facilities match your search query."
              : "No campus resources recorded yet."
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((res) => {
            const Icon = getCategoryIcon(res.category);

            return (
              <Card
                key={res.id}
                hover
                className="p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 ring-4 ring-cyan-500/5">
                      <Icon size={22} />
                    </div>

                    <Badge variant="cyan" size="sm">
                      {res.category || "General"}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {res.name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {res.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin size={14} className="text-rose-400 shrink-0" />
                    <span>Location: {res.location}</span>
                  </div>

                  {(res.opening_time || res.closing_time) && (
                    <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                      <Clock size={14} className="text-blue-400 shrink-0" />
                      <span>
                        Hours: {res.opening_time || "08:00"} - {res.closing_time || "20:00"}
                      </span>
                    </div>
                  )}

                  {res.contact && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone size={14} className="text-emerald-400 shrink-0" />
                      <span>Contact: {res.contact}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Resources;
