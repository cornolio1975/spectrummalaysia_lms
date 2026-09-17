"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { RPLApplicationFormData, rplApplicationSchema, RPLEvidenceFormData, rplEvidenceSchema } from "@/lib/validations/rpl";

export async function getRPLApplications() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("rpl_applications")
    .select(`
      *,
      participants (full_name, email, phone),
      courses (title, course_code),
      rpl_evidence (*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data: data || [] };
}

export async function submitRPLApplication(formData: RPLApplicationFormData) {
  const parsed = rplApplicationSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("rpl_applications")
    .insert([parsed.data])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/rpl");
  return { data };
}

export async function uploadRPLEvidence(formData: RPLEvidenceFormData) {
  const parsed = rplEvidenceSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: "Invalid evidence data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("rpl_evidence")
    .insert([{
      ...parsed.data,
      verified_by: user.user?.id,
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/rpl");
  return { data };
}

export async function reviewRPLApplication(payload: {
  applicationId: string;
  status: "under_review" | "interview_scheduled" | "practical_validation" | "approved" | "rejected";
  feedback?: string;
  interviewDate?: string;
}) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const updatePayload: any = {
    status: payload.status,
    assessor_feedback: payload.feedback,
    assessor_id: user.user?.id,
    reviewed_at: new Date().toISOString(),
  };

  if (payload.interviewDate) {
    updatePayload.interview_scheduled_at = payload.interviewDate;
  }

  const { data, error } = await supabase
    .from("rpl_applications")
    .update(updatePayload)
    .eq("id", payload.applicationId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/rpl");
  return { data };
}
