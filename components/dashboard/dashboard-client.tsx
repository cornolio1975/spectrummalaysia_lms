"use client";

import { useState } from "react";

interface DashboardStats {
  totalParticipants: number;
  activeLearners: number;
  programmes: number;
  nadiSites: number;
  events: number;
  completedLearners: number;
  certificates: number;
  states: number;
  attendanceRate: number;
  completionRate: number;
  kpiAchievement: number;
  activeSessions: number;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  iconBg: string;
  trend?: { value: number; positive: boolean };
  isPercent?: boolean;
}

function KpiCard({ label, value, sub, icon, iconBg, trend, isPercent }: KpiCardProps) {
  return (
    <div className="kpi-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value" style={{ marginTop: "8px" }}>
            {typeof value === "number" ? value.toLocaleString() : value}
            {isPercent && <span style={{ fontSize: "1.2rem", fontWeight: 600 }}>%</span>}
          </div>
          {sub && <div className="kpi-sub" style={{ marginTop: "6px" }}>{sub}</div>}
          {trend !== undefined && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginTop: "6px",
              fontSize: "0.75rem",
              color: trend.positive ? "var(--success)" : "var(--danger)",
              fontWeight: 500,
            }}>
              <span>{trend.positive ? "▲" : "▼"}</span>
              <span>{Math.abs(trend.value)}% from last month</span>
            </div>
          )}
        </div>
        <div
          className="kpi-icon"
          style={{ background: iconBg, fontSize: "18px" }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

const PARTICIPATION_DATA = [
  { month: "Apr", ekelas_pelajar: 180, ekelas_usahawan: 95, ai_wira: 60 },
  { month: "May", ekelas_pelajar: 220, ekelas_usahawan: 110, ai_wira: 80 },
  { month: "Jun", ekelas_pelajar: 195, ekelas_usahawan: 125, ai_wira: 90 },
  { month: "Jul", ekelas_pelajar: 265, ekelas_usahawan: 140, ai_wira: 105 },
  { month: "Aug", ekelas_pelajar: 310, ekelas_usahawan: 160, ai_wira: 120 },
  { month: "Sep", ekelas_pelajar: 280, ekelas_usahawan: 145, ai_wira: 115 },
];

const TOP_NADI = [
  { name: "NADI Petaling Jaya", participants: 142, completion: 88 },
  { name: "NADI Shah Alam", participants: 128, completion: 82 },
  { name: "NADI Johor Bahru", participants: 115, completion: 79 },
  { name: "NADI Georgetown", participants: 108, completion: 91 },
  { name: "NADI Kota Kinabalu", participants: 97, completion: 75 },
];

const PROGRAMME_PERF = [
  { name: "eKelas Pelajar", target: 500, actual: 465, completion: 87 },
  { name: "eKelas Usahawan", target: 300, actual: 248, completion: 76 },
  { name: "AI WIRA", target: 200, actual: 172, completion: 84 },
];

interface DashboardClientProps {
  stats: DashboardStats;
}

export default function DashboardClient({ stats }: DashboardClientProps) {
  const [selectedYear] = useState("2026");
  const [selectedProgramme, setSelectedProgramme] = useState("All");
  const [selectedState, setSelectedState] = useState("All");

  // Demo values when DB is empty (will be replaced by actual data once seeded)
  const displayStats = {
    totalParticipants: stats.totalParticipants || 2485,
    activeLearners:    stats.activeLearners    || 1862,
    programmes:        stats.programmes        || 3,
    nadiSites:         stats.nadiSites         || 73,
    events:            stats.events            || 156,
    completedLearners: stats.completedLearners || 1426,
    certificates:      stats.certificates      || 1218,
    states:            stats.states            || 16,
    attendanceRate:    stats.attendanceRate     || 87,
    completionRate:    stats.completionRate     || 74,
    kpiAchievement:    stats.kpiAchievement     || 91,
    activeSessions:    stats.activeSessions     || 12,
  };

  const isDemo = stats.totalParticipants === 0;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1>Dashboard</h1>
            <p>SpectrumMY Programme & Learning Management System overview</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            {isDemo && (
              <span className="badge badge-warning">
                📊 Demo Data — Seed database to show live values
              </span>
            )}
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Last updated: {new Date().toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Filter bar */}
        <div className="filter-bar">
          <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)", marginRight: "4px" }}>
            Filter:
          </div>
          <select
            className="form-select"
            value={selectedYear}
            style={{ width: "auto", fontSize: "0.82rem", padding: "5px 10px" }}
            onChange={() => {}}
          >
            <option>2026</option>
            <option>2025</option>
          </select>
          <select
            className="form-select"
            value={selectedProgramme}
            style={{ width: "auto", fontSize: "0.82rem", padding: "5px 10px" }}
            onChange={(e) => setSelectedProgramme(e.target.value)}
          >
            <option>All</option>
            <option>eKelas Pelajar</option>
            <option>eKelas Usahawan</option>
            <option>AI WIRA</option>
          </select>
          <select
            className="form-select"
            value={selectedState}
            style={{ width: "auto", fontSize: "0.82rem", padding: "5px 10px" }}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option>All</option>
            <option>Selangor</option>
            <option>Johor</option>
            <option>Sabah</option>
            <option>Sarawak</option>
          </select>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => { setSelectedProgramme("All"); setSelectedState("All"); }}
          >
            Reset Filters
          </button>
        </div>

        {/* Primary KPI Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}>
          <KpiCard
            label="Total Participants"
            value={displayStats.totalParticipants}
            sub="Registered across all programmes"
            icon="👥"
            iconBg="#eff6ff"
            trend={{ value: 8.2, positive: true }}
          />
          <KpiCard
            label="Active Learners"
            value={displayStats.activeLearners}
            sub="Currently enrolled & learning"
            icon="🎓"
            iconBg="#f0fdf4"
            trend={{ value: 5.1, positive: true }}
          />
          <KpiCard
            label="Programmes"
            value={displayStats.programmes}
            sub="Active programmes running"
            icon="📚"
            iconBg="#fefce8"
          />
          <KpiCard
            label="NADI Sites"
            value={displayStats.nadiSites}
            sub="Across all states"
            icon="🏛"
            iconBg="#fdf4ff"
          />
          <KpiCard
            label="Events Conducted"
            value={displayStats.events}
            sub="This year"
            icon="📅"
            iconBg="#fff7ed"
            trend={{ value: 12.5, positive: true }}
          />
          <KpiCard
            label="Completed"
            value={displayStats.completedLearners}
            sub="Programme completions"
            icon="✅"
            iconBg="#f0fdf4"
            trend={{ value: 3.8, positive: true }}
          />
          <KpiCard
            label="Certificates Issued"
            value={displayStats.certificates}
            sub="All time"
            icon="🏆"
            iconBg="#fffbeb"
            trend={{ value: 15.2, positive: true }}
          />
          <KpiCard
            label="States"
            value={displayStats.states}
            sub="Covered nationally"
            icon="🗺"
            iconBg="#f0f9ff"
          />
        </div>

        {/* Rate KPI Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}>
          <KpiCard
            label="Attendance Rate"
            value={displayStats.attendanceRate}
            isPercent
            sub="Average across all events"
            icon="📋"
            iconBg="#f0fdf4"
          />
          <KpiCard
            label="Completion Rate"
            value={displayStats.completionRate}
            isPercent
            sub="Learning programme completion"
            icon="📈"
            iconBg="#eff6ff"
          />
          <KpiCard
            label="KPI Achievement"
            value={displayStats.kpiAchievement}
            isPercent
            sub="Overall programme KPI"
            icon="🎯"
            iconBg="#fdf4ff"
          />
          <KpiCard
            label="Active Sessions"
            value={displayStats.activeSessions}
            sub="Currently in progress"
            icon="⚡"
            iconBg="#fff7ed"
          />
        </div>

        {/* Charts Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}>
          {/* Participation Trend */}
          <div className="chart-container">
            <div className="chart-title">Participation Trend</div>
            <div className="chart-subtitle">Monthly participation by programme — 2026</div>
            <div style={{ overflowX: "auto" }}>
              <div style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "20px",
                height: "180px",
                padding: "0 8px",
                minWidth: "400px",
              }}>
                {PARTICIPATION_DATA.map((month) => {
                  const maxVal = 320;
                  return (
                    <div
                      key={month.month}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        height: "100%",
                        justifyContent: "flex-end",
                      }}
                    >
                      <div style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "3px",
                        width: "100%",
                        height: "150px",
                      }}>
                        {[
                          { val: month.ekelas_pelajar, color: "#1b3a6b" },
                          { val: month.ekelas_usahawan, color: "#0d7063" },
                          { val: month.ai_wira, color: "#7c3aed" },
                        ].map(({ val, color }, i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: `${(val / maxVal) * 100}%`,
                              background: color,
                              borderRadius: "3px 3px 0 0",
                              opacity: 0.85,
                              transition: "opacity 0.15s",
                              cursor: "pointer",
                              minHeight: "4px",
                            }}
                            title={`${["eKelas Pelajar","eKelas Usahawan","AI WIRA"][i]}: ${val}`}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        {month.month}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Legend */}
            <div style={{
              display: "flex",
              gap: "16px",
              marginTop: "12px",
              flexWrap: "wrap",
            }}>
              {[
                { color: "#1b3a6b", label: "eKelas Pelajar" },
                { color: "#0d7063", label: "eKelas Usahawan" },
                { color: "#7c3aed", label: "AI WIRA" },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: color }} />
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gender Distribution */}
          <div className="chart-container">
            <div className="chart-title">Gender Distribution</div>
            <div className="chart-subtitle">All participants</div>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "8px",
            }}>
              {[
                { label: "Female", value: 58, color: "#e879f9", count: 1441 },
                { label: "Male", value: 41, color: "#1b3a6b", count: 1019 },
                { label: "Not Specified", value: 1, color: "#94a3b8", count: 25 },
              ].map(({ label, value, color, count }) => (
                <div key={label}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                    fontSize: "0.8rem",
                  }}>
                    <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {value}% <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({count.toLocaleString()})</span>
                    </span>
                  </div>
                  <div style={{
                    height: "8px",
                    background: "var(--surface)",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${value}%`,
                      background: color,
                      borderRadius: "4px",
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "20px" }}>
              <div className="chart-title">Age Distribution</div>
              <div className="chart-subtitle" style={{ marginBottom: "10px" }}>By age band</div>
              {[
                { band: "7–12", value: 22, color: "#fbbf24" },
                { band: "13–17", value: 35, color: "#1b3a6b" },
                { band: "18–24", value: 28, color: "#0d7063" },
                { band: "25–39", value: 11, color: "#7c3aed" },
                { band: "40+",   value: 4,  color: "#94a3b8" },
              ].map(({ band, value, color }) => (
                <div key={band} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    width: "40px",
                    flexShrink: 0,
                  }}>
                    {band}
                  </div>
                  <div style={{
                    flex: 1,
                    height: "6px",
                    background: "var(--surface)",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${value * 2.5}%`,
                      background: color,
                      borderRadius: "3px",
                    }} />
                  </div>
                  <div style={{
                    fontSize: "0.72rem",
                    color: "var(--text-secondary)",
                    fontWeight: 600,
                    width: "30px",
                    textAlign: "right",
                  }}>
                    {value}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}>
          {/* Programme Performance */}
          <div className="chart-container">
            <div className="chart-title">Programme Performance</div>
            <div className="chart-subtitle">Target vs Actual participants</div>
            <div style={{ marginTop: "8px" }}>
              {PROGRAMME_PERF.map((prog) => {
                const pct = Math.round((prog.actual / prog.target) * 100);
                const statusColor =
                  pct >= 90
                    ? "var(--success)"
                    : pct >= 70
                    ? "var(--warning)"
                    : "var(--danger)";
                const statusLabel =
                  pct >= 90 ? "On Target" : pct >= 70 ? "Near Target" : "Below Target";

                return (
                  <div
                    key={prog.name}
                    style={{
                      padding: "14px",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{prog.name}</div>
                      <span
                        className="badge"
                        style={{
                          background: statusColor === "var(--success)" ? "var(--success-bg)" :
                            statusColor === "var(--warning)" ? "var(--warning-bg)" : "var(--danger-bg)",
                          color: statusColor,
                          border: `1px solid ${
                            statusColor === "var(--success)" ? "var(--success-border)" :
                            statusColor === "var(--warning)" ? "var(--warning-border)" : "var(--danger-border)"
                          }`,
                        }}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      marginBottom: "6px",
                    }}>
                      <span>Target: <strong style={{ color: "var(--text-primary)" }}>{prog.target.toLocaleString()}</strong></span>
                      <span>Actual: <strong style={{ color: "var(--text-primary)" }}>{prog.actual.toLocaleString()}</strong></span>
                      <span>Achievement: <strong style={{ color: statusColor }}>{pct}%</strong></span>
                    </div>
                    <div style={{
                      height: "6px",
                      background: "var(--surface)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.min(pct, 100)}%`,
                        background: statusColor,
                        borderRadius: "3px",
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                    <div style={{
                      marginTop: "6px",
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                    }}>
                      Completion rate: {prog.completion}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top NADI Sites */}
          <div className="chart-container">
            <div className="chart-title">Top NADI Sites</div>
            <div className="chart-subtitle">By participant count</div>
            <div style={{ marginTop: "8px" }}>
              <table className="data-table" style={{ fontSize: "0.82rem" }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>NADI Site</th>
                    <th style={{ textAlign: "right" }}>Participants</th>
                    <th style={{ textAlign: "right" }}>Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_NADI.map((nadi, i) => (
                    <tr key={nadi.name}>
                      <td>
                        <span style={{
                          width: "22px",
                          height: "22px",
                          background: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c2e" : "var(--surface)",
                          color: i < 3 ? "#fff" : "var(--text-muted)",
                          borderRadius: "50%",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.65rem",
                          fontWeight: "700",
                        }}>
                          {i + 1}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{nadi.name}</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {nadi.participants}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span style={{
                          color: nadi.completion >= 85 ? "var(--success)" : nadi.completion >= 75 ? "var(--warning)" : "var(--danger)",
                          fontWeight: 600,
                        }}>
                          {nadi.completion}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: "16px" }}>
                <div className="chart-title" style={{ marginBottom: "10px" }}>Quick Actions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[
                    { label: "Add New Participant", href: "/participants/registration", icon: "👤" },
                    { label: "Create Event", href: "/events", icon: "📅" },
                    { label: "View Reports", href: "/reports/participants", icon: "📋" },
                    { label: "Manage NADI Sites", href: "/nadi/sites", icon: "🏛" },
                  ].map((action) => (
                    <a
                      key={action.href}
                      href={action.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 12px",
                        borderRadius: "var(--radius)",
                        border: "1px solid var(--border)",
                        fontSize: "0.82rem",
                        color: "var(--text-primary)",
                        textDecoration: "none",
                        transition: "all 0.15s",
                        background: "var(--card)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--primary-light)";
                        e.currentTarget.style.background = "var(--info-bg)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.background = "var(--card)";
                      }}
                    >
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
                      <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "12px" }}>→</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
