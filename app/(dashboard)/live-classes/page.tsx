import type { Metadata } from "next";
import Link from "next/link";
import { getLiveClasses, getLiveClassStats } from "@/app/actions/live-classes";
import { getProgrammes } from "@/app/actions/programmes";
import { getTrainers } from "@/app/actions/trainers";
import { LiveClassesClient } from "@/components/dashboard/live-classes-client";

export const metadata: Metadata = { title: "Live Classes" };

export default async function LiveClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;

  const [classesRes, statsRes, programmesRes, trainersRes] = await Promise.all([
    getLiveClasses({
      programme_id: sp.programme_id,
      state_id: sp.state_id,
      nadi_id: sp.nadi_id,
      trainer_id: sp.trainer_id,
      status: sp.status,
      date_from: sp.date_from,
      date_to: sp.date_to,
      page: sp.page ? parseInt(sp.page) : 1,
      limit: 20,
    }),
    getLiveClassStats(),
    getProgrammes(),
    getTrainers(),
  ]);

  return (
    <LiveClassesClient
      classes={classesRes.data || []}
      total={classesRes.count || 0}
      stats={statsRes}
      programmes={programmesRes.data || []}
      trainers={trainersRes.data || []}
      filters={sp}
    />
  );
}
