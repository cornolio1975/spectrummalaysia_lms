"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Award, 
  ShieldCheck, 
  QrCode, 
  Share2, 
  Printer, 
  ExternalLink, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Ban, 
  Download,
  Copy,
  Sparkles,
  FileCheck,
  Eye,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  issuances: any[];
  certificates?: any[];
}

export function LearnerWalletClient({ issuances = [], certificates = [] }: Props) {
  const [activeTab, setActiveTab] = useState<"certificates" | "credentials">(
    certificates.length > 0 ? "certificates" : "credentials"
  );
  const [selectedIssuance, setSelectedIssuance] = useState<any | null>(null);
  const [selectedCertForQr, setSelectedCertForQr] = useState<any | null>(null);

  const copyToClipboard = (text: string, label: string = "Verification link") => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } else {
      toast.error("Clipboard access not available");
    }
  };

  const handleShare = async (cert: any) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://spectrum.my";
    const verifyUrl = `${origin}/verify/certificate/${cert.certificate_no}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Spectrum Malaysia Certificate - ${cert.certificate_no}`,
          text: `Verified Certificate for ${cert.snapshot_data?.credential_title || cert.snapshot_data?.course_title || "Micro-Credential"} awarded to ${cert.snapshot_data?.learner_full_name || cert.participants?.full_name}`,
          url: verifyUrl,
        });
      } catch {
        copyToClipboard(verifyUrl, "Certificate link");
      }
    } else {
      copyToClipboard(verifyUrl, "Certificate link");
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Banner */}
      <div className="bg-linear-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-3 border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Accredited Micro-Credential &amp; Certificate Vault
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Credentials &amp; Wallet</h1>
          <p className="text-indigo-100 text-sm mt-2 leading-relaxed">
            Your tamper-proof digital certificates of achievement, accredited micro-credentials, and cryptographic verification records.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
          <div>
            <span className="text-indigo-200 block">Issued Certificates</span>
            <span className="text-2xl font-bold text-amber-300 mt-1 block">{certificates.length}</span>
          </div>
          <div>
            <span className="text-indigo-200 block">Digital Badges</span>
            <span className="text-2xl font-bold text-white mt-1 block">{issuances.length}</span>
          </div>
          <div>
            <span className="text-indigo-200 block">Active &amp; Verified</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">
              {certificates.filter((c) => c.status === "issued").length + issuances.filter((i) => i.status === "active").length}
            </span>
          </div>
          <div>
            <span className="text-indigo-200 block">Completed Hours</span>
            <span className="text-2xl font-bold text-indigo-300 mt-1 block">
              {certificates.reduce((sum, c) => sum + (Number(c.snapshot_data?.learning_hours) || 40), 0)} hrs
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (My Credentials -> Certificates) */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("certificates")}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === "certificates"
              ? "border-amber-500 text-amber-700 bg-amber-50/50 rounded-t-lg"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileCheck className="h-4 w-4 text-amber-600" />
          Certificates ({certificates.length})
        </button>
        <button
          onClick={() => setActiveTab("credentials")}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === "credentials"
              ? "border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Award className="h-4 w-4 text-indigo-600" />
          Digital Badges &amp; Credentials ({issuances.length})
        </button>
      </div>

      {/* TAB 1: CERTIFICATES */}
      {activeTab === "certificates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-amber-600" />
              Official Certificates of Achievement ({certificates.length})
            </h2>
            <Link
              href="/verify/certificate"
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-medium"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Public Certificate Verification
            </Link>
          </div>

          {certificates.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-medium text-gray-700">No Certificates Issued Yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Complete all course modules, pass all quizzes (≥80%), and complete the required practical capstone project to unlock automatic certificate issuance.
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
              >
                Go to My Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => {
                const snapshot = cert.snapshot_data || {};
                const courseTitle = snapshot.course_title || snapshot.credential_title || cert.courses?.title || "Startup Ready Malaysia";
                const learnerName = snapshot.learner_full_name || cert.participants?.full_name || "Learner";
                const isRevoked = cert.status === "revoked";
                const isReplaced = cert.status === "replaced";
                const isIssued = cert.status === "issued" || !cert.status;
                const origin = typeof window !== "undefined" ? window.location.origin : "https://spectrum.my";
                const verifyUrl = `${origin}/verify/certificate/${cert.certificate_no}`;

                return (
                  <div
                    key={cert.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-5">
                      {/* Status header */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                          {cert.certificate_no}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isRevoked
                              ? "bg-red-100 text-red-800"
                              : isReplaced
                              ? "bg-gray-100 text-gray-700"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isRevoked ? (
                            <>
                              <Ban className="h-3 w-3" /> Revoked
                            </>
                          ) : isReplaced ? (
                            <>
                              <RefreshCw className="h-3 w-3" /> Replaced
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Issued
                            </>
                          )}
                        </span>
                      </div>

                      {/* Certificate Thumbnail Preview Card */}
                      <div className="my-3 relative rounded-xl overflow-hidden border-2 border-amber-300/80 bg-linear-to-b from-amber-50/70 via-stone-50 to-amber-50/70 p-3.5 shadow-inner text-center">
                        <div className="border border-dashed border-amber-400/60 rounded-lg p-3">
                          <div className="flex items-center justify-center gap-1 text-[9px] tracking-widest font-serif font-black text-amber-900 uppercase">
                            <span>⚜</span> SPECTRUM MALAYSIA <span>⚜</span>
                          </div>
                          <div className="text-[10px] font-sans font-extrabold uppercase text-slate-700 tracking-wider mt-0.5">
                            Certificate of Achievement
                          </div>
                          <div className="text-[8px] text-slate-500 italic mt-1">Awarded to</div>
                          <div className="text-xs font-serif font-bold text-slate-900 truncate px-2">
                            {learnerName}
                          </div>
                          <div className="text-[10px] font-sans font-semibold text-amber-800 line-clamp-1 mt-1">
                            {courseTitle}
                          </div>
                          <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[8px] text-slate-500 px-1">
                            <span>{new Date(cert.issue_date || cert.created_at).toLocaleDateString()}</span>
                            <span className="font-mono text-[7px] text-slate-400 truncate max-w-[110px]">
                              {cert.certificate_no}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Credential Name and Info */}
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                          {courseTitle}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Micro-Credential Code: <span className="font-mono font-medium text-indigo-600">{snapshot.course_code || "SPM-LMS-MC-001"}</span>
                        </p>
                      </div>

                      {/* Dates */}
                      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Issue Date</span>
                          <span className="font-medium text-gray-700">
                            {new Date(cert.issue_date || cert.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Learning Hours</span>
                          <span className="font-medium text-gray-700">
                            {snapshot.learning_hours || 40} Hours
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar (View, Download, Verify, Share) */}
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-1 text-xs">
                      <Link
                        href={`/certificates/${cert.id}/view`}
                        className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 transition px-2 py-1 rounded-md hover:bg-amber-100/60"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>

                      <Link
                        href={`/certificates/${cert.id}/view?print=true`}
                        className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 transition px-2 py-1 rounded-md hover:bg-slate-200/60"
                      >
                        <Download className="h-3.5 w-3.5" /> PDF
                      </Link>

                      <div className="flex items-center gap-1">
                        <Link
                          href={`/verify/certificate/${cert.certificate_no}`}
                          target="_blank"
                          title="Verify Certificate"
                          className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        </Link>
                        <button
                          onClick={() => handleShare(cert)}
                          title="Share Certificate"
                          className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition"
                        >
                          <Share2 className="h-3.5 w-3.5 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => setSelectedCertForQr(cert)}
                          title="QR Verification Code"
                          className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition"
                        >
                          <QrCode className="h-3.5 w-3.5 text-slate-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREDENTIALS & BADGES */}
      {activeTab === "credentials" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-600" />
            Accredited Micro-Credentials &amp; Badges ({issuances.length})
          </h2>

          {issuances.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-medium text-gray-700">No Credentials in Your Wallet Yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Complete required courses, pass quizzes and practical capstone assessments to automatically earn verified micro-credentials.
              </p>
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
              >
                Browse Training Catalogue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issuances.map((issuance) => {
                const cred = issuance.credentials;
                const isRevoked = issuance.status === "revoked";
                const isExpired = issuance.status === "expired";
                const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : "https://spectrum.my"}/verify/${issuance.credential_id_code}`;

                return (
                  <div
                    key={issuance.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                          {issuance.credential_id_code}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isRevoked
                              ? "bg-red-100 text-red-800"
                              : isExpired
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isRevoked ? (
                            <>
                              <Ban className="h-3 w-3" /> Revoked
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Verified
                            </>
                          )}
                        </span>
                      </div>

                      {/* Badge / Emblem Visual */}
                      <div className="my-4 flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                          <Award className="h-9 w-9" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {cred?.credential_type?.replace("_", " ")}
                          </span>
                          <h3 className="font-bold text-gray-900 text-base leading-snug">
                            {cred?.name}
                          </h3>
                          <span className="text-xs text-indigo-600 font-medium capitalize">
                            {cred?.level} Level • {cred?.learning_hours} hrs
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-2 mt-2">
                        {cred?.description}
                      </p>

                      {/* Issue Metadata */}
                      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                        <div>
                          <span className="text-gray-400 block">Issued On</span>
                          <span className="font-medium text-gray-700">
                            {new Date(issuance.issue_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Expires</span>
                          <span className="font-medium text-gray-700">
                            {issuance.expiry_date
                              ? new Date(issuance.expiry_date).toLocaleDateString()
                              : "Never"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="bg-gray-50 px-6 py-3.5 border-t border-gray-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => setSelectedIssuance(issuance)}
                        className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-800 transition"
                      >
                        <QrCode className="h-3.5 w-3.5" /> View QR Pass
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(verifyUrl, "Verification URL")}
                          title="Copy Shareable Verification Link"
                          className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 transition"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                        <Link
                          href={`/verify/${issuance.credential_id_code}`}
                          target="_blank"
                          className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 transition"
                          title="Open Public Verification"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* QR Pass Modal for Credentials */}
      {selectedIssuance && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedIssuance(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>

            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto">
              <Award className="h-8 w-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded">
                {selectedIssuance.credential_id_code}
              </span>
              <h3 className="font-bold text-gray-900 text-lg mt-2">
                {selectedIssuance.credentials?.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Recipient: {selectedIssuance.participants?.full_name}
              </p>
            </div>

            {/* Dynamic QR Code */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 inline-block mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://spectrum.my/verify/${selectedIssuance.credential_id_code}&margin=0`}
                alt="QR Code"
                className="w-44 h-44 rounded-lg"
              />
            </div>

            <p className="text-[11px] text-gray-400">
              Scan with any mobile camera to instantly verify cryptographic integrity.
            </p>

            <div className="pt-2 flex gap-2">
              <Link
                href={`/verify/${selectedIssuance.credential_id_code}`}
                target="_blank"
                className="flex-1 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
              >
                Open Verification Page
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal for Certificates */}
      {selectedCertForQr && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedCertForQr(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
            >
              ✕
            </button>

            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-amber-50 text-amber-700 mx-auto">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                {selectedCertForQr.certificate_no}
              </span>
              <h3 className="font-bold text-gray-900 text-base mt-2">
                {selectedCertForQr.snapshot_data?.course_title || selectedCertForQr.snapshot_data?.credential_title || "Startup Ready Malaysia"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Recipient: {selectedCertForQr.snapshot_data?.learner_full_name || selectedCertForQr.participants?.full_name}
              </p>
            </div>

            {/* Dynamic QR Code targeting /verify/certificate/[certificateId] */}
            <div className="p-4 bg-white rounded-xl border border-gray-200 inline-block mx-auto shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  (typeof window !== "undefined" ? window.location.origin : "https://spectrum.my") +
                  `/verify/certificate/${selectedCertForQr.certificate_no}`
                )}&margin=0`}
                alt="Certificate Verification QR"
                className="w-44 h-44 rounded-lg"
              />
            </div>

            <p className="text-[11px] text-gray-400">
              Direct verification at <span className="font-mono text-indigo-600">/verify/certificate/{selectedCertForQr.certificate_no}</span>
            </p>

            <div className="pt-2 flex gap-2">
              <Link
                href={`/verify/certificate/${selectedCertForQr.certificate_no}`}
                target="_blank"
                className="flex-1 py-2 text-xs font-semibold text-white bg-amber-800 rounded-lg hover:bg-amber-900 transition"
              >
                Open Verification Page
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
