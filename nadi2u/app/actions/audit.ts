"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAuditLogs(limit = 100) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      *
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function createAuditLog(
  action: string,
  entityType: string,
  entityId?: string,
  notes?: string,
  oldValues?: any,
  newValues?: any
) {
  const supabase = await createClient();
  
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("audit_logs")
    .insert([{
      user_id: userData.user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      notes,
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating audit log:", error);
    return { error: error.message };
  }

  return { data };
}
