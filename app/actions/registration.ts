"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getEventRegistrations(eventId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("event_participants")
    .select(`
      id,
      status,
      created_at,
      participants (
        id,
        full_name,
        phone,
        email
      )
    `)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching registrations:", error);
    return { error: error.message };
  }

  return { data };
}

export async function registerParticipant(eventId: string, participantId: string) {
  const supabase = await createClient();
  
  // Check if already registered
  const { data: existing } = await supabase
    .from("event_participants")
    .select("id")
    .eq("event_id", eventId)
    .eq("participant_id", participantId)
    .single();

  if (existing) {
    return { error: "Participant is already registered for this event." };
  }

  const { data, error } = await supabase
    .from("event_participants")
    .insert([{
      event_id: eventId,
      participant_id: participantId,
      status: "registered"
    }])
    .select()
    .single();

  if (error) {
    console.error("Error registering participant:", error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/registration`);
  return { data };
}

export async function removeRegistration(registrationId: string, eventId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("event_participants")
    .delete()
    .eq("id", registrationId);

  if (error) {
    console.error("Error removing registration:", error);
    return { error: error.message };
  }

  revalidatePath(`/events/${eventId}/registration`);
  return { success: true };
}
