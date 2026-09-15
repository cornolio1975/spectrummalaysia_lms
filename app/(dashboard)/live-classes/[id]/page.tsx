import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLiveClassById } from "@/app/actions/live-classes";
import { getLiveClassAttendance } from "@/app/actions/live-attendance";
import { LiveClassDetailClient } from "@/components/dashboard/live-class-detail-client";

export const metadata: Metadata = { title: "Live Class Detail" };

export default async function LiveClassDetailPage({
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
    <LiveClassDetailClient
      liveClass={classRes.data}
      attendance={attendanceRes.data || []}
    />
  );
}
