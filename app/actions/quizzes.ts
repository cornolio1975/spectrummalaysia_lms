"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getQuizzes(programmeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("*, lessons (title)")
    .eq("programme_id", programmeId);

  if (error) {
    return { error: error.message };
  }
  return { data };
}

export async function createQuiz(programmeId: string, formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .insert([{ ...formData, programme_id: programmeId }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Seed sample questions so quiz is immediately testable
  await supabase.from("quiz_questions").insert([
    {
      quiz_id: data.id,
      question_type: "multiple_choice",
      question_text: "What is the primary objective of this module?",
      options: [
        { text: "To understand the fundamental concepts and best practices", is_correct: true },
        { text: "To bypass safety protocols", is_correct: false },
        { text: "To ignore operational standards", is_correct: false },
      ],
      marks: 10,
      sort_order: 1,
    },
    {
      quiz_id: data.id,
      question_type: "multiple_choice",
      question_text: "Which of the following describes effective execution?",
      options: [
        { text: "Continuous feedback and rigorous adherence to criteria", is_correct: true },
        { text: "Unmonitored procedures", is_correct: false },
        { text: "Skipping documentation", is_correct: false },
      ],
      marks: 10,
      sort_order: 2,
    },
  ]);

  revalidatePath(`/programmes/${programmeId}`);
  return { data };
}

export async function updateQuiz(programmeId: string, quizId: string, formData: any) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quizzes")
    .update(formData)
    .eq("id", quizId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/programmes/${programmeId}`);
  return { data };
}

export async function deleteQuiz(programmeId: string, quizId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", quizId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/programmes/${programmeId}`);
  return { success: true };
}
