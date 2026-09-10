"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cancelLiveClass, scheduleLiveClass, startLiveClass, completeLiveClass, retryMeetCreation } from "@/app/actions/live-classes";

interface LiveClassDetailClientProps {
  liveClass: any;
  attendance: any[];
}

const STATUS_STYLES: Record<string, string> = {
  draft: "badge-neutral",
  scheduled: "badge-info",
  live: "badge-success",
  completed: "badge-warning",
  cancelled: "badge-danger",
};

export function LiveClassDetailClient({ liveClass, attendance }: LiveClassDetailClientProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      switch (action) {
        case "schedule": await scheduleLiveClass(liveClass.id); break;
        case "start": await startLiveClass(liveClass.id); break;
        case "complete": await completeLiveClass(liveClass.id); break;
        case "retry": await retryMeetCreation(liveClass.id); break;
        case "cancel":
          const reason = prompt("Reason for cancellation:");
          if (reason) await cancelLiveClass(liveClass.id, reason);
          break;
      }
      router.refresh();
    } finally {
      setActionLoading(null);
    }
  };

  const presentCount = attendance.filter(a => a.attendance_status === "present").length;
  const lateCount = attendance.filter(a => a.attendance_status === "late").length;
  const totalAttended = presentCount + lateCount;

  return (
    <>
      <div className="page-header">
        <div>
          <Link href="/live-classes" className="text-sm text-muted hover:underline mb-2 inline-block">
            ← Back to Live Classes
          </Link>
          <div className="flex items-center gap-3">
            <h1>{liveClass.title}</h1>
            <span className={`badge ${STATUS_STYLES[liveClass.status] || "badge-neutral"} text-sm px-2 py-1`}>
              {liveClass.status.toUpperCase()}
            </span>
          </div>
          <p className="mt-1">{liveClass.programmes?.programme_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-6">
          <div className="card p-6">
            <h3 className="mb-4">Class Details</h3>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <div className="text-sm text-muted">Trainer</div>
                <div className="font-medium">{liveClass.trainers?.name || "Not assigned"}</div>
              </div>
              <div>
                <div className="text-sm text-muted">Date & Time</div>
                <div className="font-medium">
                  {new Date(liveClass.scheduled_start).toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })}
                  <br />
                  <span className="text-sm text-muted">
                    to {new Date(liveClass.scheduled_end).toLocaleTimeString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted">NADI Site</div>
                <div className="font-medium">{liveClass.nadi_sites?.nadi_name || "All / None Specific"}</div>
              </div>
              <div>
                <div className="text-sm text-muted">State</div>
                <div className="font-medium">{liveClass.states?.state_name || "All"}</div>
              </div>
            </div>
            
            {liveClass.description && (
              <div className="mt-6">
                <div className="text-sm text-muted mb-1">Description</div>
                <p className="text-sm">{liveClass.description}</p>
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3>Attendance Summary</h3>
              <div className="text-sm text-muted">{attendance.length} Total Registered</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-green-800 text-sm font-medium">Present</div>
                <div className="text-2xl font-bold text-green-900 mt-1">{presentCount}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <div className="text-yellow-800 text-sm font-medium">Late</div>
                <div className="text-2xl font-bold text-yellow-900 mt-1">{lateCount}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-blue-800 text-sm font-medium">Attendance Rate</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  {attendance.length > 0 ? Math.round((totalAttended / attendance.length) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card p-6">
            <h3 className="mb-4">Google Meet</h3>
            {liveClass.google_meet_url ? (
              <div className="flex flex-col gap-3">
                <a href={liveClass.google_meet_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full text-center">
                  🎥 Open Meeting
                </a>
                <div className="text-xs text-center text-muted">
                  Code: {liveClass.google_meet_code}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border rounded-lg text-center">
                {liveClass.meet_sync_status === "waiting_for_meet" ? (
                  <>
                    <p className="text-sm text-warning mb-2">Meet Link Pending</p>
                    <button 
                      className="btn btn-outline btn-sm w-full"
                      onClick={() => handleAction("retry")}
                      disabled={actionLoading === "retry"}
                    >
                      {actionLoading === "retry" ? "Retrying..." : "Retry Sync"}
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-muted">Not generated yet.</p>
                )}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="mb-4">Admin Actions</h3>
            <div className="flex flex-col gap-2">
              {liveClass.status === "draft" && (
                <button 
                  className="btn btn-primary w-full" 
                  onClick={() => handleAction("schedule")}
                  disabled={!!actionLoading}
                >
                  Schedule Class
                </button>
              )}
              {liveClass.status === "scheduled" && (
                <button 
                  className="btn btn-success w-full" 
                  onClick={() => handleAction("start")}
                  disabled={!!actionLoading}
                >
                  Force Start (Live)
                </button>
              )}
              {liveClass.status === "live" && (
                <button 
                  className="btn btn-warning w-full" 
                  onClick={() => handleAction("complete")}
                  disabled={!!actionLoading}
                >
                  Force Complete
                </button>
              )}
              {["draft", "scheduled"].includes(liveClass.status) && (
                <button 
                  className="btn btn-outline w-full text-red-500 border-red-200 hover:bg-red-50" 
                  onClick={() => handleAction("cancel")}
                  disabled={!!actionLoading}
                >
                  Cancel Class
                </button>
              )}
              {liveClass.status === "completed" && (
                <div className="text-center text-sm text-muted p-2 bg-gray-50 rounded">
                  Class is completed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
