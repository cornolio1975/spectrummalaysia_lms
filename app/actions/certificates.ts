"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  issueMC001Certificate,
  revokeCertificateRecord,
  replaceCertificateRecord,
  getCertificateAuditHistory,
  logCertificateAudit,
  evaluateMC001CertificateEligibility,
} from "@/services/certificate-engine";

export async function getCertificates() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("certificates")
    .select(`
      *,
      participants (
        id, full_name, ic_number, phone, email
      ),
      courses (
        id, course_code, title, learning_hours
      ),
      credentials (
        id, credential_code, name
      ),
      programmes (
        id, programme_name, programme_code
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching certificates:", error);
    return { error: error.message };
  }

  return { data: data || [] };
}

export async function getCertificateByIdOrNo(identifier: string) {
  const supabase = await createClient();

  // Try fetching by certificate_no first, then by UUID id
  let query = supabase
    .from("certificates")
    .select(`
      *,
      participants (
        id, full_name, phone, email, ic_number
      ),
      courses (
        id, course_code, title, learning_hours
      ),
      credentials (
        id, credential_code, name
      ),
      certificate_templates (
        id, template_name, issuer_name, issuer_title, issuer_organisation, signature_name, signature_title, border_style
      )
    `);

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
  if (isUuid) {
    query = query.or(`id.eq.${identifier},certificate_no.eq.${identifier}`);
  } else {
    query = query.eq("certificate_no", identifier);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (data) {
    if (data.replacement_certificate_id) {
      const { data: rep } = await supabase
        .from("certificates")
        .select("id, certificate_no, status")
        .eq("id", data.replacement_certificate_id)
        .maybeSingle();
      data.replacement = rep;
    }
    if (data.original_certificate_id) {
      const { data: orig } = await supabase
        .from("certificates")
        .select("id, certificate_no, status")
        .eq("id", data.original_certificate_id)
        .maybeSingle();
      data.original = orig;
    }
  }

  return { data };
}

export async function checkCertificateEligibility(participantId: string, courseId?: string) {
  return evaluateMC001CertificateEligibility(participantId, courseId);
}

export async function issueCertificate(params: {
  participantId: string;
  courseId?: string;
  programmeId?: string;
  scorePct?: number;
}) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const result = await issueMC001Certificate({
    participantId: params.participantId,
    courseId: params.courseId,
    issuedBy: user.user?.id,
    scorePct: params.scorePct,
  });

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath("/certificates");
  revalidatePath("/wallet");
  return { data: result.data };
}

export async function revokeCertificate(certificateId: string, reason: string) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const result = await revokeCertificateRecord({
    certificateId,
    reason,
    actorId: user.user?.id,
    actorName: user.user?.email || "Administrator",
  });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath("/certificates");
  revalidatePath("/wallet");
  if (result.data?.certificate_no) {
    revalidatePath(`/verify/certificate/${result.data.certificate_no}`);
  }

  return { data: result.data };
}

export async function replaceCertificate(params: {
  originalCertificateId: string;
  correctedLearnerName?: string;
  reason: string;
}) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const result = await replaceCertificateRecord({
    originalCertificateId: params.originalCertificateId,
    correctedLearnerName: params.correctedLearnerName,
    reason: params.reason,
    actorId: user.user?.id,
    actorName: user.user?.email || "Administrator",
  });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath("/certificates");
  revalidatePath("/wallet");
  return { data: result.replacementCert };
}

export async function getCertificateAuditTrail(certificateId: string) {
  return getCertificateAuditHistory(certificateId);
}

export async function recordCertificateAccess(params: {
  certificateId: string;
  certificateNo: string;
  action: "view" | "download" | "verify";
}) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const eventMap = {
    view: "CERTIFICATE_VIEWED" as const,
    download: "CERTIFICATE_DOWNLOADED" as const,
    verify: "CERTIFICATE_VERIFIED" as const,
  };

  await logCertificateAudit({
    certificateId: params.certificateId,
    certificateNo: params.certificateNo,
    event: eventMap[params.action],
    actorId: user.user?.id,
    actorName: user.user?.email || "Public Viewer",
  });

  return { success: true };
}
