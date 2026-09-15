import type { Metadata } from "next";
import { getParticipantAttendanceSummary } from "@/app/actions/live-attendance";
import { MyClassesClient } from "@/components/dashboard/my-classes-client";
import { createClient } from "@/utils/supabase/server";
import { getLiveClasses } from "@/app/actions/live-classes";

export const metadata: Metadata = { title: "My Live Classes" };

export default async function MyClassesPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  // Find participant linked to this user by email
  const { data: participant } = await supabase
    .from("participants")
    .select("id, full_name")
    .eq("email", authData?.user?.email || "")
    .single();

  const [classesRes, attendanceRes] = await Promise.all([
    getLiveClasses({ limit: 50 }),
    participant?.id ? getParticipantAttendanceSummary(participant.id) : Promise.resolve({ data: [], summary: null }),
  ]);

  return (
    <MyClassesClient
      classes={classesRes.data || []}
      attendance={attendanceRes.data || []}
      summary={(attendanceRes as any).summary}
      participant={participant}
    />
  );
}
