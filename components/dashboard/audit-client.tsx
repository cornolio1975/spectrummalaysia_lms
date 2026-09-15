"use client";

import { useState } from "react";

interface AuditClientProps {
  auditLogs: any[];
}

export function AuditClient({ auditLogs }: AuditClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = auditLogs.filter((log) => {
    const searchString = `${log.action} ${log.entity_type} ${log.profiles?.full_name} ${log.notes}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const getActionBadge = (action: string) => {
    if (action.includes('create')) return 'badge-success';
    if (action.includes('delete') || action.includes('revoke')) return 'badge-danger';
    if (action.includes('edit') || action.includes('update')) return 'badge-warning';
    return 'badge-neutral';
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>System Audit Logs</h1>
          <p>Review administrative and system actions</p>
        </div>
      </div>
      
      <div className="page-body">
        <div className="card" style={{ padding: "0" }}>
          <div className="filter-bar" style={{ margin: 0, border: "none", borderBottom: "1px solid var(--border)", borderRadius: 0 }}>
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input 
                className="form-input" 
                placeholder="Search logs by action, entity, user, or notes…" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User (Admin)</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {log.profiles?.full_name || "System"}
                    {log.profiles?.role && <span className="block text-xs text-gray-400">{log.profiles.role}</span>}
                  </td>
                  <td><span className={`badge ${getActionBadge(log.action)}`}>{log.action}</span></td>
                  <td>
                    {log.entity_type}
                    {log.entity_id && <span className="block text-xs text-gray-400 font-mono mt-1" title={log.entity_id}>{log.entity_id.substring(0, 8)}...</span>}
                  </td>
                  <td className="text-sm">{log.notes || "-"}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px" }}>No audit logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
