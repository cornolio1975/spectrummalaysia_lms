import { getN8nConfig, getN8nRecentJobs } from "@/app/actions/n8n";
import { N8nSettingsClient } from "@/components/admin/settings/n8n-settings-client";

export const metadata = {
  title: "Hostinger n8n Automation Engine | SpectrumMY",
  description: "Configure external workflow automation, webhooks, and asynchronous event execution.",
};

export default async function N8nSettingsPage() {
  const [configRes, jobsRes] = await Promise.all([
    getN8nConfig(),
    getN8nRecentJobs(),
  ]);

  const config = configRes.data || null;
  const recentJobs = jobsRes.data || [];

  return <N8nSettingsClient config={config} recentJobs={recentJobs} />;
}
