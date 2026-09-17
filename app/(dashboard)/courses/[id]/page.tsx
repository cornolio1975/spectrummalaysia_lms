import { notFound } from "next/navigation";
import { getCourseById } from "@/app/actions/courses";
import CourseDetailClient from "@/components/courses/course-detail-client";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getCourseById(id);

  if (res.error || !res.data) {
    notFound();
  }

  return <CourseDetailClient course={res.data} />;
}
