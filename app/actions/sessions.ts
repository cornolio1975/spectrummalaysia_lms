"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { SessionFormData, sessionSchema } from "@/lib/validations/event";

export async function getSessions(eventId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("event_sessions")
    .select(`
      *,
      trainers (
        name
      )
    `)
    .eq("event_id", eventId)
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching sessions:", error);
    return { error: error.message };
  }

  return { data };
}

export async function createSession(eventId: string, formData: SessionFormData) {
  const parsed = sessionSchema.safeParse(formData);
  
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("event_sessions")
    .insert([{
      ...parsed.data,
      event_id: eventId,
      trainer_id: parsed.data.trainer_id || null
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating session:", error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}`);
  return { data };
}

export async function updateSession(eventId: string, sessionId: string, formData: SessionFormData) {
  const parsed = sessionSchema.safeParse(formData);
  
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("event_sessions")
    .update({
      ...parsed.data,
      trainer_id: parsed.data.trainer_id || null
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("Error updating session:", error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}`);
  return { data };
}

export async function deleteSession(eventId: string, sessionId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("event_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) {
    console.error("Error deleting session:", error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}
