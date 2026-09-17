import type { Metadata } from "next";
import { getCertificates } from "@/app/actions/certificates";
import { getParticipants } from "@/app/actions/participants";
import { getProgrammes } from "@/app/actions/programmes";
import { getCourses } from "@/app/actions/courses";
import { CertificatesClient } from "@/components/dashboard/certificates-client";

export const metadata: Metadata = {
  title: "Certificate Management | Spectrum Malaysia LMS",
  description: "Official certificate and micro-credential management console.",
};

export default async function CertificatesPage() {
  const [certsRes, participantsRes, programmesRes, coursesRes] = await Promise.all([
    getCertificates(),
    getParticipants(),
    getProgrammes(),
    getCourses(),
  ]);

  const certificates = certsRes.data || [];
  const participants = participantsRes.data || [];
  const programmes = programmesRes.data || [];
  const courses = coursesRes.data || [];

  return (
    <CertificatesClient
      certificates={certificates}
      participants={participants}
      programmes={programmes}
      courses={courses}
    />
  );
}
