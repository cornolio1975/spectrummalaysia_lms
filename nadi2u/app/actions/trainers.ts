"use server";

import { createClient } from "@/utils/supabase/server";

export async function getTrainers() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("trainers")
    .select(`
      id,
      profiles (full_name)
    `)
    .eq("status", "active");

  if (error) {
    console.error("Error fetching trainers:", error);
    return { error: error.message };
  }

  return { data };
}
