"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface CertificateViewClientProps {
  certificate: any;
}

export function CertificateViewClient({ certificate }: CertificateViewClientProps) {
  const [copying, setCopying] = useState(false);

  const snapshot = certificate.snapshot_data || {};
  const learnerName = snapshot.learner_full_name || certificate.participants?.full_name || "Learner Name";
  const courseTitle = snapshot.course_title || certificate.courses?.title || certificate.programmes?.programme_name || "Startup Ready Malaysia";
  const courseCode = snapshot.course_code || certificate.courses?.course_code || "SPM-LMS-MC-001";
  const certNo = certificate.certificate_no;
  const issueDate = snapshot.issue_date || certificate.issue_date;
  const learningHours = snapshot.learning_hours || certificate.learning_hours || 16;
  const assessmentStatus = snapshot.assessment_status || "Assessed Knowledge & Practical Competency";
  const issuerName = snapshot.issuer_name || "Dr. Ahmad Fadzil";
  const issuerTitle = snapshot.issuer_title || "Academic Director & Registrar";
  const issuerOrg = snapshot.issuer_organisation || "Spectrum Malaysia Learning Council";

  const verificationPath = `/verify/certificate/${certNo}`;
  const verificationUrl = typeof window !== "undefined" 
    ? `${window.location.origin}${verificationPath}` 
    : `https://spectrum.my${verificationPath}`;

  const isRevoked = certificate.status === "revoked";
  const isReplaced = certificate.status === "replaced";

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    setCopying(true);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(verificationUrl);
        toast.success("Verification link copied to clipboard!");
      } else {
        prompt("Copy certificate verification link:", verificationUrl);
      }
    } finally {
      setCopying(false);
    }
  };

  return (
    <div className="py-6 px-4 max-w-6xl mx-auto space-y-6">
      
      {/* Top Action Bar (Hidden on Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/certificates"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            ← Back to Certificates
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-mono text-xs text-gray-500 font-semibold">{certNo}</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
            certificate.status === 'issued' ? 'bg-emerald-100 text-emerald-800' :
            certificate.status === 'revoked' ? 'bg-rose-100 text-rose-800' :
            'bg-amber-100 text-amber-800'
          }`}>
            {certificate.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={verificationPath}
            target="_blank"
            className="btn btn-outline btn-sm"
          >
            🔍 Verify Certificate
          </Link>
          <button
            onClick={handleShare}
            className="btn btn-outline btn-sm"
          >
            {copying ? "Copied!" : "📢 Share Credential"}
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <span>📥</span> Download PDF / Print
          </button>
        </div>
      </div>

      {/* Warning Banners if Revoked or Replaced */}
      {isRevoked && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-600 text-rose-800 rounded-r-lg print:hidden">
          <div className="font-bold">⚠️ Certificate Revoked</div>
          <p className="text-sm mt-0.5">
            This certificate was officially revoked on {certificate.revoked_at ? new Date(certificate.revoked_at).toLocaleDateString() : "record"}. Reason: {certificate.revoke_reason || "Administrative revocation"}.
          </p>
        </div>
      )}

      {isReplaced && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-600 text-amber-900 rounded-r-lg print:hidden">
          <div className="font-bold">🔄 Certificate Replaced</div>
          <p className="text-sm mt-0.5">
            This historical certificate was replaced by a newer certificate. Reason: {certificate.replacement_reason || "Updated issuance"}.
          </p>
        </div>
      )}

      {/* A4 Landscape Printable Certificate Canvas */}
      <div className="flex justify-center print:m-0 print:p-0">
        <div
          id="certificate-print-area"
          className="relative bg-[#FCFBF7] text-gray-900 shadow-2xl rounded-sm overflow-hidden select-none print:shadow-none print:rounded-none"
          style={{
            width: "100%",
            maxWidth: "1050px",
            aspectRatio: "1.414 / 1", // Standard A4 Landscape ratio
            padding: "36px",
            boxSizing: "border-box",
            border: "12px solid #1E293B",
          }}
        >
          {/* Inner Ornate Double Border */}
          <div
            className="relative h-full w-full flex flex-col justify-between items-center text-center p-8 border-2 border-[#D4AF37]"
            style={{
              backgroundImage: "radial-gradient(circle at center, rgba(254, 252, 240, 0.95), rgba(248, 244, 227, 0.98))",
            }}
          >
            {/* Watermark Logo in Background */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.035] flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, #D4AF37 10%, transparent 70%)",
              }}
            >
              <span className="text-9xl font-serif font-black">SPM</span>
            </div>

            {/* Revoked Overlay for Print/View */}
            {isRevoked && (
              <div className="absolute inset-0 bg-white/75 z-20 flex items-center justify-center">
                <div className="border-8 border-rose-600 text-rose-600 font-extrabold text-7xl px-12 py-6 rounded-2xl rotate-[-20deg] tracking-widest opacity-80">
                  REVOKED
                </div>
              </div>
            )}

            {/* Header: Logo & Institution */}
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-[#1E293B] text-[#D4AF37] flex items-center justify-center font-serif text-2xl font-bold border-2 border-[#D4AF37] shadow-xs">
                  S
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold tracking-[0.25em] text-[#1E293B] uppercase font-sans">
                    SPECTRUM MALAYSIA
                  </div>
                  <div className="text-[10px] tracking-[0.15em] text-[#D4AF37] uppercase font-semibold font-sans">
                    NATIONAL DIGITAL LEARNING &amp; CREDENTIAL COUNCIL
                  </div>
                </div>
              </div>

              <div className="my-2">
                <h1 className="text-3xl md:text-4xl font-serif font-black tracking-[0.18em] uppercase text-[#1E293B]">
                  Certificate of Achievement
                </h1>
                <div className="h-[2px] w-48 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-2"></div>
              </div>
            </div>

            {/* Body: Recipient & Award Statement */}
            <div className="w-full my-auto py-2">
              <p className="text-sm md:text-base font-serif italic text-gray-600 mb-2">
                This certificate is awarded to
              </p>

              <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#1E293B] tracking-wide border-b border-gray-300 pb-2 inline-block px-8 max-w-2xl truncate">
                {learnerName}
              </h2>

              <p className="text-xs md:text-sm text-gray-600 max-w-2xl mx-auto mt-4 leading-relaxed font-sans">
                for successfully completing the <strong>Startup Ready Malaysia</strong> micro-credential and demonstrating assessed knowledge and practical competency in foundational business startup preparation.
              </p>

              {/* Credential Title & Code Badge */}
              <div className="mt-4 inline-flex flex-col items-center">
                <span className="text-base md:text-xl font-bold font-serif text-[#0F172A] tracking-wide">
                  {courseTitle}
                </span>
                <span className="mt-1 px-3 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#F1F5F9] text-[#334155] border border-gray-200">
                  Course Code: {courseCode} • Micro-Credential MC-001
                </span>
              </div>
            </div>

            {/* Footer: Details, Signatures, and Real Dynamic QR */}
            <div className="w-full grid grid-cols-3 items-end pt-4 border-t border-gray-200/80 text-left">
              
              {/* Left Column: Dates & Hours */}
              <div className="space-y-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider font-sans">Issue Date</span>
                  <span className="text-xs font-semibold text-gray-800 font-sans">
                    {new Date(issueDate).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider font-sans">Learning Hours</span>
                  <span className="text-xs font-semibold text-gray-800 font-sans">{learningHours} Hours (Accredited)</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider font-sans">Assessment</span>
                  <span className="text-xs font-semibold text-emerald-700 font-sans">{assessmentStatus}</span>
                </div>
              </div>

              {/* Center Column: Dynamic QR Code with Public Verification Link */}
              <div className="flex flex-col items-center text-center">
                <div className="p-1.5 bg-white border border-gray-300 rounded shadow-2xs mb-1">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(verificationUrl)}&margin=0`}
                    alt="Certificate QR Verification"
                    className="w-16 h-16 md:w-20 md:h-20"
                  />
                </div>
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Scan to Verify Authenticity</span>
                <span className="font-mono text-[10px] font-bold text-gray-700 tracking-tight">{certNo}</span>
              </div>

              {/* Right Column: Authorised Digital Signature */}
              <div className="text-right space-y-1">
                <div className="inline-block text-center">
                  {/* Digital Signature Calligraphy SVG */}
                  <div className="h-10 flex items-center justify-center font-serif italic text-2xl text-[#1E293B] select-none pr-4">
                    Dr. Ahmad Fadzil
                  </div>
                  <div className="w-44 border-b-2 border-gray-800 mb-1"></div>
                  <div className="text-xs font-bold text-gray-900 font-sans">{issuerName}</div>
                  <div className="text-[10px] text-gray-500 font-sans">{issuerTitle}</div>
                  <div className="text-[9px] text-gray-400 font-sans">{issuerOrg}</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Embedded CSS for Print Styling (A4 Landscape) */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          header, nav, aside, .print\\:hidden {
            display: none !important;
          }
          #certificate-print-area {
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            border: none !important;
            page-break-after: always;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}</style>

    </div>
  );
}
