import { notFound } from "next/navigation";
import { getCredentialById } from "@/app/actions/credentials";
import { getParticipants } from "@/app/actions/participants";
import { CredentialDetailClient } from "@/components/credentials/credential-detail-client";

export const metadata = {
  title: "Credential Management | SpectrumMY",
  description: "View and manage credential details, eligibility rules, and issuance records.",
};

export default async function CredentialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [credRes, participantsRes] = await Promise.all([
    getCredentialById(id),
    getParticipants(),
  ]);

  if (credRes.error || !credRes.data) {
    notFound();
  }

  const credential = credRes.data;
  const participants = participantsRes.data || [];

  return <CredentialDetailClient credential={credential} participants={participants} />;
}
