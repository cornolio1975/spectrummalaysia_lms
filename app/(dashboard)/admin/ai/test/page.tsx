import { getAIProviders, getAIFeatureSettings } from "@/app/actions/ai";
import { AITestConsoleClient } from "@/components/admin/ai/ai-test-console-client";

export const metadata = {
  title: "AI Test Console | SpectrumMY",
  description: "Interactive AI testing sandbox to evaluate prompts, latency, and tokens across providers.",
};

export default async function AITestConsolePage() {
  const [providersRes, featuresRes] = await Promise.all([
    getAIProviders(),
    getAIFeatureSettings(),
  ]);

  const providers = providersRes.data || [];
  const features = featuresRes.data || [];

  return <AITestConsoleClient providers={providers} features={features} />;
}
