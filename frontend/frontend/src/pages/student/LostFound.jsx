import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Plus,
  MapPin,
  Calendar,
  Phone,
  Tag,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import API from "../../api/axios";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Modal } from "../../components/ui/Modal";

export function LostFound() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Create Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [itemType, setItemType] = useState("Lost");
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [itemDate, setItemDate] = useState(new Date().toISOString().split("T")[0]);
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/lost-found/");
      const data = response.data;

      if (Array.isArray(data)) {
        setItems(data);
      } else if (Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Failed to load lost/found:", err);
      setError(
        err.response?.data?.detail || "Unable to load lost and found listings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !description.trim() || !location.trim()) {
      setFormError("Item name, description, and location are required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      await API.post("/lost-found/", {
        type: itemType,
        item_name: itemName,
        description,
        location,
        date: itemDate,
        contact: contact || "University Security Desk",
      });

      setItemName("");
      setDescription("");
      setLocation("");
      setContact("");
      setCreateOpen(false);
      loadItems();
    } catch (err) {
      console.error("Report item error:", err);
      setFormError(
        err.response?.data?.detail || "Failed to submit item report."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const lostCount = items.filter((i) => i.type === "Lost").length;
  const foundCount = items.filter((i) => i.type === "Found").length;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        item.item_name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q);

      const matchesType =
        typeFilter === "all" ||
        item.type?.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [items, search, typeFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Search size={16} />
            <span>Campus Community Desk</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Lost & Found
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Report missing possessions or view items recovered across campus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={loadItems}
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            onClick={() => setCreateOpen(true)}
            variant="primary"
            size="sm"
            icon={Plus}
          >
            Report Item
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          title="Total Reports"
          value={items.length}
          subtitle="Listings on community board"
          icon={Tag}
          color="blue"
        />

        <StatCard
          title="Lost Items"
          value={lostCount}
          subtitle="Reported missing by students"
          icon={HelpCircle}
          color="amber"
        />

        <StatCard
          title="Found Items"
          value={foundCount}
          subtitle="Recovered / at security desk"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Filters & Search */}
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
            placeholder="Search items by name, description, location..."
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center rounded-xl border border-white/10 bg-slate-900/60 p-1">
          {["all", "lost", "found"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-lg px-3.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all ${
                typeFilter === t
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      ) : error ? (
        <ErrorState title="Could not load items" message={error} onRetry={loadItems} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No items found"
          description={
            search || typeFilter !== "all"
              ? "No items match your active filters."
              : "No lost or found items reported yet."
          }
          actionText="Report an Item"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredItems.map((item) => {
            const isFound = item.type === "Found";

            return (
              <Card
                key={item.id}
                hover
                className="p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant={isFound ? "success" : "warning"} size="sm">
                        {item.type}
                      </Badge>
                      <h3 className="text-lg font-bold text-white mt-2">
                        {item.item_name}
                      </h3>
                    </div>

                    <span className="text-xs text-slate-500 font-mono">
                      {item.date}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin size={14} className="text-rose-400 shrink-0" />
                    <span>Location: {item.location}</span>
                  </div>

                  {item.contact && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone size={14} className="text-emerald-400 shrink-0" />
                      <span>Contact: {item.contact}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Report Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Report Lost or Found Item"
        description="Add a listing to the university Lost & Found directory"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {formError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Listing Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 cursor-pointer text-xs font-bold transition-all ${
                  itemType === "Lost"
                    ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                    : "border-white/10 bg-white/5 text-slate-400"
                }`}
              >
                <input
                  type="radio"
                  name="itemType"
                  value="Lost"
                  checked={itemType === "Lost"}
                  onChange={() => setItemType("Lost")}
                  className="hidden"
                />
                <span>Lost Item</span>
              </label>
              <label
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 cursor-pointer text-xs font-bold transition-all ${
                  itemType === "Found"
                    ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                    : "border-white/10 bg-white/5 text-slate-400"
                }`}
              >
                <input
                  type="radio"
                  name="itemType"
                  value="Found"
                  checked={itemType === "Found"}
                  onChange={() => setItemType("Found")}
                  className="hidden"
                />
                <span>Found Item</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Item Name
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Blue Titan Watch, CSE Notebook, Black Wallet..."
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Location Found/Lost
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Library 2nd Floor, Canteen..."
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Date
              </label>
              <input
                type="date"
                value={itemDate}
                onChange={(e) => setItemDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-white outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Contact Details
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Phone number, email, or Security Room B-101"
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide color, brand, markings, or identifying features..."
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
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
              variant="primary"
              loading={submitting}
              className="w-1/2"
            >
              Publish Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default LostFound;