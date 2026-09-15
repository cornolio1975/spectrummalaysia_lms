"use client";

import { useState } from "react";
import { EventForm } from "@/components/forms/event-form";
import { deleteEvent } from "@/app/actions/events";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface EventsClientProps {
  events: any[];
  programmes: any[];
  nadiSites: any[];
}

export function EventsClient({ events, programmes, nadiSites }: EventsClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleOpenNew = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (event: any) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      await deleteEvent(id);
      router.refresh();
    }
  };

  const filteredEvents = events.filter((event) => {
    const searchString = `${event.programmes?.programme_name} ${event.nadi_sites?.nadi_name}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'registration_open': return 'badge-success';
      case 'in_progress': return 'badge-primary';
      case 'scheduled': return 'badge-info';
      case 'completed': return 'badge-neutral';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>Events</h1>
            <p>Manage programme instances and sessions</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenNew}>+ Schedule Event</button>
        </div>
      </div>
      
      <div className="page-body">
        <div className="card" style={{ padding: "0" }}>
          <div className="filter-bar" style={{ margin: 0, border: "none", borderBottom: "1px solid var(--border)", borderRadius: 0 }}>
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input 
                className="form-input" 
                placeholder="Search events by programme or NADI…" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>Programme</th>
                <th>Location (NADI)</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length > 0 ? filteredEvents.map((evt) => (
                <tr key={evt.id}>
                  <td style={{ fontWeight: 600 }}>{evt.programmes?.programme_name}</td>
                  <td>{evt.nadi_sites?.nadi_name}</td>
                  <td>
                    <div style={{ fontSize: "0.82rem" }}>
                      {new Date(evt.start_date).toLocaleDateString()} - {new Date(evt.end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td><span className={`badge ${getStatusBadge(evt.status)}`}>{evt.status.replace('_', ' ')}</span></td>
                  <td>{evt.capacity}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Link href={`/events/${evt.id}`} className="btn btn-outline btn-sm">Manage</Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleOpenEdit(evt)}>Edit</button>
                      <button className="btn btn-ghost btn-sm text-red-500" onClick={() => handleDelete(evt.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>No events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{editingEvent ? "Edit Event" : "Schedule Event"}</h2>
            <EventForm 
              initialData={editingEvent}
              programmes={programmes}
              nadiSites={nadiSites}
              onSuccess={() => setIsFormOpen(false)} 
              onCancel={() => setIsFormOpen(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
}
