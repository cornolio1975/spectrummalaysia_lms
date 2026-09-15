import type { Metadata } from "next";
import { getProgrammes } from "@/app/actions/programmes";
import { getTrainers } from "@/app/actions/trainers";
import { getNadiSites } from "@/app/actions/nadi";
import { CreateLiveClassForm } from "@/components/dashboard/create-live-class-form";

export const metadata: Metadata = { title: "Create Live Class" };

export default async function NewLiveClassPage() {
  const [programmesRes, trainersRes, nadiRes] = await Promise.all([
    getProgrammes(),
    getTrainers(),
    getNadiSites(),
  ]);

  return (
    <div className="page-header">
      <div className="mb-4">
        <h1>Create Live Class</h1>
        <p>Schedule a new Google Meet live training session</p>
      </div>
      <CreateLiveClassForm
        programmes={programmesRes.data || []}
        trainers={trainersRes.data || []}
        nadiSites={nadiRes.data || []}
      />
    </div>
  );
}
