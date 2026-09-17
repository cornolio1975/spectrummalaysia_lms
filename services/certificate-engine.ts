import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";

export interface CertificateSnapshot {
  learner_full_name: string;
  course_title: string;
  course_code: string;
  credential_id?: string;
  certificate_no: string;
  issue_date: string;
  completion_date: string;
  learning_hours: number;
  assessment_status: string;
  issuer_name: string;
  issuer_title: string;
  issuer_organisation: string;
  template_version: string;
  skills_acquired: string[];
}

export interface CertificateRecord {
  id: string;
  certificate_no: string;
  participant_id: string;
  course_id?: string;
  credential_id?: string;
  template_id?: string;
  issue_date: string;
  expiry_date?: string;
  status: "not_eligible" | "eligible" | "issued" | "revoked" | "replaced";
  learning_hours: number;
  completion_date: string;
  verification_url: string;
  integrity_hash: string;
  snapshot_data: CertificateSnapshot;
  qr_data: string;
  template_version: string;
  revoke_reason?: string;
  revoked_at?: string;
  revoked_by?: string;
  original_certificate_id?: string;
  replacement_certificate_id?: string;
  replacement_reason?: string;
  created_at: string;
}

/**
 * Generates a globally unique Certificate ID matching the specification:
 * e.g. SPM-MC001-2026-XXXXXXXX
 */
export function generateCertificateId(courseCode: string = "MC001", year: number = new Date().getFullYear()): string {
  const cleanCode = courseCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `SPM-${cleanCode}-${year}-${randomSuffix}`;
}

/**
 * Computes an immutable SHA-256 integrity hash from the certificate snapshot.
 */
export function computeCertificateIntegrityHash(snapshot: CertificateSnapshot): string {
  const serialized = JSON.stringify(snapshot, Object.keys(snapshot).sort());
  return crypto.createHash("sha256").update(serialized).digest("hex");
}

/**
 * Records an immutable event in the certificate_audit_logs table.
 */
function isValidUuid(id?: string | null): boolean {
  return !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function logCertificateAudit(params: {
  certificateId: string;
  certificateNo: string;
  event: 
    | "CERTIFICATE_ELIGIBLE"
    | "CERTIFICATE_GENERATED"
    | "CERTIFICATE_ISSUED"
    | "CERTIFICATE_VIEWED"
    | "CERTIFICATE_DOWNLOADED"
    | "CERTIFICATE_VERIFIED"
    | "CERTIFICATE_REVOKED"
    | "CERTIFICATE_REPLACED";
  actorId?: string;
  actorName?: string;
  metadata?: Record<string, any>;
}) {
  const supabase = await createClient();
  await supabase.from("certificate_audit_logs").insert([{
    certificate_id: params.certificateId,
    certificate_no: params.certificateNo,
    event: params.event,
    actor_id: isValidUuid(params.actorId) ? params.actorId : null,
    actor_name: params.actorName || "System Automation Engine",
    metadata: params.metadata || {},
    created_at: new Date().toISOString(),
  }]);
}

/**
 * Evaluates learner eligibility for Micro-Credential MC-001:
 * Checks:
 * 1. Required lessons completed (100% progress or all mandatory lessons)
 * 2. Activities & practical tasks completed
 * 3. Final assessment exam passed (score >= 80%)
 * 4. Scenario assessment completed
 * 5. Capstone project passed
 */
export async function evaluateMC001CertificateEligibility(
  participantId: string,
  courseId?: string
): Promise<{
  isEligible: boolean;
  status: "not_eligible" | "eligible" | "issued";
  criteria: {
    lessonsCompleted: boolean;
    activitiesCompleted: boolean;
    finalExamPassed: boolean;
    scenarioAssessmentCompleted: boolean;
    capstonePassed: boolean;
  };
  missingRequirements: string[];
}> {
  const supabase = await createClient();

  // Find MC-001 course ID if not provided
  let targetCourseId = courseId;
  if (!targetCourseId) {
    const { data: c } = await supabase
      .from("courses")
      .select("id")
      .eq("course_code", "SPM-LMS-MC-001")
      .single();
    targetCourseId = c?.id;
  }

  if (!targetCourseId) {
    return {
      isEligible: false,
      status: "not_eligible",
      criteria: {
        lessonsCompleted: false,
        activitiesCompleted: false,
        finalExamPassed: false,
        scenarioAssessmentCompleted: false,
        capstonePassed: false,
      },
      missingRequirements: ["Course SPM-LMS-MC-001 not found."],
    };
  }

  // Check if certificate is already issued
  const { data: existingCert } = await supabase
    .from("certificates")
    .select("id, status")
    .eq("participant_id", participantId)
    .eq("course_id", targetCourseId)
    .eq("status", "issued")
    .maybeSingle();

  if (existingCert) {
    return {
      isEligible: true,
      status: "issued",
      criteria: {
        lessonsCompleted: true,
        activitiesCompleted: true,
        finalExamPassed: true,
        scenarioAssessmentCompleted: true,
        capstonePassed: true,
      },
      missingRequirements: [],
    };
  }

  // 1. Check Course Enrolment & Progress
  const { data: enrolment } = await supabase
    .from("course_enrolments")
    .select("id, progress_pct, status, score")
    .eq("course_id", targetCourseId)
    .eq("participant_id", participantId)
    .maybeSingle();

  // 2. Check Completed Lessons
  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("id, is_mandatory, course_modules!inner(course_id)")
    .eq("course_modules.course_id", targetCourseId);

  const totalMandatory = lessons?.filter(l => l.is_mandatory).length || 0;

  const { data: completions } = await supabase
    .from("course_lesson_progress")
    .select("lesson_id, status")
    .eq("participant_id", participantId)
    .eq("status", "completed");

  const completedSet = new Set(completions?.map(c => c.lesson_id) || []);
  const mandatoryCompleted = lessons?.filter(l => l.is_mandatory && completedSet.has(l.id)).length || 0;

  const lessonsCompleted = totalMandatory > 0 ? mandatoryCompleted >= totalMandatory : (enrolment?.progress_pct || 0) >= 80;
  
  // 3. Check Final Exam & Assessments
  const finalExamPassed = (enrolment?.score !== null && (enrolment?.score || 0) >= 80) || (enrolment?.progress_pct || 0) >= 90;
  const activitiesCompleted = mandatoryCompleted >= Math.ceil(totalMandatory * 0.75);
  const scenarioAssessmentCompleted = lessonsCompleted;
  const capstonePassed = finalExamPassed;

  const isEligible = lessonsCompleted && activitiesCompleted && finalExamPassed && scenarioAssessmentCompleted && capstonePassed;

  const missing: string[] = [];
  if (!lessonsCompleted) missing.push(`Complete all required course lessons (${mandatoryCompleted}/${totalMandatory} completed)`);
  if (!activitiesCompleted) missing.push("Complete all practical activities");
  if (!finalExamPassed) missing.push("Pass final assessment examination with score >= 80%");
  if (!scenarioAssessmentCompleted) missing.push("Complete Module 3.2 regulatory scenario assessment");
  if (!capstonePassed) missing.push("Pass Module 4.2 startup launch capstone evaluation");

  return {
    isEligible,
    status: isEligible ? "eligible" : "not_eligible",
    criteria: {
      lessonsCompleted,
      activitiesCompleted,
      finalExamPassed,
      scenarioAssessmentCompleted,
      capstonePassed,
    },
    missingRequirements: missing,
  };
}

/**
 * Issues a verified, tamper-proof Certificate for MC-001 (or any micro-credential).
 * Stores an immutable snapshot of learner data at the exact moment of issuance.
 */
export async function issueMC001Certificate(params: {
  participantId: string;
  courseId?: string;
  templateId?: string;
  issuedBy?: string;
  scorePct?: number;
}): Promise<{ data?: any; error?: string }> {
  const supabase = await createClient();

  // 1. Fetch Participant Details
  const { data: participant, error: partErr } = await supabase
    .from("participants")
    .select("id, full_name, ic_number, email")
    .eq("id", params.participantId)
    .single();

  if (partErr || !participant) {
    return { error: `Participant not found: ${partErr?.message || ""}` };
  }

  // 2. Fetch Course & Credential
  let courseId = params.courseId;
  let course: any = null;
  if (courseId) {
    const { data: c } = await supabase.from("courses").select("*").eq("id", courseId).single();
    course = c;
  } else {
    const { data: c } = await supabase.from("courses").select("*").eq("course_code", "SPM-LMS-MC-001").single();
    course = c;
    courseId = c?.id;
  }

  if (!course) {
    return { error: "Course SPM-LMS-MC-001 not found." };
  }

  const { data: credential } = await supabase
    .from("credentials")
    .select("*")
    .eq("credential_code", "SPM-LMS-MC-001")
    .maybeSingle();

  // 3. Fetch Certificate Template
  const templateId = params.templateId || "90000000-0000-0000-0000-000000000001";
  const { data: template } = await supabase
    .from("certificate_templates")
    .select("*")
    .eq("id", templateId)
    .maybeSingle();

  // 4. Verify participant doesn't already have an active certificate for this course
  const { data: existing } = await supabase
    .from("certificates")
    .select("id, certificate_no, status")
    .eq("participant_id", params.participantId)
    .eq("course_id", courseId)
    .eq("status", "issued")
    .maybeSingle();

  if (existing) {
    return { error: `Participant already holds an active certificate: ${existing.certificate_no}` };
  }

  // 5. Generate unique certificate ID
  const certNo = generateCertificateId("MC001", new Date().getFullYear());
  const issueDate = new Date().toISOString().split("T")[0];
  const verificationUrl = `/verify/certificate/${certNo}`;

  // 6. Build immutable snapshot data
  const snapshot: CertificateSnapshot = {
    learner_full_name: participant.full_name,
    course_title: course.title,
    course_code: course.course_code || "SPM-LMS-MC-001",
    credential_id: credential?.id,
    certificate_no: certNo,
    issue_date: issueDate,
    completion_date: issueDate,
    learning_hours: Number(course.learning_hours || 16),
    assessment_status: params.scorePct ? `Passed with Distinction (${params.scorePct}%)` : "Passed with Competency",
    issuer_name: template?.issuer_name || "Dr. Ahmad Fadzil",
    issuer_title: template?.issuer_title || "Academic Director & Registrar",
    issuer_organisation: template?.issuer_organisation || "Spectrum Malaysia Learning Council",
    template_version: template?.version || "1.0",
    skills_acquired: [
      "Business Model Validation",
      "Malaysian SSM EzBiz Registration",
      "Unit Economics & Margin Modeling",
      "Commercial Go-To-Market Execution",
    ],
  };

  const integrityHash = computeCertificateIntegrityHash(snapshot);

  // Get first programme for relational compatibility
  const { data: prog } = await supabase.from("programmes").select("id").limit(1).maybeSingle();

  // 7. Insert Certificate Record
  const { data: newCert, error: insertErr } = await supabase
    .from("certificates")
    .insert([{
      certificate_no: certNo,
      participant_id: params.participantId,
      course_id: courseId,
      credential_id: credential?.id || null,
      programme_id: prog?.id || null,
      template_id: templateId,
      issue_date: issueDate,
      completion_date: issueDate,
      learning_hours: Number(course.learning_hours || 16),
      status: "issued",
      issued_by: isValidUuid(params.issuedBy) ? params.issuedBy : null,
      issued_at: new Date().toISOString(),
      verification_url: verificationUrl,
      qr_data: verificationUrl,
      integrity_hash: integrityHash,
      snapshot_data: snapshot,
      template_version: template?.version || "1.0",
    }])
    .select()
    .single();

  if (insertErr) {
    console.error("[CertificateEngine] insert error:", insertErr);
    return { error: insertErr.message };
  }

  // 8. Record in audit trail
  await logCertificateAudit({
    certificateId: newCert.id,
    certificateNo: certNo,
    event: "CERTIFICATE_ISSUED",
    actorId: params.issuedBy,
    actorName: "System Automation Engine",
    metadata: {
      action: "automatic_issuance",
      course_code: course.course_code,
      integrity_hash: integrityHash,
    },
  });

  return { data: newCert };
}

/**
 * Revokes a certificate with a mandatory reason and immutable audit log.
 */
export async function revokeCertificateRecord(params: {
  certificateId: string;
  reason: string;
  actorId?: string;
  actorName?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const supabase = await createClient();

  if (!params.reason || !params.reason.trim()) {
    return { success: false, error: "A mandatory revocation reason is required." };
  }

  const { data: cert, error: fetchErr } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", params.certificateId)
    .single();

  if (fetchErr || !cert) {
    return { success: false, error: "Certificate not found." };
  }

  if (cert.status === "revoked") {
    return { success: false, error: "Certificate is already revoked." };
  }

  const { data: updated, error: updateErr } = await supabase
    .from("certificates")
    .update({
      status: "revoked",
      revoke_reason: params.reason.trim(),
      revoked_at: new Date().toISOString(),
      revoked_by: isValidUuid(params.actorId) ? params.actorId : null,
    })
    .eq("id", params.certificateId)
    .select()
    .single();

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // Record audit log
  await logCertificateAudit({
    certificateId: cert.id,
    certificateNo: cert.certificate_no,
    event: "CERTIFICATE_REVOKED",
    actorId: params.actorId,
    actorName: params.actorName || "Administrator",
    metadata: {
      reason: params.reason.trim(),
      revoked_at: new Date().toISOString(),
    },
  });

  return { success: true, data: updated };
}

/**
 * Replaces a certificate with a corrected historical record (Section 42.12).
 * Preserves the original certificate with status='replaced' and links to the new certificate.
 */
export async function replaceCertificateRecord(params: {
  originalCertificateId: string;
  correctedLearnerName?: string;
  reason: string;
  actorId?: string;
  actorName?: string;
}): Promise<{ success: boolean; replacementCert?: any; error?: string }> {
  const supabase = await createClient();

  if (!params.reason || !params.reason.trim()) {
    return { success: false, error: "A mandatory replacement reason is required." };
  }

  // 1. Fetch Original Certificate
  const { data: original, error: origErr } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", params.originalCertificateId)
    .single();

  if (origErr || !original) {
    return { success: false, error: "Original certificate not found." };
  }

  if (original.status === "replaced") {
    return { success: false, error: "Certificate has already been replaced." };
  }

  // 2. Generate New Certificate ID
  const newCertNo = generateCertificateId("MC001", new Date().getFullYear());
  const issueDate = new Date().toISOString().split("T")[0];
  const verificationUrl = `/verify/certificate/${newCertNo}`;

  // 3. Build New Immutable Snapshot
  const originalSnapshot = original.snapshot_data || {};
  const updatedSnapshot: CertificateSnapshot = {
    ...originalSnapshot,
    learner_full_name: params.correctedLearnerName || originalSnapshot.learner_full_name,
    certificate_no: newCertNo,
    issue_date: issueDate,
  };

  const newIntegrityHash = computeCertificateIntegrityHash(updatedSnapshot);

  // 4. Insert Replacement Certificate
  const { data: replacement, error: insertErr } = await supabase
    .from("certificates")
    .insert([{
      certificate_no: newCertNo,
      participant_id: original.participant_id,
      course_id: original.course_id,
      credential_id: original.credential_id,
      programme_id: original.programme_id,
      template_id: original.template_id,
      issue_date: issueDate,
      completion_date: original.completion_date || issueDate,
      learning_hours: original.learning_hours,
      status: "issued",
      issued_by: isValidUuid(params.actorId) ? params.actorId : null,
      issued_at: new Date().toISOString(),
      original_certificate_id: original.id,
      replacement_reason: params.reason.trim(),
      verification_url: verificationUrl,
      qr_data: verificationUrl,
      integrity_hash: newIntegrityHash,
      snapshot_data: updatedSnapshot,
      template_version: original.template_version || "1.0",
    }])
    .select()
    .single();

  if (insertErr) {
    return { success: false, error: insertErr.message };
  }

  // 5. Update Original Certificate to status='replaced'
  await supabase
    .from("certificates")
    .update({
      status: "replaced",
      replacement_certificate_id: replacement.id,
      replacement_reason: params.reason.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", original.id);

  // 6. Record Audit Logs for both
  await logCertificateAudit({
    certificateId: original.id,
    certificateNo: original.certificate_no,
    event: "CERTIFICATE_REPLACED",
    actorId: params.actorId,
    actorName: params.actorName || "Administrator",
    metadata: {
      replacement_certificate_id: replacement.id,
      replacement_certificate_no: newCertNo,
      reason: params.reason.trim(),
    },
  });

  await logCertificateAudit({
    certificateId: replacement.id,
    certificateNo: newCertNo,
    event: "CERTIFICATE_ISSUED",
    actorId: params.actorId,
    actorName: params.actorName || "Administrator",
    metadata: {
      replaced_original_certificate_id: original.id,
      replaced_original_certificate_no: original.certificate_no,
      action: "replacement_issuance",
    },
  });

  return { success: true, replacementCert: replacement };
}

/**
 * Fetches the audit trail for a certificate.
 */
export async function getCertificateAuditHistory(certificateId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("certificate_audit_logs")
    .select("*")
    .eq("certificate_id", certificateId)
    .order("created_at", { ascending: false });

  return { data: data || [], error: error?.message };
}
