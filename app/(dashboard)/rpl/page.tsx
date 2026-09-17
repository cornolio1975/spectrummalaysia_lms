import { getRPLApplications } from "@/app/actions/rpl";
import { getParticipants } from "@/app/actions/participants";
import { getCourses } from "@/app/actions/courses";
import { RPLApplicationsClient } from "@/components/rpl/rpl-applications-client";

export const metadata = {
  title: "Recognition of Prior Learning (RPL) | SpectrumMY",
  description: "Evaluate prior workplace experience, verify evidence portfolios, and award modular exemptions.",
};

export default async function RPLPage() {
  const [appsRes, participantsRes, coursesRes] = await Promise.all([
    getRPLApplications(),
    getParticipants(),
    getCourses(),
  ]);

  const applications = appsRes.data || [];
  const participants = participantsRes.data || [];
  const courses = (coursesRes.data || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    course_code: c.course_code,
  }));

  return (
    <RPLApplicationsClient
      applications={applications}
      participants={participants}
      courses={courses}
    />
  );
}
