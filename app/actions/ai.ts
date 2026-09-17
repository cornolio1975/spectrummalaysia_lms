"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { AIService } from "@/services/ai-gateway";

export async function getAIProviders() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_providers")
    .select(`
      *,
      ai_models (*)
    `)
    .order("priority", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return { data: data || [] };
}

export async function toggleAIProvider(providerId: string, isEnabled: boolean) {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("ai_providers")
    .update({
      is_enabled: isEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", providerId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Audit log
  await supabase.from("ai_audit_logs").insert([{
    actor_id: user.user?.id,
    action: isEnabled ? "enable_provider" : "disable_provider",
    target_entity: `ai_provider:${providerId}`,
  }]);

  revalidatePath("/admin/ai/providers");
  return { data };
}

export async function setAIProviderDefault(providerId: string) {
  const supabase = await createClient();

  // Reset existing defaults
  await supabase.from("ai_providers").update({ is_default: false }).neq("id", providerId);

  const { data, error } = await supabase
    .from("ai_providers")
    .update({ is_default: true, is_enabled: true, updated_at: new Date().toISOString() })
    .eq("id", providerId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/ai/providers");
  return { data };
}

export async function updateAIProvider(providerId: string, payload: {
  name?: string;
  endpoint?: string;
  api_key_encrypted?: string;
  daily_request_limit?: number;
  monthly_request_limit?: number;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_providers")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", providerId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/ai/providers");
  return { data };
}

export async function getAIFeatureSettings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_feature_settings")
    .select(`
      *,
      provider:ai_providers!ai_feature_settings_provider_id_fkey (name, code),
      model:ai_models!ai_feature_settings_model_id_fkey (model_name, model_code),
      fallback_provider:ai_providers!ai_feature_settings_fallback_provider_id_fkey (name, code)
    `)
    .order("category", { ascending: true });

  if (error) return { error: error.message };
  return { data: data || [] };
}

export async function updateAIFeatureSetting(id: string, payload: {
  is_enabled?: boolean;
  provider_id?: string;
  model_id?: string;
  fallback_provider_id?: string;
  temperature?: number;
  max_tokens?: number;
  allow_external_ai?: boolean;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_feature_settings")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/ai/features");
  return { data };
}

export async function executeAITest(params: {
  featureCode: string;
  prompt: string;
  providerCode?: string;
  modelCode?: string;
  temperature?: number;
}) {
  try {
    const res = await AIService.generate({
      featureCode: params.featureCode,
      prompt: params.prompt,
      providerCode: params.providerCode,
      modelCode: params.modelCode,
      temperature: params.temperature ?? 0.7,
      userRole: "admin",
    });

    return { data: res };
  } catch (err: any) {
    return { error: err.message || "Test generation failed" };
  }
}

export async function getAIUsageStats() {
  const supabase = await createClient();

  const [logsRes, budgetRes, providersRes] = await Promise.all([
    supabase
      .from("ai_usage_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("ai_budgets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("ai_providers").select("code, name, is_enabled"),
  ]);

  const logs = logsRes.data || [];
  const budget = budgetRes.data || {
    max_monthly_budget_usd: 50.0,
    current_spend_usd: 0.0,
    alert_threshold_pct: 80,
  };

  const totalRequests = logs.length;
  const successfulRequests = logs.filter((l) => l.status === "success" || l.status === "simulated").length;
  const simulatedRequests = logs.filter((l) => l.status === "simulated").length;
  const totalTokens = logs.reduce((acc, l) => acc + (l.total_tokens || 0), 0);
  const avgLatency =
    logs.length > 0 ? Math.round(logs.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / logs.length) : 0;

  return {
    data: {
      logs,
      budget,
      providers: providersRes.data || [],
      metrics: {
        totalRequests,
        successfulRequests,
        simulatedRequests,
        totalTokens,
        avgLatency,
      },
    },
  };
}

export async function generateAICourseDraftAction(params: {
  topic: string;
  category: string;
  targetLevel: string;
  targetHours: number;
}) {
  const { generateAICourseDraft } = await import("@/services/ai-assistant");
  return generateAICourseDraft(params);
}

export async function queryAILearnerAssistantAction(params: {
  userQuestion: string;
  courseContext?: string;
}) {
  const { queryAILearnerAssistant } = await import("@/services/ai-assistant");
  return queryAILearnerAssistant(params);
}
