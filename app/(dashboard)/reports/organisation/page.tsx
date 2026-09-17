import { createClient } from "@/utils/supabase/server";
import { OrganisationReportClient } from "@/components/reports/organisation-report-client";

export const metadata = {
  title: "Organisation KPI Analytics | SpectrumMY",
  description: "Enterprise analytics, regional NADI site telemetry, and institutional credential metrics.",
};

export default async function OrganisationReportsPage() {
  const supabase = await createClient();

  const [
    participantsRes,
    coursesRes,
    issuancesRes,
    enrolmentsRes,
    interventionsRes,
    categoriesRes,
  ] = await Promise.all([
    supabase.from("participants").select("id, nadi_sites(nadi_name), states(state_name)"),
    supabase.from("courses").select("id, category_id"),
    supabase.from("credential_issuances").select("id"),
    supabase.from("course_enrolments").select("id, status"),
    supabase.from("learner_interventions").select("id, status"),
    supabase.from("training_categories").select("id, name, courses(id, course_enrolments(id))"),
  ]);

  const participants = participantsRes.data || [];
  const courses = coursesRes.data || [];
  const issuances = issuancesRes.data || [];
  const enrolments = enrolmentsRes.data || [];
  const interventions = interventionsRes.data || [];
  const categories = categoriesRes.data || [];

  const completedEnrolments = enrolments.filter((e) => e.status === "completed").length;
  const completionRate =
    enrolments.length > 0 ? Math.round((completedEnrolments / enrolments.length) * 100) : 0;

  const resolvedInterventions = interventions.filter((i) => i.status === "resolved").length;

  // Aggregate by NADI site
  const siteMap = new Map<string, { name: string; state: string; learnersCount: number }>();
  for (const p of participants) {
    const siteName = (p.nadi_sites as any)?.nadi_name || "Central / Online";
    const stateName = (p.states as any)?.state_name || "National";
    const key = `${siteName}-${stateName}`;
    if (!siteMap.has(key)) {
      siteMap.set(key, { name: siteName, state: stateName, learnersCount: 0 });
    }
    siteMap.get(key)!.learnersCount++;
  }

  const siteBreakdown = Array.from(siteMap.values()).sort(
    (a, b) => b.learnersCount - a.learnersCount
  );

  // Aggregate by category
  const categoryBreakdown = categories.map((cat: any) => {
    const catCourses = cat.courses || [];
    let enrCount = 0;
    for (const c of catCourses) {
      enrCount += c.course_enrolments?.length || 0;
    }
    return {
      category: cat.name,
      coursesCount: catCourses.length,
      enrolmentsCount: enrCount,
    };
  });

  const metrics = {
    totalLearners: participants.length,
    totalCourses: courses.length,
    totalIssuances: issuances.length,
    totalTrainingHours: courses.length * 24, // aggregate benchmark
    completionRate,
    totalInterventions: interventions.length,
    resolvedInterventions,
    siteBreakdown,
    categoryBreakdown,
  };

  return <OrganisationReportClient metrics={metrics} />;
}
