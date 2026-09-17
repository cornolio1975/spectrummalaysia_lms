import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCertificateByIdOrNo, recordCertificateAccess } from "@/app/actions/certificates";
import { CertificateViewClient } from "@/components/certificates/certificate-view-client";

export const metadata: Metadata = {
  title: "Certificate View | Spectrum Malaysia LMS",
  description: "Official Certificate of Achievement preview, download, and verification.",
};

export default async function ViewCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const res = await getCertificateByIdOrNo(decodeURIComponent(id));
  const cert = res.data;

  if (!cert) {
    notFound();
  }

  // Record audit view
  await recordCertificateAccess({
    certificateId: cert.id,
    certificateNo: cert.certificate_no,
    action: "view",
  });

  return <CertificateViewClient certificate={cert} />;
}
