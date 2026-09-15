import { getCertificateByNo } from "@/app/actions/certificates";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ certificate_no: string }> }): Promise<Metadata> {
  // Await the params object
  const { certificate_no } = await params;
  return {
    title: `Verify Certificate ${certificate_no} | SpectrumMY`,
    description: "Verify the authenticity of a SpectrumMY certificate."
  };
}

export default async function VerifyCertificatePage({ params }: { params: Promise<{ certificate_no: string }> }) {
  // Await the params object
  const { certificate_no } = await params;
  
  const certRes = await getCertificateByNo(certificate_no);

  if (certRes.error || !certRes.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border-t-4 border-red-500">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
          <p className="text-gray-600 mb-6">
            We could not find a certificate matching the number <strong className="font-mono">{certificate_no}</strong>.
          </p>
          <a href="/" className="text-primary-600 hover:underline font-medium">Return to Homepage</a>
        </div>
      </div>
    );
  }

  const cert = certRes.data;
  const isRevoked = cert.status === 'revoked';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Certificate Verification</h1>
          <p className="mt-2 text-gray-600">Official verification portal for SpectrumMY LMS</p>
        </div>

        <div className={`bg-white rounded-xl shadow-lg overflow-hidden border-t-8 ${isRevoked ? 'border-red-500' : 'border-green-500'}`}>
          <div className="p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              
              {/* Status Header */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {isRevoked ? (
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-100 text-red-600 text-xl">❌</span>
                  ) : (
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-100 text-green-600 text-xl">✅</span>
                  )}
                  <h2 className={`text-2xl font-bold ${isRevoked ? 'text-red-600' : 'text-green-600'}`}>
                    {isRevoked ? 'Certificate Revoked' : 'Certificate is Valid'}
                  </h2>
                </div>
                {isRevoked && (
                  <p className="text-sm text-red-500 font-medium ml-13 mt-1">
                    Reason: {cert.revoke_reason || "Administrative Revocation"}
                  </p>
                )}
                {!isRevoked && (
                  <p className="text-sm text-gray-500 ml-13 mt-1">
                    This certificate is official and recognized by SpectrumMY.
                  </p>
                )}
              </div>

              {/* Certificate No */}
              <div className="text-left md:text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Certificate Number</p>
                <p className="font-mono text-lg font-bold text-gray-900">{cert.certificate_no}</p>
                <p className="text-xs text-gray-500 mt-1">Issued: {new Date(cert.issue_date).toLocaleDateString()}</p>
              </div>
            </div>

            <hr className="my-8 border-gray-100" />

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Participant Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-semibold text-lg text-gray-900">{cert.participants?.full_name}</p>
                  <p className="text-sm text-gray-600 mt-1">{cert.participants?.phone || "No phone registered"}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Programme Completed</h3>
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                  <p className="font-semibold text-lg text-primary-900">{cert.programmes?.programme_name}</p>
                  <p className="text-sm text-primary-700 mt-1 font-mono">{cert.programmes?.programme_code}</p>
                </div>
              </div>
            </div>

          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>Verified securely via SpectrumMY Blockchain / Database</p>
            <p>Date Verified: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
