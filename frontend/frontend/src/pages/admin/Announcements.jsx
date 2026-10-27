import { useEffect, useState } from "react";
import {
  Bell,
  Plus,
  Trash2,
  Megaphone,
  Calendar,
  Loader2,
} from "lucide-react";

import API from "../../api/axios";

function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const loadAnnouncements = async () => {
    try {
      setLoading(true);

      const response = await API.get("/notices");

      const data = response.data;

      if (Array.isArray(data)) {
        setAnnouncements(data);
      } else if (Array.isArray(data.notices)) {
        setAnnouncements(data.notices);
      } else if (Array.isArray(data.announcements)) {
        setAnnouncements(data.announcements);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error(
        "Failed to load announcements:",
        error
      );

      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Please enter both title and announcement content.");
      return;
    }

    try {
      setCreating(true);

      await API.post("/notices", {
        title: title.trim(),
        content: content.trim(),
      });

      setTitle("");
      setContent("");
      setShowForm(false);

      await loadAnnouncements();

      alert("Announcement created successfully.");
    } catch (error) {
      console.error(
        "Failed to create announcement:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to create announcement."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this announcement?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(id);

      await API.delete(`/notices/${id}`);

      setAnnouncements((previous) =>
        previous.filter(
          (announcement) =>
            announcement.id !== id &&
            announcement._id !== id
        )
      );

      alert("Announcement deleted successfully.");
    } catch (error) {
      console.error(
        "Failed to delete announcement:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to delete announcement."
      );
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
                <Megaphone size={24} />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Announcements
                </h1>

                <p className="text-sm text-slate-400">
                  Manage campus announcements
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-700"
          >
            <Plus size={20} />

            {showForm
              ? "Close Form"
              : "New Announcement"}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl">

            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                Create Announcement
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Publish an important message for the campus.
              </p>
            </div>

            <form
              onSubmit={handleCreate}
              className="space-y-5"
            >

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Announcement Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Enter announcement title"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Announcement Content
                </label>

                <textarea
                  value={content}
                  onChange={(e) =>
                    setContent(e.target.value)
                  }
                  placeholder="Write the announcement..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Creating...
                    </>
                  ) : (
                    <>
                      <Bell size={18} />

                      Publish Announcement
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setTitle("");
                    setContent("");
                  }}
                  className="rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3 font-semibold text-slate-300 transition hover:bg-white/[0.1]"
                >
                  Cancel
                </button>

              </div>
            </form>
          </div>
        )}

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Total Announcements
              </p>

              <Bell
                size={20}
                className="text-blue-400"
              />
            </div>

            <p className="text-3xl font-bold">
              {announcements.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Latest Update
              </p>

              <Calendar
                size={20}
                className="text-emerald-400"
              />
            </div>

            <p className="text-lg font-semibold">
              {announcements.length > 0
                ? formatDate(
                    announcements[0].created_at ||
                      announcements[0].createdAt
                  )
                : "No announcements"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Portal Status
              </p>

              <span className="h-3 w-3 rounded-full bg-emerald-500" />
            </div>

            <p className="text-lg font-semibold text-emerald-400">
              Active
            </p>
          </div>

        </div>

        {/* Announcements */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl">

          <div className="border-b border-white/10 p-6">
            <h2 className="text-xl font-semibold">
              Campus Announcements
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              View and manage published announcements.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-60 items-center justify-center">
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2
                  size={22}
                  className="animate-spin"
                />

                Loading announcements...
              </div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06]">
                <Bell
                  size={28}
                  className="text-slate-500"
                />
              </div>

              <h3 className="text-lg font-semibold">
                No announcements yet
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-400">
                There are currently no campus announcements.
                Click "New Announcement" to publish one.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-white/10">

              {announcements.map((announcement) => {

                const announcementId =
                  announcement.id ||
                  announcement._id;

                return (
                  <div
                    key={announcementId}
                    className="p-6 transition hover:bg-white/[0.02]"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                      <div className="flex gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
                          <Megaphone size={20} />
                        </div>

                        <div>

                          <h3 className="text-lg font-semibold">
                            {announcement.title}
                          </h3>

                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <Calendar size={14} />

                            {formatDate(
                              announcement.created_at ||
                                announcement.createdAt
                            )}
                          </div>

                          <p className="mt-4 leading-7 text-slate-300">
                            {announcement.content ||
                              announcement.message ||
                              "No content available."}
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(announcementId)
                        }
                        disabled={
                          deleting === announcementId
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        {deleting === announcementId ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}

                        Delete
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default AdminAnnouncements;