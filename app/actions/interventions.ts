"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getLearnerInterventions(participantId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("learner_interventions")
    .select(`
      *,
      participants (full_name, email, phone),
      courses (title, course_code)
    `)
    .order("created_at", { ascending: false });

  if (participantId) {
    query = query.eq("participant_id", participantId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { data: data || [] };
}

export async function createIntervention(payload: {
  participantId: string;
  courseId?: string;
  reason: any;
  interventionType: any;
  notes: string;
}) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("learner_interventions")
    .insert([{
      participant_id: payload.participantId,
      course_id: payload.courseId || null,
      reason: payload.reason,
      intervention_type: payload.interventionType,
      notes: payload.notes,
      triggered_by: user.user?.id,
      status: "open",
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/learner-360");
  return { data };
}

export async function resolveIntervention(interventionId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("learner_interventions")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", interventionId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/learner-360");
  return { data };
}

/**
 * Automatically inspects learner progress to generate proactive interventions.
 */
export async function runAutomatedInterventionCheck() {
  const supabase = await createClient();

  // Find enrolments with progress < 25% that were started over 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: laggingEnrolments } = await supabase
    .from("course_enrolments")
    .select("participant_id, course_id, progress_pct, enrolled_at")
    .eq("status", "in_progress")
    .lt("progress_pct", 30)
    .lt("enrolled_at", sevenDaysAgo.toISOString());

  let createdCount = 0;
  if (laggingEnrolments && laggingEnrolments.length > 0) {
    for (const enrol of laggingEnrolments) {
      // Check if open intervention already exists
      const { data: existing } = await supabase
        .from("learner_interventions")
        .select("id")
        .eq("participant_id", enrol.participant_id)
        .eq("course_id", enrol.course_id)
        .eq("status", "open")
        .maybeSingle();

      if (!existing) {
        await supabase.from("learner_interventions").insert({
          participant_id: enrol.participant_id,
          course_id: enrol.course_id,
          reason: "low_progress",
          intervention_type: "reminder",
          notes: `Learner enrolled over 7 days ago but progress is currently at ${enrol.progress_pct}%. Proactive reminder recommended.`,
          status: "open",
        });
        createdCount++;
      }
    }
  }

  return { checkedCount: laggingEnrolments?.length || 0, createdCount };
}
