import { getCredentials } from "@/app/actions/credentials";
import { CredentialsListClient } from "@/components/credentials/credentials-list-client";

export const metadata = {
  title: "Micro-Credentials & Badges Registry | SpectrumMY",
  description: "Enterprise micro-credentials, stackable qualifications, and digital badges registry.",
};

export default async function CredentialsPage() {
  const res = await getCredentials();
  const credentials = (res.data || []) as any[];

  return <CredentialsListClient credentials={credentials} />;
}
