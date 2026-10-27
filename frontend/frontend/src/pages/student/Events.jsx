import React, { useEffect, useState, useMemo } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  RefreshCw,
  Search,
  Calendar,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import API from "../../api/axios";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";

export function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [rsvpIds, setRsvpIds] = useState(new Set());

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/events/");
      const data = response.data;

      if (Array.isArray(data)) {
        setEvents(data);
      } else if (Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
      setError(
        err.response?.data?.detail || "Unable to load campus events."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const q = search.toLowerCase();
      return (
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.organizer?.toLowerCase().includes(q)
      );
    });
  }, [events, search]);

  const toggleRsvp = (eventId) => {
    setRsvpIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <CalendarDays size={16} />
            <span>Campus Activities</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Campus Events & Fests
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Explore cultural fests, workshops, seminars, and student club events.
          </p>
        </div>

        <Button
          onClick={loadEvents}
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
        >
          Refresh Events
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
          placeholder="Search events by title, organizer, location..."
          className="w-full rounded-2xl border border-white/10 bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Events List */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      ) : error ? (
        <ErrorState title="Could not load events" message={error} onRetry={loadEvents} />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events found"
          description={
            search
              ? "No events matched your search query."
              : "There are currently no upcoming events scheduled."
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredEvents.map((event) => {
            const hasRsvped = rsvpIds.has(event.id);

            return (
              <Card
                key={event.id}
                hover
                className="p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="purple" size="sm">
                        {event.organizer || "Campus"}
                      </Badge>
                      <h3 className="text-lg font-bold text-white mt-2">
                        {event.title}
                      </h3>
                    </div>

                    <div className="flex flex-col items-end text-xs text-purple-400 font-mono font-semibold shrink-0">
                      <span>{event.event_date}</span>
                      <span className="text-slate-400 font-normal text-[11px]">{event.event_time}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin size={14} className="text-rose-400" />
                    <span>{event.location || "Campus Auditorium"}</span>
                  </div>

                  <Button
                    onClick={() => toggleRsvp(event.id)}
                    variant={hasRsvped ? "secondary" : "primary"}
                    size="sm"
                    icon={hasRsvped ? CheckCircle : Sparkles}
                    className={
                      !hasRsvped
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-600/20"
                        : "text-emerald-400"
                    }
                  >
                    {hasRsvped ? "Attending" : "RSVP Event"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Events;