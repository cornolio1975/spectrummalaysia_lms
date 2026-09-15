"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startLiveClass, completeLiveClass } from "@/app/actions/live-classes";
import { updateAttendanceManually, bulkSaveAttendance } from "@/app/actions/live-attendance";

interface TrainerClassManageClientProps {
  liveClass: any;
  attendance: any[];
}

export function TrainerClassManageClient({ liveClass, attendance }: TrainerClassManageClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [localAttendance, setLocalAttendance] = useState(
    attendance.reduce((acc, curr) => {
      acc[curr.participant_id] = curr.attendance_status;
      return acc;
    }, {} as Record<string, string>)
  );

  const handleStart = async () => {
    setLoading(true);
    await startLiveClass(liveClass.id);
    setLoading(false);
    router.refresh();
  };

  const handleComplete = async () => {
    if (confirm("Are you sure you want to end this class?")) {
      setLoading(true);
      await completeLiveClass(liveClass.id);
      setLoading(false);
      router.refresh();
    }
  };

  const handleAttendanceChange = (participantId: string, status: string) => {
    setLocalAttendance((prev: Record<string, string>) => ({ ...prev, [participantId]: status }));
  };

  const saveAttendance = async () => {
    setLoading(true);
    const records = Object.entries(localAttendance).map(([participant_id, status]) => ({
      participant_id,
      attendance_status: status as any
    }));
    await bulkSaveAttendance(liveClass.id, records);
    setLoading(false);
    alert("Attendance saved!");
  };

  const isLive = liveClass.status === "live";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="card p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-blue-200 text-sm font-medium mb-1 tracking-wider uppercase">
              Live Class Control
            </div>
            <h1 className="text-3xl font-bold mb-2 text-white">{liveClass.title}</h1>
            <div className="flex gap-4 text-blue-100 text-sm">
              <span>📅 {new Date(liveClass.scheduled_start).toLocaleDateString()}</span>
              <span>⏰ {new Date(liveClass.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>👥 {attendance.length} Participants</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              liveClass.status === "live" ? "bg-red-500 text-white animate-pulse" : 
              liveClass.status === "scheduled" ? "bg-blue-500 text-white" : 
              "bg-gray-500 text-white"
            }`}>
              {liveClass.status === "live" ? "🔴 LIVE NOW" : liveClass.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="mt-8 flex gap-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
          {liveClass.status === "scheduled" && (
            <button className="btn bg-green-500 hover:bg-green-600 text-white border-0" onClick={handleStart} disabled={loading}>
              ▶ Start Class
            </button>
          )}
          {isLive && (
            <button className="btn bg-red-500 hover:bg-red-600 text-white border-0" onClick={handleComplete} disabled={loading}>
              ⏹ End Class
            </button>
          )}
          <a 
            href={liveClass.google_meet_url || "#"} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`btn ${!liveClass.google_meet_url ? "opacity-50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white border-0`}
            onClick={(e) => { if (!liveClass.google_meet_url) e.preventDefault(); }}
          >
            🎥 Open Google Meet
          </a>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="m-0 text-lg">Class Attendance</h3>
          <button className="btn btn-primary btn-sm" onClick={saveAttendance} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
        <table className="data-table w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Participant</th>
              <th className="text-left p-4">Join Time (LMS)</th>
              <th className="text-right p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {attendance.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-muted">No participants found for this class.</td>
              </tr>
            ) : attendance.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50/50">
                <td className="p-4">
                  <div className="font-medium">{record.participants?.full_name}</div>
                  <div className="text-xs text-muted">{record.participants?.ic_number}</div>
                </td>
                <td className="p-4 text-sm">
                  {record.join_clicked_at 
                    ? new Date(record.join_clicked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : "Not joined"}
                </td>
                <td className="p-4 text-right">
                  <select 
                    className="form-select text-sm py-1 max-w-[140px] ml-auto"
                    value={localAttendance[record.participant_id] || record.attendance_status}
                    onChange={(e) => handleAttendanceChange(record.participant_id, e.target.value)}
                  >
                    <option value="unknown">Unknown</option>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="excused">Excused</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
