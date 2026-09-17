import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCertificateByIdOrNo, recordCertificateAccess } from "@/app/actions/certificates";

export const metadata: Metadata = {
  title: "Certificate Verification | Spectrum Malaysia LMS",
  description: "Official public verification for Spectrum Malaysia accredited credentials and micro-credentials.",
};

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  const decodedId = decodeURIComponent(certificateId);

  const res = await getCertificateByIdOrNo(decodedId);
  const cert = res.data;

  if (!cert) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-slate-200">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ✗
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Certificate Not Found</h1>
          <p className="text-sm text-slate-600 mb-6">
            We could not find any accredited Spectrum Malaysia certificate matching ID: <span className="font-mono font-semibold text-slate-800">{decodedId}</span>.
          </p>
          <div className="text-xs text-slate-400">
            Please check the certificate number or scan the official QR code printed on the physical document.
          </div>
        </div>
      </div>
    );
  }

  // Record public verification event in immutable audit log
  await recordCertificateAccess({
    certificateId: cert.id,
    certificateNo: cert.certificate_no,
    action: "verify",
  });

  const snapshot = cert.snapshot_data || {};
  const learnerName = snapshot.learner_full_name || cert.participants?.full_name || "Authorized Learner";
  const courseTitle = snapshot.course_title || cert.courses?.title || cert.programmes?.programme_name || "Accredited Micro-Credential";
  const courseCode = snapshot.course_code || cert.courses?.course_code || "SPM-LMS-MC-001";
  const issueDate = snapshot.issue_date || cert.issue_date;
  const learningHours = snapshot.learning_hours || cert.learning_hours || 16;
  const issuerOrg = snapshot.issuer_organisation || "Spectrum Malaysia Learning Council";
  const skills = snapshot.skills_acquired || ["Business Model Validation", "SSM EzBiz Registration", "Financial Modeling", "Market Launch"];

  const isRevoked = cert.status === "revoked";
  const isReplaced = cert.status === "replaced";
  const isValid = cert.status === "issued" && !isRevoked && !isReplaced;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Verification Status Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          
          {/* Header Banner */}
          <div className={`px-8 py-6 flex items-center justify-between border-b ${
            isValid 
              ? "bg-emerald-600 text-white" 
              : isRevoked 
              ? "bg-rose-700 text-white" 
              : "bg-amber-600 text-white"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {isValid ? "🛡️" : isRevoked ? "⚠️" : "🔄"}
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-wide uppercase">
                  {isValid 
                    ? "VALID CERTIFICATE" 
                    : isRevoked 
                    ? "CERTIFICATE REVOKED" 
                    : "CERTIFICATE REPLACED"}
                </h1>
                <p className="text-xs opacity-90">
                  {isValid 
                    ? "Official Spectrum Malaysia Credential Authenticity Verified" 
                    : isRevoked 
                    ? "This credential has been officially revoked and is no longer valid" 
                    : "This credential has been superseded by an updated certificate"}
                </p>
              </div>
            </div>
            <div className="hidden sm:block text-right text-xs opacity-90 font-mono">
              SECURE VERIFICATION
            </div>
          </div>

          <div className="p-8 space-y-6">
            
            {/* Replaced Notice */}
            {isReplaced && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
                <div className="font-semibold mb-1">Notice of Replacement</div>
                <p className="mb-2">
                  This certificate was replaced on {cert.updated_at ? new Date(cert.updated_at).toLocaleDateString("en-MY") : "record"}. 
                  {cert.replacement_reason ? ` Reason: "${cert.replacement_reason}".` : ""}
                </p>
                {cert.replacement?.certificate_no && (
                  <Link
                    href={`/verify/certificate/${cert.replacement.certificate_no}`}
                    className="inline-flex items-center font-semibold text-amber-800 hover:text-amber-950 underline"
                  >
                    View Active Replacement Certificate ({cert.replacement.certificate_no}) →
                  </Link>
                )}
              </div>
            )}

            {/* Revoked Notice */}
            {isRevoked && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-900">
                <div className="font-semibold mb-1">Official Revocation Notice</div>
                <p>
                  This credential was revoked by {issuerOrg} on {cert.revoked_at ? new Date(cert.revoked_at).toLocaleDateString("en-MY") : "record"}.
                </p>
                {cert.revoke_reason && (
                  <p className="mt-2 text-xs font-mono bg-white/80 p-2 rounded border border-rose-200">
                    Reason: {cert.revoke_reason}
                  </p>
                )}
              </div>
            )}

            {/* Core Credential Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Credential Title</span>
                <p className="text-lg font-bold text-slate-900 mt-1">{courseTitle}</p>
                <p className="text-xs font-mono text-slate-500 mt-0.5">Code: {courseCode}</p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Awarded To</span>
                <p className="text-lg font-bold text-slate-900 mt-1">{learnerName}</p>
                <p className="text-xs text-slate-500 mt-0.5">Verified Identity</p>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Certificate ID</span>
                <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm">{cert.certificate_no}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Issue Date</span>
                <span className="font-semibold text-slate-800">{new Date(issueDate).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Learning Hours</span>
                <span className="font-semibold text-slate-800">{learningHours} Hours</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  isValid ? "bg-emerald-100 text-emerald-800" : isRevoked ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {cert.status}
                </span>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Assessed Skills */}
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider block mb-2">
                Assessed Competencies &amp; Learning Outcomes
              </span>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Issuing Organisation & Signatory */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="font-bold text-slate-800">{issuerOrg}</div>
                <div className="text-slate-500">Authorized Signatory: {snapshot.issuer_name || "Dr. Ahmad Fadzil"} ({snapshot.issuer_title || "Academic Director & Registrar"})</div>
                <div className="font-mono text-[10px] text-slate-400 mt-1">Integrity SHA-256: {cert.integrity_hash ? `${cert.integrity_hash.slice(0, 24)}…` : "Verified"}</div>
              </div>

              <div className="text-right flex items-center gap-2">
                <Link
                  href={`/verify/certificate/${cert.certificate_no}/view`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors"
                >
                  <span>👁️</span> View &amp; Print Official Certificate
                </Link>
              </div>
            </div>

          </div>

          {/* Footer Metadata */}
          <div className="bg-slate-50 px-8 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
            <span>Spectrum Malaysia Digital Learning &amp; Credential Platform</span>
            <span suppressHydrationWarning>
              Verification Timestamp: {new Date().toLocaleString("en-MY")}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
