"use server";

import { createClient } from "@/utils/supabase/server";
import { createAuditLog } from "@/app/actions/audit";
import { revalidatePath } from "next/cache";

// ─── JOIN CLICK LOGGING ──────────────────────────────────────────────────────

export async function recordJoinClick(
  liveClassId: string,
  participantId: string,
  metadata: { device?: string; browser?: string; userAgent?: string; ip?: string }
) {
  const supabase = await createClient();

  // Log every click (join log is append-only)
  await supabase.from("live_class_join_log").insert([{
    live_class_id: liveClassId,
    participant_id: participantId,
    device_info: metadata.device || null,
    browser_info: metadata.browser || null,
    user_agent: metadata.userAgent || null,
    ip_address: metadata.ip || null,
  }]);

  // Upsert attendance record — set join_clicked_at if first click
  const { data: existing } = await supabase
    .from("live_class_attendance")
    .select("id, join_clicked_at, attendance_status")
    .eq("live_class_id", liveClassId)
    .eq("participant_id", participantId)
    .single();

  if (existing) {
    // Only update first_join_at if not already set
    if (!existing.join_clicked_at) {
      await supabase.from("live_class_attendance")
        .update({
          join_clicked_at: new Date().toISOString(),
          first_join_at: new Date().toISOString(),
          attendance_source: "system",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    }
  } else {
    await supabase.from("live_class_attendance").insert([{
      live_class_id: liveClassId,
      participant_id: participantId,
      join_clicked_at: new Date().toISOString(),
      first_join_at: new Date().toISOString(),
      attendance_status: "unknown",
      attendance_source: "system",
    }]);
  }

  await createAuditLog("PARTICIPANT_JOIN_CLICKED", "live_classes", liveClassId);
  return { success: true };
}

// ─── READ ATTENDANCE ─────────────────────────────────────────────────────────

export async function getLiveClassAttendance(liveClassId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("live_class_attendance")
    .select(`
      *,
      participants(id, full_name, ic_number, phone)
    `)
    .eq("live_class_id", liveClassId)
    .order("created_at", { ascending: true });

  if (error) return { error: error.message };
  return { data };
}

export async function getParticipantAttendanceSummary(participantId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("live_class_attendance")
    .select(`
      *,
      live_classes(id, title, scheduled_start, scheduled_end, programmes(programme_name))
    `)
    .eq("participant_id", participantId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  const total = data?.length || 0;
  const present = data?.filter(r => r.attendance_status === "present").length || 0;
  const late = data?.filter(r => r.attendance_status === "late").length || 0;
  const absent = data?.filter(r => r.attendance_status === "absent").length || 0;
  const excused = data?.filter(r => r.attendance_status === "excused").length || 0;
  const rate = total > 0 ? (((present + late) / total) * 100).toFixed(1) : "0.0";

  return { data, summary: { total, present, late, absent, excused, rate } };
}

// ─── MANUAL ATTENDANCE OVERRIDE ──────────────────────────────────────────────

export async function updateAttendanceManually(
  attendanceId: string,
  status: "present" | "late" | "absent" | "excused" | "unknown",
  reason: string
) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Not authenticated" };

  const { data: current } = await supabase
    .from("live_class_attendance")
    .select("attendance_status, live_class_id, participant_id")
    .eq("id", attendanceId)
    .single();

  const { data, error } = await supabase
    .from("live_class_attendance")
    .update({
      attendance_status: status,
      attendance_source: "manual",
      marked_by: userData.user.id,
      override_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", attendanceId)
    .select()
    .single();

  if (error) return { error: error.message };

  await createAuditLog(
    "ATTENDANCE_MANUALLY_UPDATED",
    "live_class_attendance",
    attendanceId,
    `Changed from ${current?.attendance_status} to ${status}. Reason: ${reason}`
  );

  revalidatePath(`/live-classes/${current?.live_class_id}/manage`);
  return { data };
}

// ─── BULK ATTENDANCE SAVE ────────────────────────────────────────────────────

export async function bulkSaveAttendance(
  liveClassId: string,
  records: Array<{
    participant_id: string;
    attendance_status: "present" | "late" | "absent" | "excused";
    duration_minutes?: number;
  }>
) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Not authenticated" };

  const upserts = records.map(r => ({
    live_class_id: liveClassId,
    participant_id: r.participant_id,
    attendance_status: r.attendance_status,
    duration_minutes: r.duration_minutes || null,
    attendance_source: "manual" as const,
    marked_by: userData.user.id,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("live_class_attendance")
    .upsert(upserts, { onConflict: "live_class_id,participant_id" });

  if (error) return { error: error.message };

  await createAuditLog("ATTENDANCE_SYNCED", "live_classes", liveClassId, `Bulk saved ${records.length} attendance records`);
  revalidatePath(`/live-classes/${liveClassId}/manage`);
  return { success: true };
}

// ─── AUTO-CALCULATE ATTENDANCE ───────────────────────────────────────────────

export async function calculateAttendanceStatus(
  joinAt: string | null,
  leaveAt: string | null,
  classStart: string,
  classEnd: string,
  lateThresholdMin = 15,
  minDurationPct = 70
): Promise<"present" | "late" | "absent" | "unknown"> {
  if (!joinAt) return "absent";

  const join = new Date(joinAt).getTime();
  const leave = leaveAt ? new Date(leaveAt).getTime() : new Date(classEnd).getTime();
  const start = new Date(classStart).getTime();
  const end = new Date(classEnd).getTime();
  const classDurationMs = end - start;
  const attendedMs = Math.max(0, leave - join);
  const attendancePct = (attendedMs / classDurationMs) * 100;
  const lateByMs = join - start;
  const lateByMin = lateByMs / 60000;

  if (attendancePct < minDurationPct) return "absent";
  if (lateByMin > lateThresholdMin) return "late";
  return "present";
}

// ─── LIVE CLASS REPORT DATA ──────────────────────────────────────────────────

export async function getLiveTrainingReport(filters: {
  programme_id?: string;
  state_id?: string;
  nadi_id?: string;
  trainer_id?: string;
  date_from?: string;
  date_to?: string;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("live_classes")
    .select(`
      id, title, scheduled_start, scheduled_end,
      programmes(programme_name),
      trainers(name),
      nadi_sites(nadi_name),
      states(state_name),
      live_class_attendance(attendance_status)
    `)
    .eq("status", "completed")
    .order("scheduled_start", { ascending: false });

  if (filters.programme_id) query = query.eq("programme_id", filters.programme_id);
  if (filters.state_id) query = query.eq("state_id", filters.state_id);
  if (filters.nadi_id) query = query.eq("nadi_id", filters.nadi_id);
  if (filters.trainer_id) query = query.eq("trainer_id", filters.trainer_id);
  if (filters.date_from) query = query.gte("scheduled_start", filters.date_from);
  if (filters.date_to) query = query.lte("scheduled_start", filters.date_to);

  const { data, error } = await query;
  if (error) return { error: error.message };

  // Aggregate attendance counts per class
  const report = (data || []).map((cls: any) => {
    const att = cls.live_class_attendance || [];
    const total = att.length;
    const present = att.filter((a: any) => a.attendance_status === "present").length;
    const late = att.filter((a: any) => a.attendance_status === "late").length;
    const absent = att.filter((a: any) => a.attendance_status === "absent").length;
    const rate = total > 0 ? (((present + late) / total) * 100).toFixed(1) : "—";
    const classDuration = cls.scheduled_end
      ? Math.round((new Date(cls.scheduled_end).getTime() - new Date(cls.scheduled_start).getTime()) / 60000)
      : 0;

    return {
      id: cls.id,
      date: cls.scheduled_start,
      title: cls.title,
      programme: cls.programmes?.programme_name || "—",
      trainer: cls.trainers?.name || "—",
      nadi: cls.nadi_sites?.nadi_name || "—",
      state: cls.states?.state_name || "—",
      total,
      present,
      late,
      absent,
      rate,
      duration_min: classDuration,
    };
  });

  return { data: report };
}
