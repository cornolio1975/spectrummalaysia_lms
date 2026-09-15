"use server";

import { createClient } from "@/utils/supabase/server";
import { createGoogleMeet, updateGoogleMeet, cancelGoogleMeet } from "@/services/google/google-meet.service";
import { createAuditLog } from "@/app/actions/audit";
import { revalidatePath } from "next/cache";

export interface LiveClassFilters {
  programme_id?: string;
  state_id?: string;
  nadi_id?: string;
  trainer_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── READ ───────────────────────────────────────────────────────────────────

export async function getLiveClasses(filters: LiveClassFilters = {}) {
  const supabase = await createClient();
  const { page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("live_classes")
    .select(`
      *,
      programmes(programme_name, programme_code),
      programme_modules(title),
      nadi_sites(nadi_name, nadi_code),
      states(state_name),
      trainers(name, email)
    `, { count: "exact" })
    .order("scheduled_start", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.programme_id) query = query.eq("programme_id", filters.programme_id);
  if (filters.state_id) query = query.eq("state_id", filters.state_id);
  if (filters.nadi_id) query = query.eq("nadi_id", filters.nadi_id);
  if (filters.trainer_id) query = query.eq("trainer_id", filters.trainer_id);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.date_from) query = query.gte("scheduled_start", filters.date_from);
  if (filters.date_to) query = query.lte("scheduled_start", filters.date_to);

  const { data, error, count } = await query;
  if (error) return { error: error.message };
  return { data, count, page, limit };
}

export async function getLiveClassById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("live_classes")
    .select(`
      *,
      programmes(programme_name, programme_code, certificate_enabled),
      programme_modules(title, sort_order),
      nadi_sites(nadi_name, nadi_code, address),
      states(state_name, state_code),
      trainers(id, name, email, specialization),
      trainer_google_accounts(google_email, google_account_status)
    `)
    .eq("id", id)
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function getLiveClassesForTrainer(trainerId: string) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("live_classes")
    .select(`*, programmes(programme_name), nadi_sites(nadi_name)`)
    .eq("trainer_id", trainerId)
    .not("status", "eq", "cancelled")
    .order("scheduled_start", { ascending: true });

  if (error) return { error: error.message };
  return { data };
}

export async function getUpcomingLiveClasses(limit = 5) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("live_classes")
    .select(`*, programmes(programme_name), trainers(name), nadi_sites(nadi_name)`)
    .in("status", ["scheduled", "live"])
    .gte("scheduled_start", now)
    .order("scheduled_start", { ascending: true })
    .limit(limit);

  if (error) return { error: error.message };
  return { data };
}

export async function getTodayLiveClasses() {
  const supabase = await createClient();
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const { data, error } = await supabase
    .from("live_classes")
    .select(`*, programmes(programme_name), trainers(name), nadi_sites(nadi_name)`)
    .not("status", "eq", "cancelled")
    .gte("scheduled_start", start)
    .lt("scheduled_start", end)
    .order("scheduled_start", { ascending: true });

  if (error) return { error: error.message };
  return { data };
}

// ─── CREATE ─────────────────────────────────────────────────────────────────

export async function createLiveClass(formData: {
  programme_id: string;
  module_id?: string;
  nadi_id?: string;
  state_id?: string;
  trainer_id: string;
  title: string;
  description?: string;
  scheduled_start: string;
  scheduled_end: string;
  timezone?: string;
  max_participants?: number;
  schedule_now?: boolean; // if true, attempt Meet creation immediately
}) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return { error: "Not authenticated" };

  // Insert the class record first (always works even without Google)
  const { data: liveClass, error: insertError } = await supabase
    .from("live_classes")
    .insert([{
      programme_id: formData.programme_id,
      module_id: formData.module_id || null,
      nadi_id: formData.nadi_id || null,
      state_id: formData.state_id || null,
      trainer_id: formData.trainer_id,
      title: formData.title,
      description: formData.description || null,
      scheduled_start: formData.scheduled_start,
      scheduled_end: formData.scheduled_end,
      timezone: formData.timezone || "Asia/Kuala_Lumpur",
      max_participants: formData.max_participants || null,
      status: formData.schedule_now ? "scheduled" : "draft",
      meet_sync_status: "pending",
      created_by: authData.user.id,
    }])
    .select()
    .single();

  if (insertError) return { error: insertError.message };

  await createAuditLog("LIVE_CLASS_CREATED", "live_classes", liveClass.id, formData.title);

  // Attempt Google Meet creation if scheduling now
  if (formData.schedule_now) {
    const meetResult = await _createMeetForClass(liveClass.id, liveClass);
    revalidatePath("/live-classes");
    return { data: liveClass, meetResult };
  }

  revalidatePath("/live-classes");
  return { data: liveClass };
}

// ─── UPDATE ─────────────────────────────────────────────────────────────────

export async function updateLiveClass(id: string, updates: Partial<{
  title: string;
  description: string;
  scheduled_start: string;
  scheduled_end: string;
  max_participants: number;
  nadi_id: string;
  state_id: string;
  trainer_id: string;
  module_id: string;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("live_classes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  // If Google is connected and event exists, sync the update
  if (data.google_event_id && data.google_calendar_id) {
    await updateGoogleMeet({
      eventId: data.google_event_id,
      calendarId: data.google_calendar_id,
      title: data.title,
      description: data.description,
      startIso: data.scheduled_start,
      endIso: data.scheduled_end,
      timezone: data.timezone,
    });
  }

  await createAuditLog("LIVE_CLASS_UPDATED", "live_classes", id);
  revalidatePath("/live-classes");
  revalidatePath(`/live-classes/${id}`);
  return { data };
}

// ─── STATUS TRANSITIONS ──────────────────────────────────────────────────────

export async function scheduleLiveClass(id: string) {
  const supabase = await createClient();

  // Get current class
  const { data: current, error: fetchError } = await supabase
    .from("live_classes")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !current) return { error: "Class not found" };
  if (current.status !== "draft") return { error: `Cannot schedule a class in '${current.status}' status` };

  // Update status
  const { data, error } = await supabase
    .from("live_classes")
    .update({ status: "scheduled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  // Attempt Google Meet creation (graceful fallback if not configured)
  const meetResult = await _createMeetForClass(id, current);

  await createAuditLog("LIVE_CLASS_SCHEDULED", "live_classes", id);
  revalidatePath("/live-classes");
  revalidatePath(`/live-classes/${id}`);
  return { data, meetResult };
}

export async function startLiveClass(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("live_classes")
    .update({ status: "live", updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["scheduled"]) // guard
    .select()
    .single();

  if (error) return { error: error.message };
  await createAuditLog("LIVE_CLASS_STARTED", "live_classes", id);
  revalidatePath("/live-classes");
  return { data };
}

export async function completeLiveClass(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("live_classes")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", id)
    .in("status", ["live", "scheduled"])
    .select()
    .single();

  if (error) return { error: error.message };
  await createAuditLog("LIVE_CLASS_COMPLETED", "live_classes", id);
  revalidatePath("/live-classes");
  return { data };
}

export async function cancelLiveClass(id: string, reason: string) {
  const supabase = await createClient();

  // Get current class to cancel Google event if exists
  const { data: current } = await supabase
    .from("live_classes")
    .select("google_event_id, google_calendar_id")
    .eq("id", id)
    .single();

  if (current?.google_event_id && current?.google_calendar_id) {
    await cancelGoogleMeet(current.google_event_id, current.google_calendar_id);
  }

  const { data, error } = await supabase
    .from("live_classes")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", id)
    .not("status", "eq", "completed") // cannot cancel completed
    .select()
    .single();

  if (error) return { error: error.message };
  await createAuditLog("LIVE_CLASS_CANCELLED", "live_classes", id, reason);
  revalidatePath("/live-classes");
  return { data };
}

export async function retryMeetCreation(id: string) {
  const supabase = await createClient();
  const { data: current, error } = await supabase
    .from("live_classes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !current) return { error: "Class not found" };
  if (current.google_meet_url) return { error: "Meet link already exists for this class" };

  const meetResult = await _createMeetForClass(id, current);
  return { meetResult };
}

export async function getLiveClassStats() {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const today = new Date();
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const [total, todayCount, liveNow] = await Promise.all([
    supabase.from("live_classes").select("*", { count: "exact", head: true }).not("status", "eq", "cancelled"),
    supabase.from("live_classes").select("*", { count: "exact", head: true }).gte("scheduled_start", dayStart).lt("scheduled_start", dayEnd).not("status", "eq", "cancelled"),
    supabase.from("live_classes").select("*", { count: "exact", head: true }).eq("status", "live"),
  ]);

  return {
    totalClasses: total.count || 0,
    todayClasses: todayCount.count || 0,
    liveNow: liveNow.count || 0,
  };
}

// ─── INTERNAL HELPER ─────────────────────────────────────────────────────────

async function _createMeetForClass(classId: string, classData: any) {
  const supabase = await createClient();

  // Mark as pending
  await supabase.from("live_classes").update({ meet_sync_status: "pending" }).eq("id", classId);

  const meetResult = await createGoogleMeet({
    title: classData.title,
    description: classData.description,
    startIso: classData.scheduled_start,
    endIso: classData.scheduled_end,
    timezone: classData.timezone,
  });

  if (meetResult.success) {
    await supabase.from("live_classes").update({
      google_meet_url: meetResult.meetUrl,
      google_meet_code: meetResult.meetCode,
      google_event_id: meetResult.eventId,
      google_calendar_id: meetResult.calendarId,
      meet_sync_status: "synced",
      last_synced_at: new Date().toISOString(),
      meet_sync_error: null,
    }).eq("id", classId);

    await createAuditLog("MEET_CREATED", "live_classes", classId);
  } else {
    // Graceful failure — class stays saved, meet is pending
    await supabase.from("live_classes").update({
      meet_sync_status: "waiting_for_meet",
      meet_sync_error: meetResult.error,
      meet_sync_retries: (classData.meet_sync_retries || 0) + 1,
    }).eq("id", classId);
  }

  return meetResult;
}
