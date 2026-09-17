"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  evaluateCredentialEligibility,
  issueCredentialToParticipant,
  revokeCredentialIssuance,
  renewCredentialIssuance,
} from "@/services/credential-engine";
import { CredentialFormData, credentialSchema } from "@/lib/validations/credential";

export async function getCredentials() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("credentials")
    .select(`
      *,
      credential_requirements (count),
      credential_issuances (count)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  const formatted = (data || []).map((c: any) => ({
    ...c,
    requirementsCount: c.credential_requirements?.[0]?.count || 0,
    issuancesCount: c.credential_issuances?.[0]?.count || 0,
  }));

  return { data: formatted };
}

export async function getCredentialById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("credentials")
    .select(`
      *,
      credential_requirements (*),
      credential_learning_outcomes (*),
      credential_prerequisites:credential_prerequisites!credential_prerequisites_credential_id_fkey (
        prerequisite_credential_id,
        credentials!credential_prerequisites_prerequisite_credential_id_fkey (name, credential_code)
      ),
      credential_issuances (
        id,
        credential_id_code,
        issue_date,
        expiry_date,
        status,
        participants (full_name)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error in getCredentialById:", error);
    return { error: error.message };
  }

  return { data };
}

export async function createCredential(formData: CredentialFormData) {
  const parsed = credentialSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const credCode = parsed.data.credential_code || `MC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data, error } = await supabase
    .from("credentials")
    .insert([{
      ...parsed.data,
      credential_code: credCode,
      created_by: user.user?.id,
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/credentials");
  return { data };
}

export async function addCredentialRequirement(payload: {
  credentialId: string;
  requirementType: any;
  courseId?: string;
  minScore?: number;
  minAttendancePct?: number;
  description?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("credential_requirements")
    .insert([{
      credential_id: payload.credentialId,
      requirement_type: payload.requirementType,
      course_id: payload.courseId || null,
      min_score: payload.minScore || null,
      min_attendance_pct: payload.minAttendancePct || null,
      description: payload.description || `Requirement for ${payload.requirementType}`,
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/credentials/${payload.credentialId}`);
  return { data };
}

export async function checkEligibility(participantId: string, credentialId: string) {
  try {
    const result = await evaluateCredentialEligibility(participantId, credentialId);
    return { data: result };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function issueCredential(participantId: string, credentialId: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const res = await issueCredentialToParticipant({
    participantId,
    credentialId,
    adminApprovedBy: user.user?.id,
  });

  revalidatePath("/credentials");
  revalidatePath("/wallet");
  return res;
}

export async function revokeCredential(issuanceId: string, reason: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const res = await revokeCredentialIssuance(issuanceId, reason, user.user?.id || "system");
  revalidatePath("/credentials");
  revalidatePath("/wallet");
  return res;
}

export async function renewCredential(issuanceId: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const res = await renewCredentialIssuance(issuanceId, user.user?.id || "system");
  revalidatePath("/credentials");
  revalidatePath("/wallet");
  return res;
}

export async function getCredentialByCode(code: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("credential_issuances")
    .select(`
      *,
      participants (full_name, ic_number, phone, email),
      credentials (name, description, credential_code, credential_type, level, learning_hours)
    `)
    .eq("credential_id_code", code)
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function getLearnerWalletCredentials(participantId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("credential_issuances")
    .select(`
      *,
      credentials (*),
      digital_badges (*),
      participants (full_name)
    `)
    .order("created_at", { ascending: false });

  if (participantId) {
    query = query.eq("participant_id", participantId);
  }

  const { data, error } = await query;

  let certQuery = supabase
    .from("certificates")
    .select(`
      *,
      participants (full_name, email),
      courses (title, code),
      credentials (name, code, learning_hours)
    `)
    .order("created_at", { ascending: false });

  if (participantId) {
    certQuery = certQuery.eq("participant_id", participantId);
  }

  const { data: certData } = await certQuery;

  if (error) {
    return { error: error.message, data: [], certificates: certData || [] };
  }

  return { data: data || [], certificates: certData || [] };
}

export async function getCertificateTemplates() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificate_templates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }
  return { data: data || [] };
}

export async function saveCertificateTemplate(payload: {
  id?: string;
  template_name: string;
  issuer_name: string;
  issuer_logo?: string;
  signature_name?: string;
  template_html?: string;
  template_css?: string;
  is_default?: boolean;
}) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (payload.is_default) {
    // Unset existing defaults
    await supabase.from("certificate_templates").update({ is_default: false }).neq("id", payload.id || "00000000-0000-0000-0000-000000000000");
  }

  if (payload.id) {
    const { data, error } = await supabase
      .from("certificate_templates")
      .update({
        template_name: payload.template_name,
        issuer_name: payload.issuer_name,
        issuer_logo: payload.issuer_logo || null,
        signature_name: payload.signature_name || null,
        template_html: payload.template_html || null,
        template_css: payload.template_css || null,
        is_default: !!payload.is_default,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.id)
      .select()
      .single();

    if (error) return { error: error.message };
    revalidatePath("/credentials/designer");
    return { data };
  } else {
    const { data, error } = await supabase
      .from("certificate_templates")
      .insert([{
        template_name: payload.template_name,
        issuer_name: payload.issuer_name,
        issuer_logo: payload.issuer_logo || null,
        signature_name: payload.signature_name || null,
        template_html: payload.template_html || null,
        template_css: payload.template_css || null,
        is_default: !!payload.is_default,
        created_by: user.user?.id,
      }])
      .select()
      .single();

    if (error) return { error: error.message };
    revalidatePath("/credentials/designer");
    return { data };
  }
}

export async function getCredentialStacks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("credential_stacks")
    .select(`
      *,
      resulting_credential:credentials!credential_stacks_resulting_credential_id_fkey (*),
      credential_stack_items (
        *,
        credential:credentials (*)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }
  return { data: data || [] };
}

export async function createCredentialStack(payload: {
  name: string;
  description?: string;
  resulting_credential_id: string;
  min_credits?: number;
  items: { credential_id: string; is_mandatory: boolean; order_seq: number }[];
}) {
  const supabase = await createClient();

  const { data: stack, error: stackErr } = await supabase
    .from("credential_stacks")
    .insert([{
      name: payload.name,
      description: payload.description || "",
      resulting_credential_id: payload.resulting_credential_id,
      min_credits: payload.min_credits || 0,
    }])
    .select()
    .single();

  if (stackErr) {
    return { error: stackErr.message };
  }

  if (payload.items && payload.items.length > 0) {
    const stackItems = payload.items.map(item => ({
      stack_id: stack.id,
      credential_id: item.credential_id,
      is_mandatory: item.is_mandatory,
      order_seq: item.order_seq,
    }));

    const { error: itemsErr } = await supabase
      .from("credential_stack_items")
      .insert(stackItems);

    if (itemsErr) {
      return { error: itemsErr.message };
    }
  }

  revalidatePath("/credentials/stacking");
  return { data: stack };
}

