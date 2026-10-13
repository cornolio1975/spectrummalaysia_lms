"use client";

import { Download } from "lucide-react";

interface Props {
  data: any[];
  filename?: string;
}

export function ExportCsvButton({ data, filename = "live-training-report.csv" }: Props) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Date", "Class", "Programme", "Trainer", "NADI", "State", "Duration (Min)", "Total", "Present", "Late", "Absent", "Attendance Rate %"];
    const rows = data.map((r) => [
      `"${r.date ? new Date(r.date).toISOString().split("T")[0] : ""}"`,
      `"${(r.title || "").replace(/"/g, '""')}"`,
      `"${(r.programme || "").replace(/"/g, '""')}"`,
      `"${(r.trainer || "").replace(/"/g, '""')}"`,
      `"${(r.nadi || "").replace(/"/g, '""')}"`,
      `"${(r.state || "").replace(/"/g, '""')}"`,
      r.duration_min || 0,
      r.total || 0,
      r.present || 0,
      r.late || 0,
      r.absent || 0,
      `"${r.rate || "0"}%"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      type="button"
      className="btn btn-outline btn-sm flex items-center gap-1.5"
      onClick={handleExport}
    >
      <Download className="w-3.5 h-3.5" />
      Export CSV
    </button>
  );
}
