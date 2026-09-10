"use server";

import { createClient } from "@/utils/supabase/server";

export async function getTrainers() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("trainers")
    .select(`
      id,
      name
    `)
    .eq("status", "active");

  if (error) {
    return { error: error.message };
  }

  return { data };
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
