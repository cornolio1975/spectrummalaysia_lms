import { getSkills } from "@/app/actions/skills";
import { getParticipants } from "@/app/actions/participants";
import { SkillsFrameworkClient } from "@/components/skills/skills-framework-client";

export const metadata = {
  title: "Skills & Competency Framework | SpectrumMY",
  description: "Enterprise skills taxonomy, competency standards, and learner skill audits.",
};

export default async function SkillsPage() {
  const [skillsRes, participantsRes] = await Promise.all([
    getSkills(),
    getParticipants(),
  ]);

  const skills = skillsRes.data || [];
  const participants = participantsRes.data || [];

  return <SkillsFrameworkClient skills={skills} participants={participants} />;
}
