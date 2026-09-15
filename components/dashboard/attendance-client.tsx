"use client";

import { useState } from "react";
import { markAttendance } from "@/app/actions/attendance";

interface AttendanceRecord {
  participant_id: string;
  full_name: string;
  status: "present" | "late" | "absent" | "excused" | null;
}

interface AttendanceClientProps {
  sessionId: string;
  initialData: AttendanceRecord[];
}

export function AttendanceClient({ sessionId, initialData }: AttendanceClientProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialData);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (participantId: string, status: "present" | "late" | "absent" | "excused") => {
    setLoadingId(participantId);
    
    const result = await markAttendance(sessionId, participantId, status);
    
    if (!result.error) {
      setAttendance(prev => 
        prev.map(record => 
          record.participant_id === participantId 
            ? { ...record, status } 
            : record
        )
      );
    } else {
      alert("Error saving attendance: " + result.error);
    }
    
    setLoadingId(null);
  };

  const getStatusButtonClass = (recordStatus: string | null, targetStatus: string, colorClass: string) => {
    if (recordStatus === targetStatus) {
      return `btn btn-sm ${colorClass}`;
    }
    return "btn btn-outline btn-sm";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Mark Attendance</h2>
        <div className="text-sm text-gray-500">
          {attendance.filter(a => a.status === 'present').length} / {attendance.length} Present
        </div>
      </div>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>Participant Name</th>
            <th className="text-right">Attendance Status</th>
          </tr>
        </thead>
        <tbody>
          {attendance.length > 0 ? attendance.map((record) => (
            <tr key={record.participant_id}>
              <td className="font-medium">{record.full_name}</td>
              <td className="text-right">
                <div className="flex gap-2 justify-end">
                  <button 
                    disabled={loadingId === record.participant_id}
                    onClick={() => handleStatusChange(record.participant_id, "present")}
                    className={getStatusButtonClass(record.status, "present", "btn-success text-white")}
                  >
                    Present
                  </button>
                  <button 
                    disabled={loadingId === record.participant_id}
                    onClick={() => handleStatusChange(record.participant_id, "late")}
                    className={getStatusButtonClass(record.status, "late", "btn-warning text-white")}
                  >
                    Late
                  </button>
                  <button 
                    disabled={loadingId === record.participant_id}
                    onClick={() => handleStatusChange(record.participant_id, "absent")}
                    className={getStatusButtonClass(record.status, "absent", "btn-danger text-white")}
                  >
                    Absent
                  </button>
                  <button 
                    disabled={loadingId === record.participant_id}
                    onClick={() => handleStatusChange(record.participant_id, "excused")}
                    className={getStatusButtonClass(record.status, "excused", "btn-neutral text-white")}
                  >
                    Excused
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={2} className="text-center p-8 text-gray-500">
                No participants registered for this event yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
