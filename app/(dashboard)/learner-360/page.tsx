import { getParticipants } from "@/app/actions/participants";
import { getLearnerInterventions } from "@/app/actions/interventions";
import { LearnerDirectoryClient } from "@/components/learner-360/learner-directory-client";

export const metadata = {
  title: "Learner 360° Intelligence | SpectrumMY",
  description: "Holistic learner telemetry, competency progression, and proactive retention monitoring.",
};

export default async function Learner360Page() {
  const [participantsRes, interventionsRes] = await Promise.all([
    getParticipants(),
    getLearnerInterventions(),
  ]);

  const participants = participantsRes.data || [];
  const openInterventions = (interventionsRes.data || []).filter((i: any) => i.status === "open");

  return (
    <LearnerDirectoryClient
      participants={participants}
      openInterventions={openInterventions}
    />
  );
}
