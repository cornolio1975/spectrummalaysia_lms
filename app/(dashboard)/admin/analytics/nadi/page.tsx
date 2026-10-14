import { getAnalyticsFilters, getDashboardAnalytics } from "@/app/actions/analytics";
import AnalyticsClient from "@/components/analytics/AnalyticsClient";

export const metadata = {
  title: "NADI Analytics | SpectrumMY LMS",
  description: "NADI Analytics & Programme Performance Admin Console",
};

export const dynamic = "force-dynamic";

export default async function NadiAnalyticsPage({ 
  searchParams 
}: { 
  searchParams?: Promise<Record<string, string | string[] | undefined>> 
}) {
  let params: any = {};
  try {
    params = (await Promise.resolve(searchParams)) || {};
  } catch (err) {
    console.error("Error resolving searchParams in NadiAnalyticsPage:", err);
    params = {};
  }

  // Extract filters from searchParams safely
  const filters = {
    year: typeof params.year === 'string' ? params.year : new Date().getFullYear().toString(),
    stateId: typeof params.state === 'string' ? params.state : null,
    programmeId: typeof params.programme === 'string' ? params.programme : null,
    nadiId: typeof params.nadi === 'string' ? params.nadi : null,
    dusp: typeof params.dusp === 'string' ? params.dusp : null,
    entity: typeof params.entity === 'string' ? params.entity : null,
    phase: typeof params.phase === 'string' ? params.phase : null,
    gender: typeof params.gender === 'string' ? params.gender : 'All',
    age: typeof params.age === 'string' ? params.age : 'All',
  };

  let filterOptions: any = {
    states: [],
    programmes: [],
    nadis: [],
    dusps: [],
    entities: [],
    phases: []
  };

  let dashboardData: any = {
    kpis: { totalEvents: 0, totalNadi: 0, totalPax: 0, totalParticipation: 0 },
    nadiRows: [],
    stateRows: [],
    programmes: [],
    months: [],
    quarters: [],
    weeks: []
  };

  try {
    const [fetchedFilterOptions, fetchedDashboardData] = await Promise.all([
      getAnalyticsFilters(),
      getDashboardAnalytics(filters)
    ]);
    if (fetchedFilterOptions) filterOptions = fetchedFilterOptions;
    if (fetchedDashboardData) dashboardData = fetchedDashboardData;
  } catch (err) {
    console.error("Error loading NADI analytics data:", err);
  }

  return (
    <AnalyticsClient 
      filters={filters}
      filterOptions={filterOptions}
      initialData={dashboardData}
    />
  );
}
