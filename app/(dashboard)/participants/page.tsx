import type { Metadata } from "next";
import Link from "next/link";
import { getParticipants } from "@/app/actions/participants";

export const metadata: Metadata = { title: "Participants" };

export default async function ParticipantsPage() {
  const { data: participants, error } = await getParticipants();

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>Participants</h1>
            <p>Manage all programme participants</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-outline btn-sm">⬆ Import CSV</button>
            <Link href="/participants/new" className="btn btn-primary btn-sm">+ Add Participant</Link>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="card" style={{ padding: "0" }}>
          <div className="filter-bar" style={{ margin: 0, border: "none", borderBottom: "1px solid var(--border)", borderRadius: 0 }}>
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input className="form-input" placeholder="Search by name, IC, or participant ID…" />
            </div>
          </div>
          
          {error ? (
            <div className="p-8 text-center text-red-500">Error loading participants: {error}</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Gender</th>
                  <th>NADI Site</th>
                  <th>State</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants && participants.length > 0 ? (
                  participants.map((p: any) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>
                        {p.full_name}
                        <div className="text-xs text-gray-500">{p.email || p.phone}</div>
                      </td>
                      <td>
                        <span className={`badge ${p.gender === "female" ? "badge-info" : "badge-neutral"}`}>
                          {p.gender}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.82rem" }}>{p.nadi_sites?.nadi_name || "-"}</td>
                      <td style={{ fontSize: "0.82rem" }}>{p.states?.state_name || "-"}</td>
                      <td><span className="badge badge-success">{p.status}</span></td>
                      <td style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <Link href={`/participants/${p.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-500">No participants found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
