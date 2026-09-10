"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSystemSettings() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("system_settings")
    .select("*")
    .order("category")
    .order("setting_key");

  if (error) {
    console.error("Error fetching settings:", error);
    return { error: error.message };
  }

  return { data };
}

export async function updateSystemSetting(id: string, setting_value: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("system_settings")
    .update({ setting_value })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating setting:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/settings");
  return { data };
}
