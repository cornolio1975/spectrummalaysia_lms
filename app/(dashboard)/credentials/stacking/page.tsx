import { getCredentialStacks, getCredentials } from "@/app/actions/credentials";
import { CredentialStackingClient } from "@/components/credentials/credential-stacking-client";

export const metadata = {
  title: "Micro-Credential Stacking Pathways | SpectrumMY",
  description: "Modular credential pathways combining micro-credentials into professional qualifications.",
};

export default async function CredentialStackingPage() {
  const [stacksRes, credsRes] = await Promise.all([
    getCredentialStacks(),
    getCredentials(),
  ]);

  const stacks = stacksRes.data || [];
  const allCredentials = (credsRes.data || []) as any[];

  return <CredentialStackingClient stacks={stacks} allCredentials={allCredentials} />;
}
