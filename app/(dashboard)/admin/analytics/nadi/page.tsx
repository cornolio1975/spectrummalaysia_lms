import { getAnalyticsFilters, getDashboardAnalytics } from "@/app/actions/analytics";
import AnalyticsClient from "@/components/analytics/AnalyticsClient";

export const metadata = {
  title: "NADI Analytics | SpectrumMY LMS",
  description: "NADI Analytics & Programme Performance Admin Console",
};

export default async function NadiAnalyticsPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams;

  // Extract filters from searchParams
  const filters = {
    year: params.year || new Date().getFullYear().toString(),
    stateId: params.state || null,
    programmeId: params.programme || null,
    nadiId: params.nadi || null,
    dusp: params.dusp || null,
    entity: params.entity || null,
    phase: params.phase || null,
    gender: params.gender || 'All',
    age: params.age || 'All',
  };

  // Fetch data
  const filterOptions = await getAnalyticsFilters();
  const dashboardData = await getDashboardAnalytics(filters);

  return (
    <AnalyticsClient 
      filters={filters}
      filterOptions={filterOptions}
      initialData={dashboardData}
    />
  );
}
