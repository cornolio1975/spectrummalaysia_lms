import { getCertificates } from "@/app/actions/certificates";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { PrintButton } from "@/components/ui/print-button";

export default async function ViewCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // We don't have a direct getCertificateById exported right now, let's fetch directly.
  const supabase = await createClient();
  const { data: cert, error } = await supabase
    .from("certificates")
    .select(`
      *,
      participants (full_name),
      programmes (programme_name, programme_code)
    `)
    .eq("id", id)
    .single();

  if (error || !cert) {
    notFound();
  }

  // Typically we'd generate a real QR code image here. 
  // For MVP, we'll display the link visually.

  return (
    <div className="max-w-5xl mx-auto py-8 print:py-0">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Link href="/certificates" className="text-primary-600 hover:underline">
          ← Back to Certificates
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white border-[12px] border-double border-primary-900 rounded-lg p-16 text-center shadow-2xl print:shadow-none print:border-gray-800 relative min-h-[700px] flex flex-col justify-center">
        
        {cert.status === 'revoked' && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <h1 className="text-6xl font-bold text-red-600 border-8 border-red-600 p-8 rounded-xl rotate-[-15deg] opacity-70">
              REVOKED
            </h1>
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-primary-900 tracking-widest uppercase print:text-gray-900">
            Certificate of Completion
          </h2>
          <p className="text-lg text-gray-500 mt-2 font-medium tracking-wide">
            SpectrumMY Programme & Learning Management System
          </p>
        </div>

        <div className="mb-8">
          <p className="text-xl text-gray-600 italic mb-4">This is to certify that</p>
          <h3 className="text-5xl font-bold text-gray-900 font-serif border-b-2 border-gray-300 pb-2 inline-block px-12">
            {cert.participants?.full_name}
          </h3>
        </div>

        <div className="mb-16">
          <p className="text-xl text-gray-600 italic mb-4">has successfully completed the programme</p>
          <h4 className="text-3xl font-bold text-primary-800 print:text-gray-800">
            {cert.programmes?.programme_name}
          </h4>
          <p className="text-sm font-mono text-gray-400 mt-2">
            Programme Code: {cert.programmes?.programme_code}
          </p>
        </div>

        <div className="flex justify-between items-end mt-auto pt-16 border-t border-gray-200">
          <div className="text-left">
            <p className="font-semibold text-lg text-gray-900">Issue Date</p>
            <p className="text-gray-600">{new Date(cert.issue_date).toLocaleDateString()}</p>
          </div>

          <div className="text-center">
            {/* MVP Placeholder for QR Code */}
            <div className="w-24 h-24 bg-gray-100 border border-gray-300 mx-auto flex items-center justify-center text-xs text-gray-400 mb-2">
              [QR CODE]
            </div>
            <p className="text-xs text-gray-500">Scan to verify</p>
            <p className="text-xs font-mono text-gray-400 mt-1">{cert.certificate_no}</p>
          </div>

          <div className="text-right">
            <div className="w-48 border-b-2 border-gray-800 mb-2 mx-auto"></div>
            <p className="font-semibold text-lg text-gray-900">Authorized Signature</p>
            <p className="text-gray-600 text-sm">SpectrumMY Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
