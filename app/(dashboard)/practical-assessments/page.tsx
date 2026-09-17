import { getPracticalAssessments, getTrainerGradingQueue } from "@/app/actions/assessments";
import { PracticalAssessmentsClient } from "@/components/assessments/practical-assessments-client";

export const metadata = {
  title: "Practical Assessments & Rubrics | SpectrumMY",
  description: "Performance rubric assessments, capstone submissions grading, and competency verification.",
};

export default async function PracticalAssessmentsPage() {
  const [queueRes, tasksRes] = await Promise.all([
    getTrainerGradingQueue(),
    getPracticalAssessments(),
  ]);

  const gradingQueue = queueRes.data || [];
  const assessments = tasksRes.data || [];

  return <PracticalAssessmentsClient gradingQueue={gradingQueue} assessments={assessments} />;
}
