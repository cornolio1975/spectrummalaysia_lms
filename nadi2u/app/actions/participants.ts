"use server";

import { createClient } from "@/utils/supabase/server";

export async function getParticipants() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("participants")
    .select(`
      *,
      states (state_name),
      nadi_sites (nadi_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data };
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
