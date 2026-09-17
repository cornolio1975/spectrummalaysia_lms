import { getCourses } from "@/app/actions/courses";
import { CredentialBuilderClient } from "@/components/credentials/credential-builder-client";

export const metadata = {
  title: "Create Micro-Credential | SpectrumMY",
  description: "Configure and register a new enterprise micro-credential.",
};

export default async function NewCredentialPage() {
  const coursesRes = await getCourses();
  const courses = (coursesRes.data || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    course_code: c.course_code,
  }));

  return <CredentialBuilderClient courses={courses} />;
}
