import { notFound } from "next/navigation";
import { getCertificateByIdOrNo, recordCertificateAccess } from "@/app/actions/certificates";
import { CertificateViewClient } from "@/components/certificates/certificate-view-client";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}): Promise<Metadata> {
  const { certificateId } = await params;
  const decodedId = decodeURIComponent(certificateId);
  const res = await getCertificateByIdOrNo(decodedId);
  const cert = res.data;

  if (!cert) {
    return { title: "Certificate View | Spectrum Malaysia LMS" };
  }

  const snapshot = cert.snapshot_data || {};
  const courseTitle = snapshot.course_title || "Micro-Credential";
  const learner = snapshot.learner_full_name || "Learner";

  return {
    title: `${courseTitle} - ${learner} | Spectrum Malaysia LMS`,
    description: `Official Certificate of Achievement for ${learner} (${cert.certificate_no}).`,
  };
}

export default async function PublicCertificateViewPage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  const decodedId = decodeURIComponent(certificateId);

  const res = await getCertificateByIdOrNo(decodedId);
  const cert = res.data;

  if (!cert) {
    notFound();
  }

  // Record public certificate view event in audit log
  await recordCertificateAccess({
    certificateId: cert.id,
    certificateNo: cert.certificate_no,
    action: "view",
  });

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex justify-center">
      <div className="w-full max-w-6xl">
        <CertificateViewClient certificate={cert} />
      </div>
    </div>
  );
}
