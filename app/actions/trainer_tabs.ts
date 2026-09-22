"use server";

import { createClient } from "@/utils/supabase/server";

export async function getTrainerProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trainers").select("*").order("created_at", { ascending: false });
  return { data, error: error?.message };
}

export async function getTrainerCredentials() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trainer_credentials").select("*, trainers(id, name)").order("created_at", { ascending: false });
  return { data, error: error?.message };
}

export async function getTrainerDocuments() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trainer_documents").select("*, trainers(id, name)").order("created_at", { ascending: false });
  return { data, error: error?.message };
}

export async function getTrainerAuditLogs() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trainer_audit_logs").select("*, trainers(id, name)").order("created_at", { ascending: false });
  return { data, error: error?.message };
}

export async function getTrainerAttendance() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trainer_attendance").select("*, trainers(id, name)").order("created_at", { ascending: false });
  return { data, error: error?.message };
}
