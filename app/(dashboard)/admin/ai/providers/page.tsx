import { getAIProviders } from "@/app/actions/ai";
import { AIProvidersClient } from "@/components/admin/ai/ai-providers-client";

export const metadata = {
  title: "AI Providers Management | SpectrumMY",
  description: "Manage AI providers, local models, Hostinger AI Router, and fallback priority.",
};

export default async function AIProvidersPage() {
  const res = await getAIProviders();
  const providers = res.data || [];

  return <AIProvidersClient providers={providers} />;
}
