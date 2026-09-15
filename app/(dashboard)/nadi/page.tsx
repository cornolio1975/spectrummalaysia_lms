import type { Metadata } from "next";
import { getNadiSites, getStates } from "@/app/actions/nadi";
import { NadiClient } from "@/components/dashboard/nadi-client";

export const metadata: Metadata = { title: "NADI Sites" };

export default async function NADIPage() {
  const [nadiRes, statesRes] = await Promise.all([
    getNadiSites(),
    getStates()
  ]);

  const nadiSites = nadiRes.data || [];
  const states = statesRes.data || [];

  return <NadiClient nadiSites={nadiSites} states={states} />;
}
