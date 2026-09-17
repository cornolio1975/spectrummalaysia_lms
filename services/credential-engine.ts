import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";

export interface RequirementEvaluation {
  id: string;
  type: string;
  description: string;
  isSatisfied: boolean;
  actualValue?: any;
  requiredValue?: any;
  logicGroup: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  missingRequirements: string[];
  evaluations: RequirementEvaluation[];
}

/**
 * Calculates whether a participant has met all requirements for a credential.
 */
export async function evaluateCredentialEligibility(
  participantId: string,
  credentialId: string
): Promise<EligibilityResult> {
  const supabase = await createClient();

  // 1. Fetch credential and its requirements
  const { data: credential, error: credError } = await supabase
    .from("credentials")
    .select(`
      *,
      credential_requirements (*),
      credential_prerequisites:credential_prerequisites!credential_prerequisites_credential_id_fkey (*)
    `)
    .eq("id", credentialId)
    .single();

  if (credError || !credential) {
    throw new Error(`Credential not found: ${credError?.message || ""}`);
  }

  const requirements = credential.credential_requirements || [];
  const prerequisites = credential.credential_prerequisites || [];

  const evaluations: RequirementEvaluation[] = [];

  // 2. Evaluate Prerequisites first
  for (const prereq of prerequisites) {
    const { data: activeIssuance } = await supabase
      .from("credential_issuances")
      .select("id")
      .eq("participant_id", participantId)
      .eq("credential_id", prereq.prerequisite_credential_id)
      .eq("status", "valid")
      .maybeSingle();

    evaluations.push({
      id: prereq.prerequisite_credential_id,
      type: "prerequisite_credential",
      description: "Must hold prerequisite credential",
      isSatisfied: !!activeIssuance,
      logicGroup: "PREREQ",
    });
  }

  // 3. Evaluate each Requirement
  for (const req of requirements) {
    let isSatisfied = false;
    let actual: any = null;

    switch (req.requirement_type) {
      case "course_completion": {
        if (req.course_id) {
          const { data: enrol } = await supabase
            .from("course_enrolments")
            .select("progress_pct, status")
            .eq("course_id", req.course_id)
            .eq("participant_id", participantId)
            .maybeSingle();

          actual = enrol ? `${enrol.progress_pct}%` : "Not enrolled";
          isSatisfied = enrol ? (enrol.status === "completed" || enrol.progress_pct >= 100) : false;
        }
        break;
      }

      case "practical_assessment": {
        if (req.course_id) {
          const { data: practicals } = await supabase
            .from("practical_assessments")
            .select("id")
            .eq("course_id", req.course_id);

          if (practicals && practicals.length > 0) {
            const practicalIds = practicals.map((p) => p.id);
            const { data: sub } = await supabase
              .from("practical_submissions")
              .select("status, is_competent, score")
              .eq("participant_id", participantId)
              .in("assessment_id", practicalIds)
              .maybeSingle();

            const minScore = req.min_score ?? 70;
            actual = sub ? `Score: ${sub.score ?? 0}%, Competent: ${sub.is_competent}` : "Pending";
            isSatisfied = sub ? (sub.is_competent === true || (sub.score !== null && sub.score >= minScore)) : false;
          }
        }
        break;
      }

      case "minimum_attendance": {
        const { data: attendanceRecords } = await supabase
          .from("attendance")
          .select("status")
          .eq("participant_id", participantId);

        const total = attendanceRecords?.length || 0;
        const attended = attendanceRecords?.filter((a) => a.status === "present" || a.status === "late").length || 0;
        const pct = total > 0 ? Math.round((attended / total) * 100) : 0;
        const requiredPct = req.min_attendance_pct ?? 80;

        actual = `${pct}%`;
        isSatisfied = pct >= requiredPct;
        break;
      }

      case "competency_achieved": {
        if (req.competency_id) {
          const { data: comp } = await supabase
            .from("learner_competencies")
            .select("is_competent")
            .eq("participant_id", participantId)
            .eq("competency_id", req.competency_id)
            .maybeSingle();

          actual = comp ? (comp.is_competent ? "Competent" : "Not yet competent") : "Not assessed";
          isSatisfied = comp ? comp.is_competent === true : false;
        }
        break;
      }

      default:
        // Default satisfied if not recognized
        isSatisfied = true;
    }

    evaluations.push({
      id: req.id,
      type: req.requirement_type,
      description: req.description || `Requirement: ${req.requirement_type}`,
      isSatisfied,
      actualValue: actual,
      requiredValue: req.min_score ?? req.min_attendance_pct ?? true,
      logicGroup: req.logic_group || "AND_1",
    });
  }

  // 4. Group Evaluation by Logic Groups (AND within groups, OR between groups)
  const groups: Record<string, boolean> = {};
  for (const ev of evaluations) {
    if (groups[ev.logicGroup] === undefined) {
      groups[ev.logicGroup] = true;
    }
    if (!ev.isSatisfied) {
      groups[ev.logicGroup] = false;
    }
  }

  // Overall eligibility:
  // If there are groups, any satisfied standard group (OR) with satisfied PREREQ is eligible
  const prereqSatisfied = groups["PREREQ"] !== undefined ? groups["PREREQ"] : true;
  const standardGroups = Object.entries(groups).filter(([k]) => k !== "PREREQ");
  
  let isEligible = false;
  if (standardGroups.length === 0) {
    isEligible = prereqSatisfied;
  } else {
    const anyStandardPassed = standardGroups.some(([, passed]) => passed);
    isEligible = prereqSatisfied && anyStandardPassed;
  }

  const missingRequirements = evaluations
    .filter((e) => !e.isSatisfied)
    .map((e) => e.description + (e.actualValue ? ` (Current: ${e.actualValue})` : ""));

  // 5. Update credential_eligibility table in Supabase
  await supabase
    .from("credential_eligibility")
    .upsert({
      participant_id: participantId,
      credential_id: credentialId,
      is_eligible: isEligible,
      missing_requirements: missingRequirements,
      evaluated_at: new Date().toISOString(),
    }, { onConflict: "participant_id, credential_id" });

  return {
    isEligible,
    missingRequirements,
    evaluations,
  };
}

/**
 * Computes a SHA256 integrity hash for the credential issuance payload.
 */
export function computeCredentialIntegrityHash(payload: {
  credential_id_code: string;
  participant_id: string;
  credential_id: string;
  issue_date: string;
  issuer: string;
}): string {
  const content = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Issues a new credential to a participant with tamper-evident hash and sequential ID.
 */
export async function issueCredentialToParticipant(params: {
  participantId: string;
  credentialId: string;
  trainerApprovedBy?: string;
  adminApprovedBy?: string;
}) {
  const supabase = await createClient();

  // Check if already has valid issuance
  const { data: existing } = await supabase
    .from("credential_issuances")
    .select("id, credential_id_code")
    .eq("participant_id", params.participantId)
    .eq("credential_id", params.credentialId)
    .eq("status", "valid")
    .maybeSingle();

  if (existing) {
    return { error: "Participant already has an active valid issuance for this credential." };
  }

  // Fetch credential details for expiry calculation
  const { data: cred } = await supabase
    .from("credentials")
    .select("expiry_months, name, badge_config, version")
    .eq("id", params.credentialId)
    .single();

  const issueDate = new Date().toISOString().split("T")[0];
  let expiryDate: string | null = null;
  if (cred?.expiry_months && cred.expiry_months > 0) {
    const exp = new Date();
    exp.setMonth(exp.getMonth() + cred.expiry_months);
    expiryDate = exp.toISOString().split("T")[0];
  }

  // Temporary payload to generate integrity hash
  const timestamp = Date.now();
  const dummyCode = `SPM-MC-${new Date().getFullYear()}-${timestamp}`;
  const integrityHash = computeCredentialIntegrityHash({
    credential_id_code: dummyCode,
    participant_id: params.participantId,
    credential_id: params.credentialId,
    issue_date: issueDate,
    issuer: "Spectrum Malaysia LMS",
  });

  const { data: issuance, error: issueError } = await supabase
    .from("credential_issuances")
    .insert({
      participant_id: params.participantId,
      credential_id: params.credentialId,
      version: cred?.version || 1,
      issue_date: issueDate,
      expiry_date: expiryDate,
      status: "valid",
      trainer_approved_by: params.trainerApprovedBy,
      trainer_approved_at: params.trainerApprovedBy ? new Date().toISOString() : null,
      admin_approved_by: params.adminApprovedBy,
      admin_approved_at: params.adminApprovedBy ? new Date().toISOString() : null,
      integrity_hash: integrityHash,
    })
    .select()
    .single();

  if (issueError || !issuance) {
    console.error("Error issuing credential:", issueError);
    return { error: issueError?.message || "Failed to issue credential" };
  }

  // Re-hash with the real sequence-assigned code
  const finalHash = computeCredentialIntegrityHash({
    credential_id_code: issuance.credential_id_code,
    participant_id: params.participantId,
    credential_id: params.credentialId,
    issue_date: issueDate,
    issuer: "Spectrum Malaysia LMS",
  });

  await supabase
    .from("credential_issuances")
    .update({ integrity_hash: finalHash })
    .eq("id", issuance.id);

  // Automatically create Digital Badge entry
  await supabase.from("digital_badges").insert({
    issuance_id: issuance.id,
    badge_name: cred?.name || "Digital Badge",
    description: `Issued to participant on ${issueDate}`,
    verification_url: `/verify/${issuance.credential_id_code}`,
    issued_at: new Date().toISOString(),
  });

  // Audit log
  await supabase.from("credential_audit_logs").insert({
    issuance_id: issuance.id,
    actor_id: params.adminApprovedBy || params.trainerApprovedBy,
    action: "issued",
    new_state: {
      code: issuance.credential_id_code,
      status: "valid",
      issue_date: issueDate,
    },
  });

  return { data: issuance };
}

/**
 * Revoke an issued credential with mandatory reason and immutable audit trail.
 */
export async function revokeCredentialIssuance(
  issuanceId: string,
  reason: string,
  actorId: string
) {
  const supabase = await createClient();

  const { data: previous } = await supabase
    .from("credential_issuances")
    .select("*")
    .eq("id", issuanceId)
    .single();

  if (!previous) {
    return { error: "Issuance record not found" };
  }

  const { data: updated, error } = await supabase
    .from("credential_issuances")
    .update({ status: "revoked" })
    .eq("id", issuanceId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Insert revocation record
  await supabase.from("credential_revocations").insert({
    issuance_id: issuanceId,
    action_type: "revoke",
    reason,
    acted_by: actorId,
  });

  // Audit log
  await supabase.from("credential_audit_logs").insert({
    issuance_id: issuanceId,
    actor_id: actorId,
    action: "revoked",
    previous_state: { status: previous.status },
    new_state: { status: "revoked", reason },
  });

  return { data: updated };
}

/**
 * Renews an expired/expiring credential by creating a traceable new version issuance.
 */
export async function renewCredentialIssuance(
  originalIssuanceId: string,
  actorId: string
) {
  const supabase = await createClient();

  const { data: orig } = await supabase
    .from("credential_issuances")
    .select("*, credentials (*)")
    .eq("id", originalIssuanceId)
    .single();

  if (!orig) {
    return { error: "Original credential not found" };
  }

  const issueRes = await issueCredentialToParticipant({
    participantId: orig.participant_id,
    credentialId: orig.credential_id,
    adminApprovedBy: actorId,
  });

  if (issueRes.error || !issueRes.data) {
    return { error: issueRes.error || "Renewal failed" };
  }

  // Link renewal
  await supabase.from("credential_renewals").insert({
    original_issuance_id: originalIssuanceId,
    new_issuance_id: issueRes.data.id,
    renewed_by: actorId,
  });

  // Audit log
  await supabase.from("credential_audit_logs").insert({
    issuance_id: issueRes.data.id,
    actor_id: actorId,
    action: "renewed",
    previous_state: { original_code: orig.credential_id_code },
    new_state: { new_code: issueRes.data.credential_id_code },
  });

  return { data: issueRes.data };
}
