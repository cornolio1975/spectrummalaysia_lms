"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function markLessonComplete(participantId: string, lessonId: string) {
  const supabase = await createClient();
  
  // Upsert the learning progress record
  const { data, error } = await supabase
    .from("learning_progress")
    .upsert({
      participant_id: participantId,
      lesson_id: lessonId,
      status: "completed",
      completed_at: new Date().toISOString()
    }, { onConflict: "participant_id, lesson_id" })
    .select()
    .single();

  if (error) {
    console.error("Error marking lesson complete:", error);
    return { error: error.message };
  }

  // Usually, you might revalidate the participant's portal path here
  // revalidatePath(`/portal/programmes/[id]`, 'page')

  return { data };
}

export async function getParticipantProgress(participantId: string, programmeId: string) {
  const supabase = await createClient();
  
  // Get all required lessons for this programme
  const { data: modules, error: modError } = await supabase
    .from("programme_modules")
    .select(`
      id,
      lessons (id, is_required)
    `)
    .eq("programme_id", programmeId);

  if (modError) return { error: modError.message };

  const allLessons = modules.flatMap(m => m.lessons);
  const requiredLessons = allLessons.filter((l: any) => l.is_required);

  // Get completed lessons by this participant
  const lessonIds = allLessons.map((l: any) => l.id);
  const { data: progress, error: progError } = await supabase
    .from("learning_progress")
    .select("lesson_id, status")
    .eq("participant_id", participantId)
    .eq("status", "completed")
    .in("lesson_id", lessonIds);

  if (progError) return { error: progError.message };

  const completedSet = new Set(progress.map(p => p.lesson_id));
  const completedRequired = requiredLessons.filter((l: any) => completedSet.has(l.id)).length;
  
  const completionPercentage = requiredLessons.length > 0 
    ? Math.round((completedRequired / requiredLessons.length) * 100) 
    : 0;

  return { 
    data: {
      totalRequired: requiredLessons.length,
      completedRequired,
      percentage: completionPercentage,
      completedLessonIds: Array.from(completedSet)
    }
  };
}
