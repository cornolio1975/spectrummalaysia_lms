"use server";

import { createClient } from "@/utils/supabase/server";

export async function getParticipants() {
  const supabase = await createClient();
  
  // Try rich query with enrolments first
  const { data, error } = await supabase
    .from("participants")
    .select(`
      *,
      states (state_name),
      nadi_sites (site_name),
      course_enrolments (
        id,
        status,
        progress_pct,
        enrolled_at,
        courses (id, title, course_code)
      )
    `)
    .order("created_at", { ascending: false });

  if (!error && data) {
    return { data };
  }

  // Fallback if joined relationship is restricted
  const fallback = await supabase
    .from("participants")
    .select(`
      *,
      states (state_name),
      nadi_sites (site_name)
    `)
    .order("created_at", { ascending: false });

  if (fallback.error) {
    return { error: fallback.error.message };
  }

  return { data: fallback.data };
}

export async function getParticipantById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function createParticipant(formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("participants")
    .insert([formData])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function updateParticipant(id: string, formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("participants")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}
