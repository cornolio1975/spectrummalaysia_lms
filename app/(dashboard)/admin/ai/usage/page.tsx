import { getAIUsageStats } from "@/app/actions/ai";
import { AIUsageClient } from "@/components/admin/ai/ai-usage-client";

export const metadata = {
  title: "AI Usage & Cost Telemetry | SpectrumMY",
  description: "Real-time AI telemetry, token accounting, and budget containment monitoring.",
};

export default async function AIUsagePage() {
  const res = await getAIUsageStats();
  const usageData = res.data || {
    logs: [],
    budget: { max_monthly_budget_usd: 50, current_spend_usd: 0, alert_threshold_pct: 80 },
    providers: [],
    metrics: { totalRequests: 0, successfulRequests: 0, simulatedRequests: 0, totalTokens: 0, avgLatency: 0 },
  };

  return <AIUsageClient usageData={usageData} />;
}
