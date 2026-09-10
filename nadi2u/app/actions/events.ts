"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { EventFormData, eventSchema } from "@/lib/validations/event";

export async function getEvents() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      programmes (programme_name, programme_code),
      nadi_sites (nadi_name)
    `)
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching events:", error);
    return { error: error.message };
  }

  return { data };
}

export async function getEventById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("events")
    .select(`
      *,
      programmes (programme_name, programme_code),
      nadi_sites (nadi_name)
    `)
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function createEvent(formData: EventFormData) {
  const parsed = eventSchema.safeParse(formData);
  
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("events")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    console.error("Error creating event:", error);
    return { error: error.message };
  }

  revalidatePath("/events");
  return { data };
}

export async function updateEvent(id: string, formData: EventFormData) {
  const parsed = eventSchema.safeParse(formData);
  
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("events")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating event:", error);
    return { error: error.message };
  }

  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  return { data };
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting event:", error);
    return { error: error.message };
  }

  revalidatePath("/events");
  return { success: true };
}
