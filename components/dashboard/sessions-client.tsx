"use client";

import { useState } from "react";
import { SessionForm } from "@/components/forms/session-form";
import { deleteSession } from "@/app/actions/sessions";
import { useRouter } from "next/navigation";

interface SessionsClientProps {
  eventId: string;
  sessions: any[];
  trainers: any[];
}

export function SessionsClient({ eventId, sessions, trainers }: SessionsClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any | null>(null);
  const router = useRouter();

  const handleOpenNew = () => {
    setEditingSession(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (session: any) => {
    setEditingSession(session);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this session?")) {
      await deleteSession(eventId, id);
      router.refresh();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress': return 'badge-success';
      case 'scheduled': return 'badge-info';
      case 'completed': return 'badge-neutral';
      case 'cancelled': return 'badge-danger';
      case 'draft': return 'badge-warning';
      default: return 'badge-neutral';
    }
  };

  return (
    <>
      <div className="card mt-6" style={{ padding: "0" }}>
        <div className="filter-bar" style={{ display: "flex", justifyContent: "space-between", margin: 0, border: "none", borderBottom: "1px solid var(--border)", borderRadius: 0 }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", padding: "10px" }}>Event Sessions</h3>
          <button className="btn btn-outline btn-sm" onClick={handleOpenNew} style={{ margin: "10px" }}>+ Add Session</button>
        </div>
        
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Session Name</th>
              <th>Trainer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length > 0 ? sessions.map((session) => (
              <tr key={session.id}>
                <td style={{ fontWeight: 500 }}>{new Date(session.session_date).toLocaleDateString()}</td>
                <td>{session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}</td>
                <td>{session.session_name}</td>
                <td>{session.trainers?.name || "-"}</td>
                <td><span className={`badge ${getStatusBadge(session.status)}`}>{session.status.replace('_', ' ')}</span></td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button className="btn btn-outline btn-sm" onClick={() => router.push(`/events/sessions/${session.id}/attendance`)}>Attendance</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEdit(session)}>Edit</button>
                    <button className="btn btn-ghost btn-sm text-red-500" onClick={() => handleDelete(session.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>No sessions found for this event.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{editingSession ? "Edit Session" : "Add Session"}</h2>
            <SessionForm 
              eventId={eventId}
              initialData={editingSession}
              trainers={trainers}
              onSuccess={() => setIsFormOpen(false)} 
              onCancel={() => setIsFormOpen(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
}
