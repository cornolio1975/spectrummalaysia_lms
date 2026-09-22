"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAnalyticsFilters() {
  const supabase = await createClient();

  const [states, programmes, nadis] = await Promise.all([
    supabase.from("states").select("id, state_name").order("state_name"),
    supabase.from("programmes").select("id, programme_name, category").order("programme_name"),
    supabase.from("nadi_sites").select("id, site_name, ref_id").order("site_name"),
  ]);

  const { data: nadiRaw } = await supabase.from("nadi_sites").select("tp_dusp, entity_name, phase");
  
  const dusps = Array.from(new Set(nadiRaw?.map(n => n.tp_dusp).filter(Boolean)));
  const entities = Array.from(new Set(nadiRaw?.map(n => n.entity_name).filter(Boolean)));
  const phases = Array.from(new Set(nadiRaw?.map(n => n.phase).filter(Boolean)));

  return {
    states: states.data || [],
    programmes: programmes.data || [],
    nadis: nadis.data || [],
    dusps,
    entities,
    phases
  };
}

async function fetchAll(queryBuilder: any) {
  let allData: any[] = [];
  let from = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const to = from + limit - 1;
    // .range() mutates the builder but that's fine as we just overwrite the range headers
    const { data, error } = await queryBuilder.range(from, to);
    if (error) throw error;
    
    if (data && data.length > 0) {
      allData = allData.concat(data);
      if (data.length < limit) {
        hasMore = false;
      } else {
        from += limit;
      }
    } else {
      hasMore = false;
    }
  }
  return allData;
}

export async function getDashboardAnalytics(filters: any = {}) {
  const supabase = await createClient();

  // 1. Fetch Nadi Sites (filtered)
  let nadiQuery = supabase.from("nadi_sites").select(`
    id, site_name, ref_id, tp_dusp, entity_name, phase,
    states ( id, state_name )
  `);

  if (filters.stateId) nadiQuery = nadiQuery.eq("state_id", filters.stateId);
  if (filters.nadiId) nadiQuery = nadiQuery.eq("id", filters.nadiId);
  if (filters.dusp) nadiQuery = nadiQuery.eq("tp_dusp", filters.dusp);
  if (filters.entity) nadiQuery = nadiQuery.eq("entity_name", filters.entity);
  if (filters.phase) nadiQuery = nadiQuery.eq("phase", filters.phase);

  const nadis = await fetchAll(nadiQuery);
  const realTotalNadi = nadis.length;

  // 2. Fetch Events for these Nadi Sites
  let eventQuery = supabase.from("events").select(`
    id, event_date, nadi_id, programme_id, status,
    programmes ( id, programme_name, category )
  `);

  if (filters.stateId) eventQuery = eventQuery.eq("state_id", filters.stateId);
  if (filters.nadiId) eventQuery = eventQuery.eq("nadi_id", filters.nadiId);
  if (filters.programmeId) eventQuery = eventQuery.eq("programme_id", filters.programmeId);
  
  if (filters.year) {
    eventQuery = eventQuery.gte("event_date", `${filters.year}-01-01`).lte("event_date", `${filters.year}-12-31`);
  }

  const events = await fetchAll(eventQuery);
  const eventIds = events.map(e => e.id);

  // 3. Fetch Event Participants for PAX counting
  let eps: any[] = [];
  
  if (eventIds.length > 0) {
    // Chunk eventIds into groups of 200 to avoid giant IN clauses
    const chunkSize = 200;
    for (let i = 0; i < eventIds.length; i += chunkSize) {
      const chunk = eventIds.slice(i, i + chunkSize);
      let epQuery = supabase.from("event_participants").select(`
        id, event_id, participant_id, status,
        participants ( id, gender, date_of_birth )
      `).in("event_id", chunk);
      
      const chunkData = await fetchAll(epQuery);
      eps = eps.concat(chunkData);
    }
  }

  // Apply Demographic filters manually
  const filteredEps = (eps || []).filter(ep => {
    const p = ep.participants as any;
    if (!p) return false;
    
    if (filters.gender && filters.gender !== 'All' && p.gender !== filters.gender) return false;
    
    if (filters.age && filters.age !== 'All') {
      if (!p.date_of_birth) return false;
      const age = new Date().getFullYear() - new Date(p.date_of_birth).getFullYear();
      if (filters.age === '0-12' && (age < 0 || age > 12)) return false;
      if (filters.age === '13-17' && (age < 13 || age > 17)) return false;
      if (filters.age === '18-24' && (age < 18 || age > 24)) return false;
      if (filters.age === '25-34' && (age < 25 || age > 34)) return false;
      if (filters.age === '35-44' && (age < 35 || age > 44)) return false;
      if (filters.age === '45-54' && (age < 45 || age > 54)) return false;
      if (filters.age === '55+' && age < 55) return false;
    }
    return true;
  });

  // Calculate distinct programmes active in this filtered set
  const activeProgrammes = events?.map(e => e.programmes).filter(Boolean) as any[];
  
  // Deduplicate programmes
  const uniqueProgrammesMap = new Map();
  activeProgrammes.forEach(p => {
    if (p && !uniqueProgrammesMap.has(p.id)) {
      uniqueProgrammesMap.set(p.id, { id: p.id, name: p.programme_name });
    }
  });
  const uniqueProgrammesList = Array.from(uniqueProgrammesMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  // Time periods setup
  const uniqueMonthsMap = new Map();
  const uniqueQuartersMap = new Map();
  const uniqueWeeksMap = new Map();
  
  const getMonthKey = (d: Date) => `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
  const getQuarterKey = (d: Date) => `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
  const getWeekKey = (d: Date) => {
    const start = new Date(d.getFullYear(), 0, 1);
    const days = Math.floor((d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + start.getDay() + 1) / 7);
    return `W${week} ${d.getFullYear()}`;
  };

  events.forEach(e => {
    if (!e.event_date) return;
    const d = new Date(e.event_date);
    
    const mKey = getMonthKey(d);
    if (!uniqueMonthsMap.has(mKey)) uniqueMonthsMap.set(mKey, { id: mKey, name: mKey, sort: d.getFullYear() * 100 + d.getMonth() });

    const qKey = getQuarterKey(d);
    if (!uniqueQuartersMap.has(qKey)) uniqueQuartersMap.set(qKey, { id: qKey, name: qKey, sort: d.getFullYear() * 10 + Math.floor(d.getMonth() / 3) + 1 });

    const wKey = getWeekKey(d);
    const start = new Date(d.getFullYear(), 0, 1);
    const days = Math.floor((d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + start.getDay() + 1) / 7);
    if (!uniqueWeeksMap.has(wKey)) uniqueWeeksMap.set(wKey, { id: wKey, name: wKey, sort: d.getFullYear() * 100 + week });
  });

  const monthsList = Array.from(uniqueMonthsMap.values()).sort((a, b) => a.sort - b.sort);
  const quartersList = Array.from(uniqueQuartersMap.values()).sort((a, b) => a.sort - b.sort);
  const weeksList = Array.from(uniqueWeeksMap.values()).sort((a, b) => a.sort - b.sort);

  // Build the NADI Data Table
  const nadiRows = (nadis || []).map(n => {
    const nadiEvents = (events || []).filter(e => e.nadi_id === n.id);
    const nadiEventIds = new Set(nadiEvents.map(e => e.id));
    const nadiEps = filteredEps.filter(ep => nadiEventIds.has(ep.event_id));
    
    const row: any = {
      id: n.id,
      refId: n.ref_id,
      name: n.site_name,
      state: (n.states as any)?.state_name || '-',
      programmes: {},
      monthly: {},
      quarterly: {},
      weekly: {},
      totalEvents: nadiEvents.length,
      totalPax: new Set(nadiEps.map(ep => ep.participant_id)).size,
      totalParticipation: nadiEps.length
    };

    // Calculate Programmes
    uniqueProgrammesList.forEach(prog => {
      const progEvents = nadiEvents.filter(e => e.programme_id === prog.id);
      const progEventIds = new Set(progEvents.map(e => e.id));
      const progEps = nadiEps.filter(ep => progEventIds.has(ep.event_id));
      row.programmes[prog.id] = { events: progEvents.length, pax: new Set(progEps.map(ep => ep.participant_id)).size, participation: progEps.length };
    });

    // Calculate Months
    monthsList.forEach(m => {
      const evts = nadiEvents.filter(e => e.event_date && getMonthKey(new Date(e.event_date)) === m.id);
      const ids = new Set(evts.map(e => e.id));
      const epsList = nadiEps.filter(ep => ids.has(ep.event_id));
      row.monthly[m.id] = { events: evts.length, pax: new Set(epsList.map(ep => ep.participant_id)).size, participation: epsList.length };
    });

    // Calculate Quarters
    quartersList.forEach(q => {
      const evts = nadiEvents.filter(e => e.event_date && getQuarterKey(new Date(e.event_date)) === q.id);
      const ids = new Set(evts.map(e => e.id));
      const epsList = nadiEps.filter(ep => ids.has(ep.event_id));
      row.quarterly[q.id] = { events: evts.length, pax: new Set(epsList.map(ep => ep.participant_id)).size, participation: epsList.length };
    });

    // Calculate Weeks
    weeksList.forEach(w => {
      const evts = nadiEvents.filter(e => e.event_date && getWeekKey(new Date(e.event_date)) === w.id);
      const ids = new Set(evts.map(e => e.id));
      const epsList = nadiEps.filter(ep => ids.has(ep.event_id));
      row.weekly[w.id] = { events: evts.length, pax: new Set(epsList.map(ep => ep.participant_id)).size, participation: epsList.length };
    });

    return row;
  });

  const kpis = {
    totalEvents: events?.length || 0,
    totalNadi: realTotalNadi,
    totalPax: new Set(filteredEps.map(ep => ep.participant_id)).size,
    totalParticipation: filteredEps.length,
  };

  // Build State Data Table by aggregating nadiRows
  const stateRowsMap = new Map<string, any>();
  
  nadiRows.forEach(row => {
    const stateName = row.state;
    if (!stateRowsMap.has(stateName)) {
      stateRowsMap.set(stateName, {
        id: stateName,
        refId: '-',
        name: stateName,
        state: stateName,
        programmes: {},
        monthly: {},
        quarterly: {},
        weekly: {},
        totalEvents: 0,
        totalPax: 0,
        totalParticipation: 0
      });
    }
    
    const stateRow = stateRowsMap.get(stateName);
    stateRow.totalEvents += row.totalEvents;
    stateRow.totalPax += row.totalPax;
    stateRow.totalParticipation += row.totalParticipation;
    
    uniqueProgrammesList.forEach(prog => {
      if (!stateRow.programmes[prog.id]) stateRow.programmes[prog.id] = { events: 0, pax: 0, participation: 0 };
      stateRow.programmes[prog.id].events += row.programmes[prog.id]?.events || 0;
      stateRow.programmes[prog.id].pax += row.programmes[prog.id]?.pax || 0;
      stateRow.programmes[prog.id].participation += row.programmes[prog.id]?.participation || 0;
    });
  });

  const stateRows = Array.from(stateRowsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  return {
    kpis,
    nadiRows,
    stateRows,
    programmes: uniqueProgrammesList,
    months: monthsList,
    quarters: quartersList,
    weeks: weeksList
  };
}
