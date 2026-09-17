"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getEvidenceRepository(participantId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("evidence_repository")
    .select(`
      *,
      participants (full_name, email),
      courses (title, course_code),
      practical_assessments (title)
    `)
    .order("uploaded_at", { ascending: false });

  if (participantId) {
    query = query.eq("participant_id", participantId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { data: data || [] };
}

export async function storeEvidenceItem(payload: {
  title: string;
  evidenceType: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  participantId?: string;
  courseId?: string;
  assessmentId?: string;
  accessLevel?: string;
}) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("evidence_repository")
    .insert([{
      owner_id: user.user?.id,
      participant_id: payload.participantId,
      title: payload.title,
      evidence_type: payload.evidenceType,
      file_url: payload.fileUrl,
      file_name: payload.fileName,
      file_size: payload.fileSize,
      related_course_id: payload.courseId || null,
      related_assessment_id: payload.assessmentId || null,
      access_level: payload.accessLevel || "private",
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/evidence");
  return { data };
}
