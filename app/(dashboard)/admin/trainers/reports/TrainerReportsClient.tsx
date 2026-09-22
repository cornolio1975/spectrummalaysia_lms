"use client";

import { Download, FileText, PieChart, TrendingUp, Users } from "lucide-react";

export function TrainerReportsClient({ trainers }: { trainers: any[] }) {
  
  const handleExport = () => {
    // Generate CSV
    const headers = ["Trainer ID", "Name", "Email", "Specialization", "Status", "Created At"];
    const rows = trainers.map(t => [
      t.id,
      `"${t.name}"`,
      t.email || "N/A",
      `"${t.specialization || "N/A"}"`,
      t.status,
      new Date(t.created_at).toLocaleDateString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trainer_master_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="page-header mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Trainer Reports</h1>
          <p className="text-gray-500">Export aggregate trainer data and generate system reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Report Card 1 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Master Trainer Roster</h3>
          <p className="text-sm text-gray-500 flex-1 mb-6">Complete export of all registered trainers, including contact information, statuses, and registration dates.</p>
          <button onClick={handleExport} className="btn btn-outline w-full flex justify-center items-center gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* Report Card 2 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Performance Metrics</h3>
          <p className="text-sm text-gray-500 flex-1 mb-6">Aggregate feedback scores, completion rates, and session delivery totals per trainer.</p>
          <button onClick={() => alert('Data aggregation in progress')} className="btn btn-outline w-full flex justify-center items-center gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* Report Card 3 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Compliance & Docs</h3>
          <p className="text-sm text-gray-500 flex-1 mb-6">Export verification status of required trainer documentation and credential expirations.</p>
          <button onClick={() => alert('Data aggregation in progress')} className="btn btn-outline w-full flex justify-center items-center gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

      </div>
    </>
  );
}
