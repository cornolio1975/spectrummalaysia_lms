import type { Metadata } from "next";
import { getKPIResults } from "@/app/actions/kpis";
import { KPIsClient } from "@/components/dashboard/kpis-client";

export const metadata: Metadata = { title: "KPI Reports" };

export default async function KPIReportsPage() {
  const currentYear = new Date().getFullYear();
  const kpiRes = await getKPIResults(currentYear);
  const kpiResults = kpiRes.data || [];

  return <KPIsClient kpiResults={kpiResults} />;
}
