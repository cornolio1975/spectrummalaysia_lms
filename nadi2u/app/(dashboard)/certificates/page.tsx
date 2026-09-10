import type { Metadata } from "next";
import { getCertificates } from "@/app/actions/certificates";
import { CertificatesClient } from "@/components/dashboard/certificates-client";

export const metadata: Metadata = { title: "Certificates" };

export default async function CertificatesPage() {
  const certsRes = await getCertificates();
  const certificates = certsRes.data || [];

  return <CertificatesClient certificates={certificates} />;
}
