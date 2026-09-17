import { getEvidenceRepository } from "@/app/actions/evidence";
import { getParticipants } from "@/app/actions/participants";
import { getCourses } from "@/app/actions/courses";
import { EvidenceRepositoryClient } from "@/components/evidence/evidence-repository-client";

export const metadata = {
  title: "Evidence Repository Vault | SpectrumMY",
  description: "Institutional repository for assessment portfolios, rubrics evidence, and RPL submissions.",
};

export default async function EvidencePage() {
  const [evidenceRes, participantsRes, coursesRes] = await Promise.all([
    getEvidenceRepository(),
    getParticipants(),
    getCourses(),
  ]);

  const evidenceList = evidenceRes.data || [];
  const participants = participantsRes.data || [];
  const courses = (coursesRes.data || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    course_code: c.course_code,
  }));

  return (
    <EvidenceRepositoryClient
      evidenceList={evidenceList}
      participants={participants}
      courses={courses}
    />
  );
}
