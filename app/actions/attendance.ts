"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSessionAttendance(sessionId: string) {
  const supabase = await createClient();
  
  // We need to fetch all participants registered for the EVENT this session belongs to,
  // and left join their attendance for THIS specific session.
  
  // First get the event_id for the session
  const { data: session } = await supabase
    .from("event_sessions")
    .select("event_id")
    .eq("id", sessionId)
    .single();
    
  if (!session) return { error: "Session not found" };

  // Get all registered participants for the event
  const { data: registrations, error: regError } = await supabase
    .from("event_participants")
    .select(`
      participant_id,
      participants (
        full_name
      )
    `)
    .eq("event_id", session.event_id)
    .eq("status", "registered");

  if (regError) return { error: regError.message };

  // Get all recorded attendance for this session
  const { data: attendanceRecords, error: attError } = await supabase
    .from("attendance")
    .select("*")
    .eq("session_id", sessionId);
    
  if (attError) return { error: attError.message };

  // Combine them
  const attendanceMap = new Map(attendanceRecords.map(a => [a.participant_id, a.status]));
  
  const formattedData = registrations.map(reg => {
    const participantObj = Array.isArray(reg.participants) ? reg.participants[0] : (reg.participants as any);
    return {
      participant_id: reg.participant_id,
      full_name: participantObj?.full_name || "Unknown",
      status: attendanceMap.get(reg.participant_id) || null // null means not recorded yet
    };
  });

  return { data: formattedData };
}

export async function markAttendance(sessionId: string, participantId: string, status: "present" | "late" | "absent" | "excused") {
  const supabase = await createClient();
  
  // Upsert the attendance record
  const { error } = await supabase
    .from("attendance")
    .upsert({
      session_id: sessionId,
      participant_id: participantId,
      status: status,
      recorded_at: new Date().toISOString()
    }, { onConflict: "session_id, participant_id" });

  if (error) {
    console.error("Error marking attendance:", error);
    return { error: error.message };
  }

  revalidatePath(`/sessions/${sessionId}/attendance`);
  return { success: true };
}
