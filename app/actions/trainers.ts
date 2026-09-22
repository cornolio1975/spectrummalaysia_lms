"use server";

import { createClient } from "@/utils/supabase/server";

export async function getTrainers() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trainers").select("id, name").eq("status", "active");
  if (error) return { error: error.message };
  return { data };
}

export async function getAllTrainers(statusFilter?: string) {
  const supabase = await createClient();
  let query = supabase.from("trainers").select("*").order("created_at", { ascending: false });
  
  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }
  
  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data };
}

export async function getTrainerStats() {
  const supabase = await createClient();
  const { data: trainers, error } = await supabase.from("trainers").select("id, status");
  
  if (error) return { error: error.message };
  
  // Count assigned trainers
  const { count: courseAssigned } = await supabase
    .from("trainer_course_assignments")
    .select("*", { count: 'exact', head: true })
    .eq('status', 'active');
    
  const { count: nadiAssigned } = await supabase
    .from("trainer_nadi_assignments")
    .select("*", { count: 'exact', head: true })
    .eq('status', 'active');

  // Count expiring credentials (e.g. expiring in next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const { count: expiringCredentials } = await supabase
    .from("trainer_credentials")
    .select("*", { count: 'exact', head: true })
    .lte('expiry_date', thirtyDaysFromNow.toISOString())
    .gte('expiry_date', new Date().toISOString());
  
  const stats = {
    total: trainers.length,
    active: trainers.filter(t => t.status === 'active').length,
    pending: trainers.filter(t => t.status === 'pending').length,
    inactive: trainers.filter(t => t.status === 'inactive').length,
    suspended: trainers.filter(t => t.status === 'suspended').length,
    assignedToCourses: courseAssigned || 0,
    assignedToNadi: nadiAssigned || 0,
    expiringCredentials: expiringCredentials || 0,
  };
  
  return { data: stats };
}

export async function updateTrainerStatus(id: string, newStatus: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trainers").update({ status: newStatus }).eq("id", id).select().single();
  return { data, error: error?.message };
}

export async function getTrainerApplications() {
  // For now, applications are just trainers with status 'pending'
  return getAllTrainers('pending');
}

export async function getTrainerById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trainers").select("*").eq("id", id).single();
  return { data, error: error?.message };
}

export async function createTrainer(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trainers").insert([formData]).select().single();
  return { data, error: error?.message };
}

export async function updateTrainer(id: string, formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trainers").update(formData).eq("id", id).select().single();
  return { data, error: error?.message };
}

// -----------------------------------------
// ASSIGNMENTS
// -----------------------------------------
export async function getTrainerNadiAssignments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainer_nadi_assignments")
    .select("*, trainers(id, name), nadi_sites(id, site_name), states(id, state_name)")
    .order("created_at", { ascending: false });
  return { data, error: error?.message };
}

export async function createNadiAssignment(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trainer_nadi_assignments").insert([formData]).select().single();
  return { data, error: error?.message };
}

export async function getTrainerCourseAssignments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trainer_course_assignments")
    .select("*, trainers(id, name), programmes(id, programme_name), courses(id, title), nadi_sites(id, site_name)")
    .order("created_at", { ascending: false });
  return { data, error: error?.message };
}

export async function createCourseAssignment(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("trainer_course_assignments").insert([formData]).select().single();
  return { data, error: error?.message };
}
