import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function getDashboardStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  // Run all count queries in parallel
  const [
    participantsResult,
    programmesResult,
    nadiResult,
    eventsResult,
    certificatesResult,
    statesResult,
  ] = await Promise.allSettled([
    supabase.from("participants").select("id", { count: "exact", head: true }),
    supabase.from("programmes").select("id", { count: "exact", head: true }),
    supabase.from("nadi_sites").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("certificates").select("id", { count: "exact", head: true }),
    supabase.from("states").select("id", { count: "exact", head: true }),
  ]);

  const safeCount = (result: PromiseSettledResult<{ count: number | null }>) =>
    result.status === "fulfilled" ? (result.value.count ?? 0) : 0;

  return {
    totalParticipants: safeCount(participantsResult as PromiseSettledResult<{ count: number | null }>),
    programmes: safeCount(programmesResult as PromiseSettledResult<{ count: number | null }>),
    nadiSites: safeCount(nadiResult as PromiseSettledResult<{ count: number | null }>),
    events: safeCount(eventsResult as PromiseSettledResult<{ count: number | null }>),
    certificates: safeCount(certificatesResult as PromiseSettledResult<{ count: number | null }>),
    states: safeCount(statesResult as PromiseSettledResult<{ count: number | null }>),
    // These will be calculated from real data once tables have records
    activeLearners: 0,
    completedLearners: 0,
    attendanceRate: 0,
    completionRate: 0,
    kpiAchievement: 0,
    activeSessions: 0,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const stats = await getDashboardStats(supabase);

  return <DashboardClient stats={stats} />;
}
