import { getLearnerWalletCredentials } from "@/app/actions/credentials";
import { LearnerWalletClient } from "@/components/wallet/learner-wallet-client";

export const metadata = {
  title: "Learner Digital Wallet | SpectrumMY",
  description: "Secure learner wallet displaying accredited micro-credentials, digital badges, and cryptographic verification passes.",
};

export default async function LearnerWalletPage() {
  const res = await getLearnerWalletCredentials();
  const issuances = res.data || [];
  const certificates = res.certificates || [];

  return <LearnerWalletClient issuances={issuances} certificates={certificates} />;
}
