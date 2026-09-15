import type { Metadata } from "next";
import { ReportsClient } from "@/components/dashboard/reports-client";
import { getProgrammes } from "@/app/actions/programmes";
import { getEvents } from "@/app/actions/events";

export const metadata: Metadata = { title: "Reports & Analytics" };

export default async function ReportsPage() {
  const [programmesRes, eventsRes] = await Promise.all([
    getProgrammes(),
    getEvents()
  ]);

  return <ReportsClient 
    programmes={programmesRes.data || []} 
    events={eventsRes.data || []} 
  />;
}
