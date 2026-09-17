"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { PracticalAssessmentFormData, practicalAssessmentSchema, GradingFormData, gradingSchema } from "@/lib/validations/assessment";

export async function getPracticalAssessments(courseId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("practical_assessments")
    .select(`
      *,
      courses (title, course_code),
      practical_submissions (count)
    `)
    .order("created_at", { ascending: false });

  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { data: data || [] };
}

export async function createPracticalAssessment(formData: PracticalAssessmentFormData) {
  const parsed = practicalAssessmentSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("practical_assessments")
    .insert([{
      ...parsed.data,
      created_by: user.user?.id,
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/practical-assessments");
  if (parsed.data.course_id) {
    revalidatePath(`/courses/${parsed.data.course_id}`);
  }
  return { data };
}

export async function submitPracticalTask(payload: {
  assessmentId: string;
  participantId: string;
  evidenceUrls: string[];
  submissionNotes?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("practical_submissions")
    .upsert({
      assessment_id: payload.assessmentId,
      participant_id: payload.participantId,
      evidence_urls: payload.evidenceUrls,
      submission_notes: payload.submissionNotes || "",
      status: "submitted",
      submitted_at: new Date().toISOString(),
    }, { onConflict: "assessment_id, participant_id" })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/practical-assessments");
  return { data };
}

export async function gradePracticalSubmission(formData: GradingFormData) {
  const parsed = gradingSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("practical_submissions")
    .update({
      score: parsed.data.score,
      is_competent: parsed.data.is_competent,
      rubric_evaluation: parsed.data.rubric_evaluation || {},
      trainer_observation: parsed.data.trainer_observation,
      assessor_id: user.user?.id,
      assessed_at: new Date().toISOString(),
      status: parsed.data.is_competent ? "competent" : "not_yet_competent",
    })
    .eq("id", parsed.data.submission_id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/practical-assessments");
  return { data };
}

export async function getTrainerGradingQueue() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("practical_submissions")
    .select(`
      *,
      practical_assessments (title, max_score, pass_mark, courses (title, course_code)),
      participants (full_name, email, phone)
    `)
    .order("submitted_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data: data || [] };
}
