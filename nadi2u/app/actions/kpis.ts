"use server";

import { createClient } from "@/utils/supabase/server";

export async function getKPIs() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("kpis")
    .select(`
      *,
      programmes (programme_name)
    `)
    .order("kpi_code", { ascending: true });

  if (error) {
    console.error("Error fetching KPIs:", error);
    return { error: error.message };
  }

  return { data };
}

export async function getKPIResults(year: number) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("kpi_results")
    .select(`
      *,
      kpis (
        kpi_code,
        kpi_name,
        unit,
        target_value,
        warning_threshold,
        critical_threshold,
        programmes (programme_name)
      )
    `)
    .eq("period_year", year);

  if (error) {
    console.error("Error fetching KPI results:", error);
    return { error: error.message };
  }

  return { data };
}
