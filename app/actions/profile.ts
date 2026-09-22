"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function updateLearnerProfile(
  userId: string,
  participantId: string | null,
  formData: {
    full_name?: string;
    phone?: string;
    ic_number?: string;
    gender?: string;
    organization?: string;
  }
) {
  const supabase = await createClient();

  // Update profiles table
  if (formData.full_name) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: formData.full_name })
      .eq("id", userId);

    if (profileError) return { error: profileError.message };
  }

  // Update participants table if participantId exists
  if (participantId) {
    const participantData: any = {};
    if (formData.phone !== undefined) participantData.phone = formData.phone;
    if (formData.ic_number !== undefined) participantData.ic_number = formData.ic_number;
    if (formData.gender !== undefined) participantData.gender = formData.gender;
    if (formData.organization !== undefined) participantData.organization = formData.organization;

    if (Object.keys(participantData).length > 0) {
      const { error: participantError } = await supabase
        .from("participants")
        .update(participantData)
        .eq("id", participantId);

      if (participantError) return { error: participantError.message };
    }
  }

  revalidatePath("/learner-workspace/profile");
  return { success: true };
}
