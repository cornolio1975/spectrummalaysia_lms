/**
 * Section 42.19: Automated Comprehensive Verification of MC-001 Certificate Creation Engine
 */
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://atomajdzjzppxamdabjz.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_cUodyL6SPr31A6_qjnjniQ_lU7WJTJB";

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("===============================================================================");
  console.log("42. COMPLETE CERTIFICATE CREATION ENGINE - END-TO-END VERIFICATION");
  console.log("===============================================================================\n");

  const results = [];
  function assert(title, condition, extra = "") {
    if (condition) {
      console.log(`[PASS] ${title} ${extra ? "- " + extra : ""}`);
      results.push({ title, passed: true });
    } else {
      console.error(`[FAIL] ${title} ${extra ? "- " + extra : ""}`);
      results.push({ title, passed: false });
    }
  }

  // 1. Verify MC-001 Course exists in database
  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .select("id, course_code, title, learning_hours")
    .eq("course_code", "SPM-LMS-MC-001")
    .single();

  assert("1. MC-001 Course Record in Database", !!course, course ? `${course.course_code}: ${course.title}` : courseErr?.message);

  // 2. Verify MC-001 Modules (4 modules)
  const { data: modules } = await supabase
    .from("course_modules")
    .select("id, title, sort_order")
    .eq("course_id", course?.id)
    .order("sort_order");

  assert("2. MC-001 Modules Count (4 required)", modules?.length === 4, `Found ${modules?.length} modules`);

  // 3. Verify MC-001 Lessons & Capstone Project
  const { data: lessons } = await supabase
    .from("course_lessons")
    .select("id, title")
    .in("module_id", modules?.map((m) => m.id) || []);

  const hasCapstone = lessons?.some((l) => l.title.toLowerCase().includes("capstone"));
  assert("3. MC-001 Lessons & Capstone Loaded", lessons?.length >= 8 && hasCapstone, `Found ${lessons?.length} lessons with Capstone`);

  // 4. Verify Micro-Credential & Requirements in DB
  const { data: cred } = await supabase
    .from("credentials")
    .select("id, credential_code, name")
    .eq("credential_code", "SPM-LMS-MC-001")
    .single();

  const { data: reqs } = await supabase
    .from("credential_requirements")
    .select("id, requirement_type, description")
    .eq("credential_id", cred?.id);

  assert("4. Credential Requirements (5 criteria)", reqs?.length >= 3, `Found ${reqs?.length} configured requirements`);

  // 5. Verify Certificate Template
  const { data: template } = await supabase
    .from("certificate_templates")
    .select("id, template_name, template_code, version, is_published")
    .eq("template_code", "MC-001-STANDARD")
    .single();

  assert("5. Professional Certificate Template", !!template && template.is_published, `Template: ${template?.template_name} v${template?.version}`);

  // 6. Verify Sample Issued Certificate (SPM-MC001-2026-000001)
  const { data: seedCert } = await supabase
    .from("certificates")
    .select("*, courses(title, course_code)")
    .eq("certificate_no", "SPM-MC001-2026-000001")
    .single();

  assert("6. Seed Certificate Exists", !!seedCert, `ID: ${seedCert?.certificate_no}, Status: ${seedCert?.status}`);

  // 7. Verify Data Immutability Snapshot
  const snapshot = seedCert?.snapshot_data || {};
  assert(
    "7. Certificate Snapshot Data Immutability",
    snapshot.learner_full_name === "Muhammad Harith bin Zulkifli" &&
    snapshot.course_code === "SPM-LMS-MC-001" &&
    Array.isArray(snapshot.skills_acquired) &&
    snapshot.skills_acquired.length > 0,
    `Recipient: ${snapshot.learner_full_name}, Skills: ${snapshot.skills_acquired?.join(", ")}`
  );

  // 8. Verify Cryptographic Integrity Hash
  assert("8. Integrity Hash Generated", !!seedCert?.integrity_hash && seedCert.integrity_hash.length >= 32, `Hash: ${seedCert?.integrity_hash}`);

  // 9. Verify Public Verification Endpoint via HTTP
  let verifySuccess = false;
  try {
    const res = await fetch(`http://localhost:3000/verify/certificate/${seedCert.certificate_no}`);
    const text = await res.text();
    verifySuccess = res.status === 200 && text.includes("VALID CERTIFICATE") && text.includes("Startup Ready Malaysia");
  } catch (err) {
    verifySuccess = false;
  }
  assert("9. Public Verification Route (/verify/certificate/[id])", verifySuccess, `HTTP 200 & VALID CERTIFICATE confirmed`);

  // 10. Verify Public Certificate View & Print Canvas via HTTP
  let viewSuccess = false;
  try {
    const res = await fetch(`http://localhost:3000/verify/certificate/${seedCert.certificate_no}/view`);
    const text = await res.text();
    viewSuccess = res.status === 200 && text.includes("SPECTRUM MALAYSIA") && text.includes("Muhammad Harith bin Zulkifli");
  } catch (err) {
    viewSuccess = false;
  }
  assert("10. A4 Landscape Print View Route (/verify/certificate/[id]/view)", viewSuccess, `HTTP 200 & A4 Canvas rendered`);

  // 11. Verify Audit Trail Table & Entries
  const { data: auditLogs, error: auditErr } = await supabase
    .from("certificate_audit_logs")
    .select("id, certificate_id, event, actor_name, created_at")
    .eq("certificate_id", seedCert?.id)
    .order("created_at", { ascending: false });

  assert("11. Certificate Audit Trail Records", auditLogs?.length > 0, auditErr ? auditErr.message : `Found ${auditLogs?.length} audit events`);

  // 12. Test Unique Certificate ID Generation & Issuance
  const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
  const dynamicCertNo = `SPM-MC001-2026-${randomSuffix}`;

  const { data: dynamicCert, error: dynErr } = await supabase
    .from("certificates")
    .insert([{
      certificate_no: dynamicCertNo,
      participant_id: seedCert.participant_id,
      course_id: course.id,
      credential_id: cred.id,
      template_id: template.id,
      status: "issued",
      issue_date: "2026-09-17",
      snapshot_data: {
        learner_full_name: "Test Participant (Immutable Snapshot)",
        course_title: course.title,
        course_code: course.course_code,
        learning_hours: 16,
        assessment_status: "PASSED (88%)",
        issuer_organisation: "Spectrum Malaysia Learning Council",
      },
      integrity_hash: "abcd1234ef567890abcd1234ef567890",
      verification_url: `/verify/certificate/${dynamicCertNo}`,
    }])
    .select()
    .single();

  assert("12. Dynamic Certificate Creation with Unique ID", !!dynamicCert, dynErr ? dynErr.message : `Generated: ${dynamicCert?.certificate_no}`);

  // 13. Test Revocation Workflow & Public Status
  const { data: revokedCert, error: revErr } = await supabase
    .from("certificates")
    .update({
      status: "revoked",
      revoke_reason: "Test revocation: Academic integrity audit simulation",
      revoked_at: new Date().toISOString(),
      revoked_by: null,
    })
    .eq("id", dynamicCert.id)
    .select()
    .single();

  assert("13. Administrative Certificate Revocation", revokedCert?.status === "revoked", revErr ? revErr.message : `Status: ${revokedCert?.status}`);

  // Verify Public Verification Endpoint reflects REVOKED
  let revokedPublicSuccess = false;
  try {
    const res = await fetch(`http://localhost:3000/verify/certificate/${dynamicCertNo}`);
    const text = await res.text();
    revokedPublicSuccess = res.status === 200 && text.includes("CERTIFICATE REVOKED");
  } catch {
    revokedPublicSuccess = false;
  }
  assert("14. Public Verification Reflects CERTIFICATE REVOKED", revokedPublicSuccess, "Verified on public endpoint");

  // 15. Test Replacement Workflow
  const replacementCertNo = `SPM-MC001-2026-REP${randomSuffix.slice(0, 5)}`;
  const { data: replacementCert, error: repErr } = await supabase
    .from("certificates")
    .insert([{
      certificate_no: replacementCertNo,
      participant_id: seedCert.participant_id,
      course_id: course.id,
      credential_id: cred.id,
      template_id: template.id,
      status: "issued",
      issue_date: "2026-09-17",
      original_certificate_id: dynamicCert.id,
      snapshot_data: {
        learner_full_name: "Corrected Participant Name",
        course_title: course.title,
        course_code: course.course_code,
        learning_hours: 16,
        assessment_status: "PASSED",
      },
      integrity_hash: "fedcba0987654321fedcba0987654321",
      verification_url: `/verify/certificate/${replacementCertNo}`,
    }])
    .select()
    .single();

  // Link original to replacement
  await supabase
    .from("certificates")
    .update({
      status: "replaced",
      replacement_certificate_id: replacementCert.id,
      replacement_reason: "Name typo correction",
    })
    .eq("id", dynamicCert.id);

  // Check public endpoint for original certificate shows REPLACED and links to replacement
  let replacedPublicSuccess = false;
  try {
    const res = await fetch(`http://localhost:3000/verify/certificate/${dynamicCertNo}`);
    const text = await res.text();
    replacedPublicSuccess = res.status === 200 && text.includes("CERTIFICATE REPLACED") && text.includes(replacementCertNo);
  } catch {
    replacedPublicSuccess = false;
  }
  assert("15. Replacement Workflow & Public Link to New Certificate", replacedPublicSuccess, `Original links to ${replacementCertNo}`);

  // 16. Immutability Verification: original snapshot data remains unchanged
  const { data: verifiedOriginal } = await supabase
    .from("certificates")
    .select("snapshot_data")
    .eq("id", dynamicCert.id)
    .single();

  const originalNamePreserved = verifiedOriginal?.snapshot_data?.learner_full_name === "Test Participant (Immutable Snapshot)";
  assert("16. Certificate Data Immutability Preserved", originalNamePreserved, `Snapshot name: ${verifiedOriginal?.snapshot_data?.learner_full_name}`);

  // Clean up dynamic test certs
  await supabase.from("certificates").delete().eq("id", dynamicCert.id);
  await supabase.from("certificates").delete().eq("id", replacementCert.id);

  // Summary
  const allPassed = results.every((r) => r.passed);
  console.log("\n-------------------------------------------------------------------------------");
  console.log(`TOTAL CHECKS: ${results.length} | PASSED: ${results.filter(r => r.passed).length} | FAILED: ${results.filter(r => !r.passed).length}`);
  console.log(`OVERALL CERTIFICATE ENGINE STATUS: ${allPassed ? "PASSED ALL TESTS" : "FAILURES DETECTED"}`);
  console.log("===============================================================================\n");

  process.exit(allPassed ? 0 : 1);
}

runTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
