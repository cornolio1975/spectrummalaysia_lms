"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { N8nService } from "@/services/n8n-client";

export async function getN8nConfig() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("n8n_integrations")
    .select("*")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function updateN8nConfig(payload: {
  base_url: string;
  is_enabled: boolean;
  webhook_secret_hash?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("n8n_integrations")
    .update({
      base_url: payload.base_url,
      is_enabled: payload.is_enabled,
      webhook_secret_hash: payload.webhook_secret_hash || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "22222222-aaaa-4000-8000-000000000001")
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/settings/n8n");
  return { data };
}

export async function testN8nConnectionAction() {
  return await N8nService.testConnection();
}

export async function getN8nRecentJobs() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("n8n_jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    return { error: error.message };
  }

  return { data: data || [] };
}
