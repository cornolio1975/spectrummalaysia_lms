import type { Metadata } from "next";
import { getSystemSettings } from "@/app/actions/settings";
import { SettingsClient } from "@/components/dashboard/settings-client";

export const metadata: Metadata = { title: "System Settings" };

export default async function SettingsPage() {
  const settingsRes = await getSystemSettings();
  const settings = settingsRes.data || [];

  return <SettingsClient settings={settings} />;
}
