"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSkills() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("skills")
    .select(`
      *,
      skill_categories (name),
      competencies (*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data: data || [] };
}

export async function getLearnerSkills(participantId: string) {
  const supabase = await createClient();

  const { data: skills, error: sklErr } = await supabase
    .from("learner_skills")
    .select(`
      *,
      skills (name, skill_code, level_standard, skill_categories (name))
    `)
    .eq("participant_id", participantId)
    .order("date_achieved", { ascending: false });

  const { data: competencies, error: compErr } = await supabase
    .from("learner_competencies")
    .select(`
      *,
      competencies (title, competency_code, performance_criteria)
    `)
    .eq("participant_id", participantId)
    .order("date_achieved", { ascending: false });

  if (sklErr || compErr) {
    return { error: sklErr?.message || compErr?.message };
  }

  return {
    data: {
      skills: skills || [],
      competencies: competencies || [],
    },
  };
}

export async function endorseLearnerSkill(payload: {
  participantId: string;
  skillId: string;
  achievedLevel: string;
  source?: string;
  evidenceUrl?: string;
}) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("learner_skills")
    .upsert({
      participant_id: payload.participantId,
      skill_id: payload.skillId,
      achieved_level: payload.achievedLevel,
      source: payload.source || "manual_endorsement",
      evidence_url: payload.evidenceUrl || null,
      endorsed_by: user.user?.id,
      date_achieved: new Date().toISOString().split("T")[0],
    }, { onConflict: "participant_id, skill_id" })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/skills");
  return { data };
}
