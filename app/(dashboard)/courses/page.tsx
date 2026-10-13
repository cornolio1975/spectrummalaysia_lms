import { getCurriculumOverviewData } from "@/app/actions/courses";
import CurriculumManagementClient from "@/components/courses/curriculum-management-client";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const data = await getCurriculumOverviewData();

  return (
    <CurriculumManagementClient
      initialProgrammes={data.programmes || []}
      initialCategories={data.categories || []}
      initialCourses={(data.courses as any) || []}
    />
  );
}
