import { getAIFeatureSettings, getAIProviders } from "@/app/actions/ai";
import { AIFeaturesClient } from "@/components/admin/ai/ai-features-client";

export const metadata = {
  title: "AI Features & Governance Matrix | SpectrumMY",
  description: "Configure per-feature AI models, privacy boundaries, and approval requirements.",
};

export default async function AIFeaturesPage() {
  const [featuresRes, providersRes] = await Promise.all([
    getAIFeatureSettings(),
    getAIProviders(),
  ]);

  const features = featuresRes.data || [];
  const providers = providersRes.data || [];

  return <AIFeaturesClient features={features} providers={providers} />;
}
