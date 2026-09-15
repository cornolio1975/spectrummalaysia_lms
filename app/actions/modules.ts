"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { ModuleFormData, moduleSchema } from "@/lib/validations/curriculum";

export async function getProgrammeModules(programmeId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("programme_modules")
    .select(`
      *,
      lessons (*)
    `)
    .eq("programme_id", programmeId)
    .order("sort_order", { ascending: true })
    // Also order lessons by sort_order via postgrest if possible, but we'll sort in UI if needed
  ;

  if (error) {
    console.error("Error fetching modules:", error);
    return { error: error.message };
  }

  // Sort lessons within modules
  data?.forEach(module => {
    if (module.lessons) {
      module.lessons.sort((a: any, b: any) => a.sort_order - b.sort_order);
    }
  });

  return { data };
}

export async function createModule(programmeId: string, formData: ModuleFormData) {
  const parsed = moduleSchema.safeParse(formData);
  
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("programme_modules")
    .insert([{
      ...parsed.data,
      programme_id: programmeId
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating module:", error);
    return { error: error.message };
  }

  revalidatePath(`/programmes/${programmeId}`);
  return { data };
}

export async function updateModule(programmeId: string, moduleId: string, formData: ModuleFormData) {
  const parsed = moduleSchema.safeParse(formData);
  
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("programme_modules")
    .update(parsed.data)
    .eq("id", moduleId)
    .select()
    .single();

  if (error) {
    console.error("Error updating module:", error);
    return { error: error.message };
  }

  revalidatePath(`/programmes/${programmeId}`);
  return { data };
}

export async function deleteModule(programmeId: string, moduleId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("programme_modules")
    .delete()
    .eq("id", moduleId);

  if (error) {
    console.error("Error deleting module:", error);
    return { error: error.message };
  }

  revalidatePath(`/programmes/${programmeId}`);
  return { success: true };
}
