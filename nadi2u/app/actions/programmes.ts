"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { ProgrammeFormData, programmeSchema } from "@/lib/validations/programme";

export async function getProgrammes() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("programmes")
    .select(`
      *,
      programme_modules (count)
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message || String(error) };
  }

  // Supabase returns count as an array of objects like { count: number }
  const formattedData = (data || []).map((prog: any) => ({
    ...prog,
    moduleCount: prog.programme_modules?.[0]?.count || 0
  }));

  return { data: formattedData };
}

export async function createProgramme(formData: ProgrammeFormData) {
  const parsed = programmeSchema.safeParse(formData);
  
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("programmes")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    console.error("Error creating programme:", error);
    return { error: error.message };
  }

  revalidatePath("/programmes");
  return { data };
}

export async function updateProgramme(id: string, formData: ProgrammeFormData) {
  const parsed = programmeSchema.safeParse(formData);
  
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("programmes")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating programme:", error);
    return { error: error.message };
  }

  revalidatePath("/programmes");
  return { data };
}

export async function deleteProgramme(id: string) {
  const supabase = await createClient();
  
  // Soft delete
  const { error } = await supabase
    .from("programmes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error deleting programme:", error);
    return { error: error.message };
  }

  revalidatePath("/programmes");
  return { success: true };
}
