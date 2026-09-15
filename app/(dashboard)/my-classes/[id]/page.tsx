import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLiveClassById } from "@/app/actions/live-classes";
import { ParticipantClassJoinClient } from "@/components/dashboard/participant-class-join-client";

export const metadata: Metadata = { title: "Join Live Class" };

export default async function MyClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const classRes = await getLiveClassById(id);
  if (classRes.error || !classRes.data) notFound();

  return <ParticipantClassJoinClient liveClass={classRes.data} />;
}
