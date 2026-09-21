"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { NadiFormData, nadiSchema } from "@/lib/validations/nadi";

export async function getNadiSites() {
  const supabase = await createClient();
  
  let allSites: any[] = [];
  let from = 0;
  const step = 1000;

  while (true) {
    const { data, error } = await supabase
      .from("nadi_sites")
      .select(`
        *,
        states (
          state_name
        )
      `)
      .order("site_name")
      .range(from, from + step - 1);

    if (error) {
      console.error("Error fetching NADI sites:", error);
      return { error: error.message };
    }

    if (!data || data.length === 0) break;
    
    allSites = [...allSites, ...data];
    
    if (data.length < step) break;
    from += step;
  }

  return { data: allSites };
}

export async function getStates() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("states")
    .select("*")
    .order("state_name");

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function createNadiSite(formData: NadiFormData) {
  const parsed = nadiSchema.safeParse(formData);
  
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("nadi_sites")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    console.error("Error creating NADI site:", error);
    return { error: error.message };
  }

  revalidatePath("/nadi");
  return { data };
}

export async function updateNadiSite(id: string, formData: NadiFormData) {
  const parsed = nadiSchema.safeParse(formData);
  
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("nadi_sites")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating NADI site:", error);
    return { error: error.message };
  }

  revalidatePath("/nadi");
  return { data };
}

export async function deleteNadiSite(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("nadi_sites")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting NADI site:", error);
    return { error: error.message };
  }

  revalidatePath("/nadi");
  return { success: true };
}
