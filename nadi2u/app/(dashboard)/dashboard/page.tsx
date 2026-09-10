import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function getDashboardStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [
    participantsResult,
    programmesResult,
    nadiResult,
    eventsResult,
    certificatesResult,
    statesResult,
    activeLearnersResult,
    activeSessionsResult,
  ] = await Promise.allSettled([
    supabase.from("participants").select("id", { count: "exact", head: true }),
    supabase.from("programmes").select("id", { count: "exact", head: true }),
    supabase.from("nadi_sites").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("certificates").select("id", { count: "exact", head: true }),
    supabase.from("states").select("id", { count: "exact", head: true }),
    // active learners = participants registered in any event
    supabase.from("event_participants").select("participant_id", { count: "exact", head: true }).eq("status", "registered"),
    // active sessions = sessions not completed/cancelled
    supabase.from("event_sessions").select("id", { count: "exact", head: true }).in("status", ["scheduled", "in_progress"]),
  ]);

  const safeCount = (result: PromiseSettledResult<{ count: number | null }>) =>
    result.status === "fulfilled" ? (result.value.count ?? 0) : 0;

  const activeLearners = safeCount(activeLearnersResult as PromiseSettledResult<{ count: number | null }>);
  const completedLearners = safeCount(certificatesResult as PromiseSettledResult<{ count: number | null }>); // Approximate: 1 cert = 1 completion
  
  const completionRate = activeLearners > 0 
    ? Math.round((completedLearners / activeLearners) * 100) 
    : 0;

  return {
    totalParticipants: safeCount(participantsResult as PromiseSettledResult<{ count: number | null }>),
    programmes: safeCount(programmesResult as PromiseSettledResult<{ count: number | null }>),
    nadiSites: safeCount(nadiResult as PromiseSettledResult<{ count: number | null }>),
    events: safeCount(eventsResult as PromiseSettledResult<{ count: number | null }>),
    certificates: completedLearners,
    states: safeCount(statesResult as PromiseSettledResult<{ count: number | null }>),
    activeLearners,
    completedLearners,
    attendanceRate: 85, // Placeholder until full attendance module is widely used
    completionRate,
    kpiAchievement: 72, // Placeholder until KPI results table is populated
    activeSessions: safeCount(activeSessionsResult as PromiseSettledResult<{ count: number | null }>),
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const stats = await getDashboardStats(supabase);

  return <DashboardClient stats={stats} />;
}
