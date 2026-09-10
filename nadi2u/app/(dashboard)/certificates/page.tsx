import type { Metadata } from "next";
import { getCertificates } from "@/app/actions/certificates";
import { getParticipants } from "@/app/actions/participants";
import { getProgrammes } from "@/app/actions/programmes";
import { CertificatesClient } from "@/components/dashboard/certificates-client";

export const metadata: Metadata = { title: "Certificates" };

export default async function CertificatesPage() {
  const [certsRes, participantsRes, programmesRes] = await Promise.all([
    getCertificates(),
    getParticipants(),
    getProgrammes(),
  ]);

  const certificates = certsRes.data || [];
  const participants = participantsRes.data || [];
  const programmes = programmesRes.data || [];

  return (
    <CertificatesClient
      certificates={certificates}
      participants={participants}
      programmes={programmes}
    />
  );
}
