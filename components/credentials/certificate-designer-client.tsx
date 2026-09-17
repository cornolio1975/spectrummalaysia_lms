"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Palette, 
  ArrowLeft, 
  Save, 
  Eye, 
  Sparkles, 
  QrCode, 
  CheckCircle2, 
  Type, 
  ShieldCheck,
  Award,
  Loader2
} from "lucide-react";
import { saveCertificateTemplate } from "@/app/actions/credentials";
import { toast } from "sonner";

interface Props {
  templates: any[];
}

export function CertificateDesignerClient({ templates }: Props) {
  const [templateName, setTemplateName] = useState("SpectrumMY Distinction Certificate 2026");
  const [issuerName, setIssuerName] = useState("Spectrum Malaysia Learning Institute");
  const [signatoryName, setSignatoryName] = useState("Dato' Dr. Mohd Razak");
  const [signatoryTitle, setSignatoryTitle] = useState("Director of Academic & Professional Standards");
  const [borderStyle, setBorderStyle] = useState<"gold-double" | "navy-modern" | "emerald-sleek">("gold-double");
  const [accentColor, setAccentColor] = useState("#4f46e5");
  const [isDefault, setIsDefault] = useState(true);
  const [saving, setSaving] = useState(false);

  // Mock test fields for live interactive preview
  const [testLearner, setTestLearner] = useState("Muhammad Amirul Bin Azman");
  const [testCredential, setTestCredential] = useState("Micro-Credential in Generative AI & Prompt Engineering");
  const [testCode, setTestCode] = useState("SPM-MC-2026-000042");
  const [testHours, setTestHours] = useState("40");

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("Template name is required");
      return;
    }

    setSaving(true);
    try {
      const templateHtml = `
        <div class="cert-card ${borderStyle}">
          <h1>{{credential_name}}</h1>
          <p class="cert-to">This is proudly awarded to</p>
          <h2 class="cert-recipient">{{learner_name}}</h2>
          <p class="cert-desc">For successfully meeting all academic & competency standards.</p>
          <div class="cert-footer">
            <div>Issue Date: {{issue_date}}</div>
            <div>ID: {{credential_id}}</div>
            <div>Signatory: {{signature_name}}</div>
          </div>
        </div>
      `;

      const res = await saveCertificateTemplate({
        template_name: templateName,
        issuer_name: issuerName,
        signature_name: signatoryName,
        template_html: templateHtml,
        template_css: `.cert-card { border-color: ${accentColor}; }`,
        is_default: isDefault,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Certificate template successfully saved!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/credentials" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Registry
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Template
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Controls & Form */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Palette className="h-5 w-5 text-indigo-600" />
              Certificate Visual Studio
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Customize dynamic placeholders, brand accents, typography & official authorization seals.
            </p>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Issuing Organisation / Body
              </label>
              <input
                type="text"
                value={issuerName}
                onChange={(e) => setIssuerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Signatory Name
                </label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Signatory Title
                </label>
                <input
                  type="text"
                  value={signatoryTitle}
                  onChange={(e) => setSignatoryTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Aesthetic Styles */}
            <div className="pt-3 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                Border & Frame Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBorderStyle("gold-double")}
                  className={`p-2.5 rounded-lg border text-xs font-medium text-center transition ${
                    borderStyle === "gold-double"
                      ? "border-amber-500 bg-amber-50 text-amber-900 font-bold"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Classic Gold
                </button>
                <button
                  type="button"
                  onClick={() => setBorderStyle("navy-modern")}
                  className={`p-2.5 rounded-lg border text-xs font-medium text-center transition ${
                    borderStyle === "navy-modern"
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-bold"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Modern Navy
                </button>
                <button
                  type="button"
                  onClick={() => setBorderStyle("emerald-sleek")}
                  className={`p-2.5 rounded-lg border text-xs font-medium text-center transition ${
                    borderStyle === "emerald-sleek"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Emerald Sleek
                </button>
              </div>
            </div>

            {/* Test Preview Variable inputs */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Preview Data Simulator
              </span>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Learner Recipient</label>
                <input
                  type="text"
                  value={testLearner}
                  onChange={(e) => setTestLearner(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Credential Title</label>
                <input
                  type="text"
                  value={testCredential}
                  onChange={(e) => setTestCredential(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isDefault" className="text-xs text-gray-700 font-medium cursor-pointer">
                Set as default template for all newly issued micro-credentials
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Live Certificate Canvas Preview */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-indigo-600" /> Live Render Preview (Landscape A4 Ratio)
            </span>
            <span>Real-time Dynamic Interpolation</span>
          </div>

          <div
            className={`bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center relative overflow-hidden transition-all duration-300 min-h-[540px] flex flex-col justify-between ${
              borderStyle === "gold-double"
                ? "border-[10px] border-double border-amber-600/80 bg-linear-to-b from-amber-50/10 via-white to-amber-50/20"
                : borderStyle === "navy-modern"
                ? "border-[8px] border-indigo-900 bg-linear-to-b from-indigo-50/10 via-white to-indigo-50/15"
                : "border-[8px] border-emerald-700 bg-linear-to-b from-emerald-50/10 via-white to-emerald-50/15"
            }`}
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-current opacity-40 text-amber-700" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-current opacity-40 text-amber-700" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-current opacity-40 text-amber-700" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-current opacity-40 text-amber-700" />

            {/* Header / Brand */}
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-50 text-indigo-700 mb-1 border border-indigo-100 shadow-xs">
                <Award className="h-7 w-7" />
              </div>
              <p className="text-xs uppercase font-bold tracking-widest text-gray-500">
                {issuerName}
              </p>
              <h2 className="text-3xl font-extrabold tracking-wider text-gray-900 uppercase font-serif">
                Certificate of Competence
              </h2>
              <p className="text-xs text-indigo-600 font-semibold tracking-wide uppercase">
                Enterprise Micro-Credential Verification Framework
              </p>
            </div>

            {/* Recipient */}
            <div className="my-6 space-y-2">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                This acknowledges that
              </p>
              <h3 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 border-b-2 border-gray-200 pb-2 inline-block px-8">
                {testLearner}
              </h3>
              <p className="text-xs text-gray-500 max-w-lg mx-auto pt-2 leading-relaxed">
                has successfully demonstrated proficiency, satisfied rigorous evaluation standards, and fulfilled all practical assessment requirements for
              </p>
              <h4 className="text-xl sm:text-2xl font-extrabold text-indigo-950 font-serif pt-1">
                {testCredential}
              </h4>
            </div>

            {/* Footer Signatures & QR */}
            <div className="grid grid-cols-3 items-end pt-8 border-t border-gray-200/80 text-left">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400">Date of Award</p>
                <p suppressHydrationWarning className="text-xs font-bold text-gray-800 mt-0.5">
                  {new Date().toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">Learning Hours: {testHours} hrs</p>
              </div>

              <div className="text-center flex flex-col items-center">
                <div className="p-1.5 bg-white border border-gray-200 rounded shadow-xs mb-1">
                  {/* Real dynamic QR server image */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=https://spectrum.my/verify/${testCode}&margin=0`}
                    alt="QR Verification"
                    className="w-12 h-12"
                  />
                </div>
                <span className="text-[9px] font-mono text-gray-400">{testCode}</span>
                <span className="text-[8px] uppercase tracking-wider text-emerald-600 font-bold">
                  Verified Authentic
                </span>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="w-32 border-b border-gray-400 mb-1" />
                <p className="text-xs font-bold text-gray-900">{signatoryName}</p>
                <p className="text-[10px] text-gray-500 max-w-[160px] leading-tight mt-0.5">
                  {signatoryTitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
