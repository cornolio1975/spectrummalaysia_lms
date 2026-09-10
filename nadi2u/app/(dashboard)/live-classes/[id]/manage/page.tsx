import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLiveClassById } from "@/app/actions/live-classes";
import { getLiveClassAttendance } from "@/app/actions/live-attendance";
import { TrainerClassManageClient } from "@/components/dashboard/trainer-class-manage-client";

export const metadata: Metadata = { title: "Manage Live Class" };

export default async function ManageLiveClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [classRes, attendanceRes] = await Promise.all([
    getLiveClassById(id),
    getLiveClassAttendance(id),
  ]);

  if (classRes.error || !classRes.data) notFound();

  return (
    <TrainerClassManageClient
      liveClass={classRes.data}
      attendance={attendanceRes.data || []}
    />
  );
}
