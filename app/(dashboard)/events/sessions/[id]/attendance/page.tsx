import { getSessionAttendance } from "@/app/actions/attendance";
import { createClient } from "@/utils/supabase/server";
import { AttendanceClient } from "@/components/dashboard/attendance-client";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Get session details
  const { data: session } = await supabase
    .from("event_sessions")
    .select("*, event_id, events (programmes(programme_name))")
    .eq("id", id)
    .single();

  if (!session) {
    notFound();
  }

  const { data: attendanceData, error } = await getSessionAttendance(id);

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading attendance: {error}
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <Link href={`/events/${session.event_id}`} className="text-sm text-primary-500 hover:underline mb-2 inline-block">
            ← Back to Event
          </Link>
          <h1>Attendance: {session.session_name}</h1>
          <p>
            {session.events?.programmes?.programme_name} • {new Date(session.session_date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="page-body">
        <div className="card max-w-4xl">
          <AttendanceClient sessionId={id} initialData={attendanceData || []} />
        </div>
      </div>
    </>
  );
}
