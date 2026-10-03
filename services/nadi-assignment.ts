"use server";

import { createClient } from '@/utils/supabase/server';

export type NadiSiteSuggestion = {
  nadi_id: string;
  name: string;
  postcode: string;
  city: string;
  state_id: string;
  matchReason: string;
  priority: number;
};

export async function suggestNadiSite(
  postcode: string,
  city: string,
  stateId: string
): Promise<NadiSiteSuggestion[]> {
  const supabase = await createClient();

  // 1. Exact postcode match (Priority 1)
  const { data: exactPostcode } = await supabase
    .from('nadi_sites')
    .select('id, name, postcode, city, state_id')
    .eq('postcode', postcode)
    .eq('status', 'active');

  if (exactPostcode && exactPostcode.length > 0) {
    return exactPostcode.map(site => ({
      nadi_id: site.id,
      name: site.name,
      postcode: site.postcode,
      city: site.city,
      state_id: site.state_id,
      matchReason: 'Exact Postcode Match',
      priority: 1
    }));
  }

  // 2. Same city (Priority 3/4)
  const { data: cityMatch } = await supabase
    .from('nadi_sites')
    .select('id, name, postcode, city, state_id')
    .ilike('city', `%${city}%`)
    .eq('status', 'active');

  if (cityMatch && cityMatch.length > 0) {
    return cityMatch.map(site => ({
      nadi_id: site.id,
      name: site.name,
      postcode: site.postcode,
      city: site.city,
      state_id: site.state_id,
      matchReason: 'Same City',
      priority: 3
    }));
  }

  // 3. Same state (Priority 5)
  if (stateId) {
    const { data: stateMatch } = await supabase
      .from('nadi_sites')
      .select('id, name, postcode, city, state_id')
      .eq('state_id', stateId)
      .eq('status', 'active')
      .limit(5); // Don't return all sites in the state

    if (stateMatch && stateMatch.length > 0) {
      return stateMatch.map(site => ({
        nadi_id: site.id,
        name: site.name,
        postcode: site.postcode,
        city: site.city,
        state_id: site.state_id,
        matchReason: 'Same State',
        priority: 5
      }));
    }
  }

  return [];
}
