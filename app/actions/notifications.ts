"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUserNotifications() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return { data: [] };
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return { error: error.message };
  }

  return { data: data || [] };
}

export async function markNotificationAsRead(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function sendNotificationToUser(payload: {
  userId: string;
  title: string;
  message: string;
  link?: string;
  type?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .insert([{
      user_id: payload.userId,
      title: payload.title,
      message: payload.message,
      link: payload.link,
      type: payload.type || "system",
      is_read: false,
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}
