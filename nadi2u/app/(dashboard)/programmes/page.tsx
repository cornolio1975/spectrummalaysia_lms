import type { Metadata } from "next";
import { getProgrammes } from "@/app/actions/programmes";
import { ProgrammesClient } from "@/components/dashboard/programmes-client";

export const metadata: Metadata = { title: "Programmes" };

export default async function ProgrammesPage() {
  const { data } = await getProgrammes();
  const programmes = data || [];

  return <ProgrammesClient programmes={programmes} />;
}
