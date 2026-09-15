"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function ReportsClient({ programmes, events }: { programmes: any[], events: any[] }) {
  const [reportType, setReportType] = useState("participants");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    const supabase = createClient();
    
    try {
      let dataToExport: any[] = [];
      let filename = "report.csv";

      if (reportType === "participants") {
        const { data } = await supabase.from("participants").select("id, ic_number, full_name, gender, age_group, phone");
        dataToExport = data || [];
        filename = "participants_report.csv";
      } else if (reportType === "attendance" && selectedEvent) {
        const { data } = await supabase
          .from("event_participants")
          .select("participants(full_name, ic_number), status")
          .eq("event_id", selectedEvent);
          
        dataToExport = (data || []).map((r: any) => ({
          name: r.participants?.full_name,
          ic: r.participants?.ic_number,
          status: r.status
        }));
        filename = `attendance_event_${selectedEvent}.csv`;
      } else if (reportType === "certificates") {
        const { data } = await supabase
          .from("certificates")
          .select("certificate_no, participants(full_name), programmes(programme_name), status, issue_date");
          
        dataToExport = (data || []).map((r: any) => ({
          certificate_no: r.certificate_no,
          participant: r.participants?.full_name,
          programme: r.programmes?.programme_name,
          status: r.status,
          date: r.issue_date
        }));
        filename = "certificates_report.csv";
      }

      if (dataToExport.length === 0) {
        alert("No data found for this report.");
        return;
      }

      // Convert to CSV
      const headers = Object.keys(dataToExport[0]).join(",");
      const rows = dataToExport.map(obj => 
        Object.values(obj).map(val => `"${val || ''}"`).join(",")
      );
      const csv = [headers, ...rows].join("\n");

      // Download
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (err) {
      console.error(err);
      alert("Error generating report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Generate data exports and analytical reports</p>
        </div>
      </div>
      
      <div className="page-body">
        <div className="card max-w-2xl">
          <h3 className="font-bold mb-4">Export Data</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Report Type</label>
              <select className="form-select w-full" value={reportType} onChange={e => setReportType(e.target.value)}>
                <option value="participants">All Master Participants</option>
                <option value="attendance">Event Attendance & Registration</option>
                <option value="certificates">Issued Certificates</option>
              </select>
            </div>
            
            {reportType === "attendance" && (
              <div>
                <label className="block text-sm font-medium mb-1">Select Event</label>
                <select className="form-select w-full" value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
                  <option value="">-- Choose Event --</option>
                  {events.map(e => (
                    <option key={e.id} value={e.id}>{e.event_name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <button 
              className="btn btn-primary w-full" 
              onClick={generateReport}
              disabled={isGenerating || (reportType === 'attendance' && !selectedEvent)}
            >
              {isGenerating ? "Generating..." : "Generate CSV Report"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
