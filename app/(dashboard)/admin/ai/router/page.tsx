import { getAIProviders } from "@/app/actions/ai";
import { AIRouterClient } from "@/components/admin/ai/ai-router-client";

export const metadata = {
  title: "Hostinger AI Router Settings | SpectrumMY",
  description: "Configure Hostinger AI Router inference endpoints and adaptive model policies.",
};

export default async function AIRouterPage() {
  const res = await getAIProviders();
  const providers = res.data || [];
  const routerProvider = providers.find((p: any) => p.code === "hostinger_router") || null;

  return <AIRouterClient routerProvider={routerProvider} />;
}
