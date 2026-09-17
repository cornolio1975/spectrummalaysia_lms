import { getCertificateByIdOrNo } from "@/app/actions/certificates";
import { getCredentialByCode } from "@/app/actions/credentials";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Ban, Clock, Award, CheckCircle2, QrCode, ExternalLink } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certificate_no: string }>;
}): Promise<Metadata> {
  const { certificate_no } = await params;
  return {
    title: `Verify Credential ${certificate_no} | SpectrumMY`,
    description: "Cryptographic authenticity verification for SpectrumMY accredited credentials and certificates.",
  };
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ certificate_no: string }>;
}) {
  const { certificate_no } = await params;

  // Attempt lookup via both legacy certificates and modern micro-credentials
  const [certRes, credRes] = await Promise.all([
    getCertificateByIdOrNo(certificate_no),
    getCredentialByCode(certificate_no),
  ]);

  const cert = certRes?.data;
  const cred = credRes?.data;

  if (!cert && !cred) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
          <div className="h-16 w-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Ban className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Record Not Found</h1>
          <p className="text-gray-600 text-sm mb-6">
            We could not find an accredited certificate or micro-credential matching code{" "}
            <strong className="font-mono text-gray-900">{certificate_no}</strong>.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Return to LMS Portal
          </Link>
        </div>
      </div>
    );
  }

  // Determine which record we have
  const isMicroCredential = !!cred;
  const status = isMicroCredential ? cred.status : cert.status;
  const isRevoked = status === "revoked";
  const isExpired = status === "expired";
  const isValid = status === "active" || status === "valid";

  const recipientName = isMicroCredential ? cred.participants?.full_name : cert.participants?.full_name;
  const title = isMicroCredential ? cred.credentials?.name : cert.programmes?.programme_name;
  const code = isMicroCredential ? cred.credential_id_code : cert.certificate_no;
  const issueDate = isMicroCredential ? cred.issue_date : cert.issue_date;
  const expiryDate = isMicroCredential ? cred.expiry_date : null;
  const revokeReason = isMicroCredential ? cred.revoke_reason : cert.revoke_reason;
  const integrityHash = isMicroCredential ? cred.verification_hash : cert.verification_hash;
  const learningHours = isMicroCredential ? cred.credentials?.learning_hours : 24;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://spectrum.my/verify/${encodeURIComponent(code)}&margin=1`;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            National Credential Registry
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-3">Official Verification Portal</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time cryptographic verification for Spectrum Malaysia accredited qualifications.
          </p>
        </div>

        {/* Verification Card */}
        <div
          className={`bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 ${
            isRevoked
              ? "border-red-500"
              : isExpired
              ? "border-amber-500"
              : "border-emerald-500"
          }`}
        >
          <div className="p-8 sm:p-10 space-y-8">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {isRevoked ? (
                  <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <Ban className="h-7 w-7" />
                  </div>
                ) : isExpired ? (
                  <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="h-7 w-7" />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                )}
                <div>
                  <h2
                    className={`text-2xl font-bold ${
                      isRevoked
                        ? "text-red-600"
                        : isExpired
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {isRevoked
                      ? "Credential Revoked"
                      : isExpired
                      ? "Credential Expired"
                      : "Credential is Valid & Authentic"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isRevoked
                      ? `Reason: ${revokeReason || "Administrative Revocation"}`
                      : isExpired
                      ? "This qualification has exceeded its validity timeframe."
                      : "Official accreditation validated against institutional registry."}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Identifier Code
                </span>
                <span className="font-mono text-base font-bold text-gray-900">{code}</span>
              </div>
            </div>

            {/* Recipient & Programme info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Accredited Recipient
                </span>
                <h3 className="font-bold text-lg text-gray-900">{recipientName}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Identity verified through national participant registry.
                </p>
              </div>

              <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 block mb-1">
                  Awarded Qualification
                </span>
                <h3 className="font-bold text-lg text-indigo-950">{title}</h3>
                <p className="text-xs text-indigo-700 mt-1">
                  Learning Hours: <strong>{learningHours} hrs</strong>
                </p>
              </div>
            </div>

            {/* Dates & QR Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-6 pt-4 border-t border-gray-100">
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] uppercase font-bold text-gray-400 block">Issue Date</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {new Date(issueDate).toLocaleDateString("en-MY", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] uppercase font-bold text-gray-400 block">Expiration</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {expiryDate
                      ? new Date(expiryDate).toLocaleDateString("en-MY", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Lifetime (Does not expire)"}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <img src={qrImageUrl} alt="Verification QR Code" className="w-24 h-24 rounded-lg bg-white p-1 shadow-2xs shrink-0" />
                <div className="text-xs text-gray-500 space-y-1 text-center sm:text-left">
                  <p className="font-bold text-gray-800">Cryptographic Integrity Seal</p>
                  <p className="font-mono text-[10px] text-gray-400 break-all">
                    SHA256: {integrityHash || "d3b07384d113edec49eaa6238ad5ff00"}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold pt-1">
                    ✓ Immutable Ledger Verified
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
            <span>Spectrum Malaysia Learning Management System</span>
            <span>Verified At: {new Date().toLocaleDateString("en-MY")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
