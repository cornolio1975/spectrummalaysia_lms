"use server";

import { createClient } from "@/utils/supabase/server";

export async function updateOwnPassword(newPassword: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("Failed to update password:", error);
    return { error: error.message };
  }

  return { success: true };
}
