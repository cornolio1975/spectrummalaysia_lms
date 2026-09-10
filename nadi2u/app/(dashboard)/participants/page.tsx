import type { Metadata } from "next";

export const metadata: Metadata = { title: "Participants" };

export default function ParticipantsPage() {
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
            <button className="btn btn-primary btn-sm">+ Add Participant</button>
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
            <select className="form-select" style={{ width: "auto", fontSize: "0.82rem", padding: "5px 10px" }}>
              <option>All Programmes</option>
              <option>eKelas Pelajar</option>
              <option>eKelas Usahawan</option>
              <option>AI WIRA</option>
            </select>
            <select className="form-select" style={{ width: "auto", fontSize: "0.82rem", padding: "5px 10px" }}>
              <option>All States</option>
              <option>Selangor</option>
              <option>Johor</option>
              <option>Pulau Pinang</option>
            </select>
            <select className="form-select" style={{ width: "auto", fontSize: "0.82rem", padding: "5px 10px" }}>
              <option>All Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Showing 1–10 of 2,485 participants</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-outline btn-sm">⬇ Export</button>
              <button className="btn btn-ghost btn-sm">Columns</button>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Gender</th>
                <th>NADI Site</th>
                <th>State</th>
                <th>Programme</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "P000001", name: "Nur Aisyah binti Ahmad", gender: "Female", nadi: "NADI PJ", state: "Selangor", prog: "eKelas Pelajar", status: "active", date: "2026-03-01" },
                { id: "P000002", name: "Muhammad Haziq bin Rosli", gender: "Male", nadi: "NADI Shah Alam", state: "Selangor", prog: "eKelas Pelajar", status: "active", date: "2026-03-02" },
                { id: "P000003", name: "Siti Nabilah binti Zulkifli", gender: "Female", nadi: "NADI Georgetown", state: "Pulau Pinang", prog: "AI WIRA", status: "active", date: "2026-03-03" },
                { id: "P000004", name: "Mohamad Faiz bin Abdul Karim", gender: "Male", nadi: "NADI JB", state: "Johor", prog: "eKelas Usahawan", status: "active", date: "2026-03-04" },
                { id: "P000005", name: "Priya a/p Subramaniam", gender: "Female", nadi: "NADI Ipoh", state: "Perak", prog: "AI WIRA", status: "active", date: "2026-03-05" },
              ].map((p) => (
                <tr key={p.id}>
                  <td><span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-muted)" }}>{p.id}</span></td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td>
                    <span className={`badge ${p.gender === "Female" ? "badge-info" : "badge-neutral"}`}>
                      {p.gender}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.82rem" }}>{p.nadi}</td>
                  <td style={{ fontSize: "0.82rem" }}>{p.state}</td>
                  <td style={{ fontSize: "0.82rem" }}>{p.prog}</td>
                  <td><span className="badge badge-success">{p.status}</span></td>
                  <td style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{p.date}</td>
                  <td>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button className="btn btn-outline btn-sm">View</button>
                      <button className="btn btn-ghost btn-sm">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Page 1 of 249</span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button className="btn btn-outline btn-sm" disabled>← Prev</button>
              <button className="btn btn-outline btn-sm">Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
