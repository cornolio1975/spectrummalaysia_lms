import { getEventById } from "@/app/actions/events";
import { getSessions } from "@/app/actions/sessions";
import { getTrainers } from "@/app/actions/trainers";
import { SessionsClient } from "@/components/dashboard/sessions-client";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params object in Next.js 15+
  const { id } = await params;

  const [eventRes, sessionsRes, trainersRes] = await Promise.all([
    getEventById(id),
    getSessions(id),
    getTrainers()
  ]);

  if (eventRes.error || !eventRes.data) {
    notFound();
  }

  const event = eventRes.data;
  const sessions = sessionsRes.data || [];
  const trainers = trainersRes.data || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/events" className="text-sm text-primary-500 hover:underline mb-2 inline-block">← Back to Events</Link>
          <h1>{event.programmes?.programme_name}</h1>
          <p>
            {event.nadi_sites?.nadi_name} • {new Date(event.start_date).toLocaleDateString()} to {new Date(event.end_date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="page-body">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Event Status</h3>
            <div className="text-lg font-medium">{event.status.replace('_', ' ').toUpperCase()}</div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Capacity</h3>
            <div className="text-lg font-medium">{event.capacity} participants max</div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Sessions</h3>
            <div className="text-lg font-medium">{sessions.length} scheduled</div>
          </div>
        </div>

        <SessionsClient eventId={id} sessions={sessions} trainers={trainers} />
      </div>
    </div>
  );
}
