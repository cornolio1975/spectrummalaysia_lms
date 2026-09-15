import type { Metadata } from "next";
import { getGoogleIntegrationHealth } from "@/app/actions/google-integration";
import { GoogleIntegrationClient } from "@/components/dashboard/google-integration-client";

export const metadata: Metadata = { title: "Google Integration" };

export default async function GoogleIntegrationPage() {
  const health = await getGoogleIntegrationHealth();
  return <GoogleIntegrationClient health={health} />;
}
