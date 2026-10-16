import type { Metadata } from "next";
import { getParticipants } from "@/app/actions/participants";
import { getLearnerInterventions } from "@/app/actions/interventions";
import { getCourses } from "@/app/actions/courses";
import { getNadiSites } from "@/app/actions/nadi";
import { LearnerManagementClient } from "@/components/learner/LearnerManagementClient";

export const metadata: Metadata = { 
  title: "Learner Management Hub | SpectrumMY",
  description: "Enterprise learner directory, cohort tracking, NADI center enrolments, and retention intervention radar."
};

export const dynamic = "force-dynamic";

export default async function ParticipantsPage() {
  const [participantsRes, interventionsRes, coursesRes, nadiSitesRes] = await Promise.all([
    getParticipants(),
    getLearnerInterventions(),
    getCourses({ includeArchived: false }),
    getNadiSites(),
  ]);

  const participants = participantsRes.data || [];
  const openInterventions = (interventionsRes.data || []).filter((i: any) => i.status === "open");
  const courses = coursesRes.data || [];
  const nadiSites = nadiSitesRes.data || [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <LearnerManagementClient
        participants={participants}
        openInterventions={openInterventions}
        courses={courses}
        nadiSites={nadiSites}
      />
    </div>
  );
}
