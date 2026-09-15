import type { Metadata } from "next";
import { getEvents } from "@/app/actions/events";
import { getProgrammes } from "@/app/actions/programmes";
import { getNadiSites } from "@/app/actions/nadi";
import { EventsClient } from "@/components/dashboard/events-client";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage() {
  const [eventsRes, progRes, nadiRes] = await Promise.all([
    getEvents(),
    getProgrammes(),
    getNadiSites()
  ]);

  const events = eventsRes.data || [];
  const programmes = progRes.data || [];
  const nadiSites = nadiRes.data || [];

  return <EventsClient events={events} programmes={programmes} nadiSites={nadiSites} />;
}
