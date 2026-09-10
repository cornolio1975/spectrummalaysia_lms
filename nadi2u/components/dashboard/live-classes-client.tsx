"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cancelLiveClass, scheduleLiveClass, startLiveClass, completeLiveClass, retryMeetCreation } from "@/app/actions/live-classes";

interface LiveClassesClientProps {
  classes: any[];
  total: number;
  stats: { totalClasses: number; todayClasses: number; liveNow: number };
  programmes: any[];
  trainers: any[];
  filters: Record<string, string | undefined>;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "badge-neutral",
  scheduled: "badge-info",
  live: "badge-success",
  completed: "badge-warning",
  cancelled: "badge-danger",
};

const STATUS_ICONS: Record<string, string> = {
  draft: "✏️",
  scheduled: "🗓",
  live: "🔴",
  completed: "✅",
  cancelled: "❌",
};

function formatMYT(iso: string) {
  return new Date(iso).toLocaleString("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    hour: "2-digit", minute: "2-digit",
  });
}

export function LiveClassesClient({ classes, total, stats, programmes, trainers, filters }: LiveClassesClientProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (action: string, id: string, extra?: string) => {
    setActionLoading(`${action}-${id}`);
    try {
      switch (action) {
        case "schedule": await scheduleLiveClass(id); break;
        case "start": await startLiveClass(id); break;
        case "complete": await completeLiveClass(id); break;
        case "retry": await retryMeetCreation(id); break;
        case "cancel":
          const reason = prompt("Reason for cancellation:");
          if (reason) await cancelLiveClass(id, reason);
          break;
      }
      router.refresh();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>Live Training</h1>
            <p>Schedule and manage Google Meet live classes</p>
          </div>
          <Link href="/live-classes/new" className="btn btn-primary btn-sm">+ Create Live Class</Link>
        </div>
      </div>

      <div className="page-body">
        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <div className="stat-card">
            <div className="stat-icon">📡</div>
            <div className="stat-value">{stats.liveNow}</div>
            <div className="stat-label">Live Now</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-value">{stats.todayClasses}</div>
            <div className="stat-label">Today's Classes</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{stats.totalClasses}</div>
            <div className="stat-label">Total Classes</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="card" style={{ padding: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <select
              className="form-select"
              style={{ minWidth: 160 }}
              defaultValue={filters.status || ""}
              onChange={e => {
                const params = new URLSearchParams(window.location.search);
                e.target.value ? params.set("status", e.target.value) : params.delete("status");
                router.push(`/live-classes?${params.toString()}`);
              }}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">🔴 Live</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="form-select"
              style={{ minWidth: 200 }}
              defaultValue={filters.programme_id || ""}
              onChange={e => {
                const params = new URLSearchParams(window.location.search);
                e.target.value ? params.set("programme_id", e.target.value) : params.delete("programme_id");
                router.push(`/live-classes?${params.toString()}`);
              }}
            >
              <option value="">All Programmes</option>
              {programmes.map((p: any) => (
                <option key={p.id} value={p.id}>{p.programme_name}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ minWidth: 180 }}
              defaultValue={filters.trainer_id || ""}
              onChange={e => {
                const params = new URLSearchParams(window.location.search);
                e.target.value ? params.set("trainer_id", e.target.value) : params.delete("trainer_id");
                router.push(`/live-classes?${params.toString()}`);
              }}
            >
              <option value="">All Trainers</option>
              {trainers.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <input
              type="date"
              className="form-input"
              defaultValue={filters.date_from || ""}
              onChange={e => {
                const params = new URLSearchParams(window.location.search);
                e.target.value ? params.set("date_from", e.target.value) : params.delete("date_from");
                router.push(`/live-classes?${params.toString()}`);
              }}
            />
            <span style={{ color: "var(--text-muted)" }}>to</span>
            <input
              type="date"
              className="form-input"
              defaultValue={filters.date_to || ""}
              onChange={e => {
                const params = new URLSearchParams(window.location.search);
                e.target.value ? params.set("date_to", e.target.value) : params.delete("date_to");
                router.push(`/live-classes?${params.toString()}`);
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
            <span className="text-muted" style={{ fontSize: 14 }}>{total} classes found</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Programme / Module</th>
                <th>Trainer</th>
                <th>Date & Time (MYT)</th>
                <th>Status</th>
                <th>Meet Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32 }}>
                  No live classes found. <Link href="/live-classes/new" className="text-primary">Create one →</Link>
                </td></tr>
              ) : classes.map((cls: any) => (
                <tr key={cls.id} style={{ opacity: cls.status === "cancelled" ? 0.6 : 1 }}>
                  <td>
                    <Link href={`/live-classes/${cls.id}`} style={{ fontWeight: 600 }}>
                      {cls.title}
                    </Link>
                    {cls.nadi_sites && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{cls.nadi_sites.nadi_name}</div>
                    )}
                  </td>
                  <td>
                    <div>{cls.programmes?.programme_name || "—"}</div>
                    {cls.programme_modules && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{cls.programme_modules.title}</div>
                    )}
                  </td>
                  <td>{cls.trainers?.name || "—"}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{formatDate(cls.scheduled_start)}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {formatTime(cls.scheduled_start)} – {formatTime(cls.scheduled_end)}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${STATUS_STYLES[cls.status] || "badge-neutral"}`}>
                      {STATUS_ICONS[cls.status]} {cls.status}
                    </span>
                    {cls.meet_sync_status === "waiting_for_meet" && (
                      <div style={{ fontSize: 11, color: "var(--warning)", marginTop: 4 }}>⏳ Meet pending</div>
                    )}
                  </td>
                  <td>
                    {cls.google_meet_url ? (
                      <a href={cls.google_meet_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                        🎥 Open
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {cls.meet_sync_status === "waiting_for_meet" ? "Pending…" : "Not set"}
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      <Link href={`/live-classes/${cls.id}`} className="btn btn-outline btn-sm">View</Link>
                      {cls.status === "draft" && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAction("schedule", cls.id)}
                          disabled={actionLoading === `schedule-${cls.id}`}
                        >
                          {actionLoading === `schedule-${cls.id}` ? "…" : "Schedule"}
                        </button>
                      )}
                      {cls.status === "scheduled" && (
                        <button className="btn btn-success btn-sm" onClick={() => handleAction("start", cls.id)}
                          disabled={actionLoading === `start-${cls.id}`}>
                          {actionLoading === `start-${cls.id}` ? "…" : "▶ Start"}
                        </button>
                      )}
                      {cls.status === "live" && (
                        <button className="btn btn-warning btn-sm" onClick={() => handleAction("complete", cls.id)}
                          disabled={actionLoading === `complete-${cls.id}`}>
                          {actionLoading === `complete-${cls.id}` ? "…" : "✓ End"}
                        </button>
                      )}
                      {cls.meet_sync_status === "waiting_for_meet" && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleAction("retry", cls.id)}
                          disabled={actionLoading === `retry-${cls.id}`}>
                          🔁 Retry Meet
                        </button>
                      )}
                      {["draft", "scheduled"].includes(cls.status) && (
                        <button className="btn btn-ghost btn-sm text-red-500" onClick={() => handleAction("cancel", cls.id)}
                          disabled={!!actionLoading}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
