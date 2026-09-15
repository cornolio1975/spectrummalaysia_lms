"use server";

import { checkGoogleHealth } from "@/services/google/google-meet.service";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getGoogleIntegrationHealth() {
  const health = await checkGoogleHealth();
  const supabase = await createClient();

  // Get sync stats
  const [pending, failed] = await Promise.all([
    supabase.from("live_classes").select("*", { count: "exact", head: true }).eq("meet_sync_status", "pending"),
    supabase.from("live_classes").select("*", { count: "exact", head: true }).eq("meet_sync_status", "failed"),
  ]);

  return {
    health,
    pendingSyncs: pending.count || 0,
    failedSyncs: failed.count || 0,
  };
}

export async function testGoogleConnection() {
  const health = await checkGoogleHealth();
  return health;
}

export async function getTrainerGoogleStatus(trainerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainer_google_accounts")
    .select("*")
    .eq("trainer_id", trainerId)
    .single();

  return { data, error: error?.message };
}

export async function saveTrainerGoogleAccount(trainerId: string, googleEmail: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainer_google_accounts")
    .upsert([{
      trainer_id: trainerId,
      google_email: googleEmail,
      google_account_status: "connected",
      last_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }], { onConflict: "trainer_id" })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/google");
  return { data };
}

export async function disconnectTrainerGoogleAccount(trainerId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("trainer_google_accounts")
    .update({
      google_account_status: "disconnected",
      google_refresh_token: null,
      updated_at: new Date().toISOString(),
    })
    .eq("trainer_id", trainerId);

  if (error) return { error: error.message };
  revalidatePath("/admin/google");
  return { success: true };
}

export async function retryFailedMeetSyncs() {
  const supabase = await createClient();
  const { data: failedClasses } = await supabase
    .from("live_classes")
    .select("id, title, scheduled_start, scheduled_end, timezone, description")
    .eq("meet_sync_status", "waiting_for_meet")
    .lt("meet_sync_retries", 5); // max 5 retries

  if (!failedClasses?.length) return { synced: 0 };

  const { retryMeetCreation } = await import("@/app/actions/live-classes");
  let synced = 0;
  for (const cls of failedClasses) {
    const result = await retryMeetCreation(cls.id);
    if (result.meetResult?.success) synced++;
  }

  revalidatePath("/admin/google");
  revalidatePath("/live-classes");
  return { synced, attempted: failedClasses.length };
}
