"use client";

import Link from "next/link";

interface MyClassesClientProps {
  classes: any[];
  attendance: any[];
  summary: { total: number; present: number; late: number; absent: number; rate: string } | null;
  participant: any;
}

export function MyClassesClient({ classes, attendance, summary, participant }: MyClassesClientProps) {
  // Map attendance by class ID for quick lookup
  const attendanceMap = attendance.reduce((acc, curr) => {
    acc[curr.live_class_id] = curr;
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="page-header">
        <h1>My Live Classes</h1>
        <p>Access your scheduled live training sessions</p>
      </div>

      {!participant && (
        <div className="alert alert-warning">
          Your account is not linked to a participant profile. You must be registered as a participant to join classes.
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 text-center">
            <div className="text-sm text-muted">Total Classes</div>
            <div className="text-2xl font-bold">{summary.total}</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-sm text-muted">Present</div>
            <div className="text-2xl font-bold text-green-600">{summary.present}</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-sm text-muted">Late / Absent</div>
            <div className="text-2xl font-bold text-yellow-600">{summary.late} / {summary.absent}</div>
          </div>
          <div className="card p-4 text-center bg-blue-50 border-blue-100">
            <div className="text-sm text-blue-800 font-medium">Attendance Rate</div>
            <div className="text-2xl font-bold text-blue-900">{summary.rate}%</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {classes.length === 0 ? (
          <div className="card p-12 text-center text-muted">
            You do not have any upcoming live classes.
          </div>
        ) : classes.map((cls) => {
          const isLive = cls.status === "live";
          const isScheduled = cls.status === "scheduled";
          const att = attendanceMap[cls.id];
          
          return (
            <div key={cls.id} className={`card p-0 overflow-hidden flex flex-col md:flex-row ${isLive ? 'ring-2 ring-blue-500' : ''}`}>
              <div className={`w-full md:w-32 flex flex-col justify-center items-center p-4 ${isLive ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                <div className="text-sm font-medium uppercase tracking-widest opacity-80">
                  {new Date(cls.scheduled_start).toLocaleString('en-US', { month: 'short' })}
                </div>
                <div className="text-3xl font-bold">
                  {new Date(cls.scheduled_start).getDate()}
                </div>
                <div className="text-sm mt-1">
                  {new Date(cls.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold m-0 mb-1">{cls.title}</h3>
                    <div className="text-sm text-muted mb-2">{cls.programmes?.programme_name}</div>
                    <div className="flex items-center gap-4 text-sm mt-4">
                      <span className="flex items-center gap-1">
                        <span className="opacity-50">👤</span> {cls.trainers?.name || "TBA"}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="opacity-50">⏱</span> 
                        {Math.round((new Date(cls.scheduled_end).getTime() - new Date(cls.scheduled_start).getTime()) / 60000)} mins
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end gap-2">
                    {cls.status === "completed" ? (
                      <span className={`badge ${att?.attendance_status === 'present' ? 'badge-success' : 'badge-neutral'}`}>
                        {att?.attendance_status ? att.attendance_status.toUpperCase() : "ENDED"}
                      </span>
                    ) : cls.status === "cancelled" ? (
                      <span className="badge badge-danger">CANCELLED</span>
                    ) : (
                      <Link 
                        href={`/my-classes/${cls.id}`} 
                        className={`btn ${isLive ? "btn-primary animate-pulse shadow-lg" : "btn-outline"} min-w-[140px]`}
                      >
                        {isLive ? "JOIN NOW" : "View Details"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
