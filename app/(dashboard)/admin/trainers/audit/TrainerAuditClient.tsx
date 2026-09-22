"use client";

import { Download } from "lucide-react";

export function TrainerAuditClient({ logs }: { logs: any[] }) {
  
  const handleExport = () => {
    // Generate CSV
    const headers = ["ID", "Trainer", "Action", "Details", "IP Address", "Date"];
    const rows = logs.map(log => [
      log.id,
      log.trainers?.name || "System",
      log.action,
      `"${(log.details || "").replace(/"/g, '""')}"`,
      log.ip_address || "N/A",
      new Date(log.created_at).toLocaleString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trainer_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="page-header mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Trainer Audit Logs</h1>
          <p className="text-gray-500">Manage and view trainer audit logs</p>
        </div>
        <button onClick={handleExport} className="btn btn-outline flex items-center gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-medium text-gray-500 text-sm">Trainer</th>
              <th className="p-4 font-medium text-gray-500 text-sm">Action</th>
              <th className="p-4 font-medium text-gray-500 text-sm">Details</th>
              <th className="p-4 font-medium text-gray-500 text-sm">IP Address</th>
              <th className="p-4 font-medium text-gray-500 text-sm text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs && logs.length > 0 ? (
              logs.map((row: any) => (
                <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-primary-700">
                    {row.trainers ? row.trainers.name : "System"}
                  </td>
                  <td className="p-4">
                    <span className="badge badge-neutral capitalize">{row.action}</span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm truncate max-w-xs" title={row.details}>
                    {row.details || "-"}
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {row.ip_address || "N/A"}
                  </td>
                  <td className="p-4 text-gray-500 text-sm text-right">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
