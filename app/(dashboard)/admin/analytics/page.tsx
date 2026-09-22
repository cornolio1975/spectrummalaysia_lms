import { redirect } from "next/navigation";

export default function AnalyticsRootPage() {
  // Default to the NADI view as per requirements
  redirect("/admin/analytics/nadi");
}
