"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { LessonFormData, lessonSchema } from "@/lib/validations/curriculum";

export async function createLesson(programmeId: string, moduleId: string, formData: LessonFormData) {
  const parsed = lessonSchema.safeParse(formData);
  
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("lessons")
    .insert([{
      ...parsed.data,
      module_id: moduleId
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating lesson:", error);
    return { error: error.message };
  }

  revalidatePath(`/programmes/${programmeId}`);
  return { data };
}

export async function updateLesson(programmeId: string, lessonId: string, formData: LessonFormData) {
  const parsed = lessonSchema.safeParse(formData);
  
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("lessons")
    .update(parsed.data)
    .eq("id", lessonId)
    .select()
    .single();

  if (error) {
    console.error("Error updating lesson:", error);
    return { error: error.message };
  }

  revalidatePath(`/programmes/${programmeId}`);
  return { data };
}

export async function deleteLesson(programmeId: string, lessonId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", lessonId);

  if (error) {
    console.error("Error deleting lesson:", error);
    return { error: error.message };
  }

  revalidatePath(`/programmes/${programmeId}`);
  return { success: true };
}
