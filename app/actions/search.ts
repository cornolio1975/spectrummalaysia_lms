"use server";

import { createClient } from "@/utils/supabase/server";

export interface GlobalSearchResult {
  category: "course" | "programme" | "credential" | "participant" | "document";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export async function universalGlobalSearch(query: string): Promise<{ data: GlobalSearchResult[] }> {
  if (!query || query.trim().length < 2) {
    return { data: [] };
  }

  const cleanQuery = query.trim().toLowerCase();
  const supabase = await createClient();

  const [coursesRes, programmesRes, credentialsRes, participantsRes, evidenceRes] =
    await Promise.all([
      supabase
        .from("courses")
        .select("id, title, course_code, level")
        .ilike("title", `%${cleanQuery}%`)
        .limit(5),
      supabase
        .from("programmes")
        .select("id, programme_name, programme_code")
        .ilike("programme_name", `%${cleanQuery}%`)
        .limit(5),
      supabase
        .from("credentials")
        .select("id, name, credential_code, credential_type")
        .ilike("name", `%${cleanQuery}%`)
        .limit(5),
      supabase
        .from("participants")
        .select("id, full_name, ic_number, email")
        .or(`full_name.ilike.%${cleanQuery}%,email.ilike.%${cleanQuery}%`)
        .limit(5),
      supabase
        .from("evidence_repository")
        .select("id, title, evidence_type, file_url")
        .ilike("title", `%${cleanQuery}%`)
        .limit(5),
    ]);

  const results: GlobalSearchResult[] = [];

  for (const c of coursesRes.data || []) {
    results.push({
      category: "course",
      id: c.id,
      title: c.title,
      subtitle: `Course • [${c.course_code}] • ${c.level}`,
      href: `/courses/${c.id}`,
    });
  }

  for (const p of programmesRes.data || []) {
    results.push({
      category: "programme",
      id: p.id,
      title: p.programme_name,
      subtitle: `Programme • [${p.programme_code}]`,
      href: `/programmes/${p.id}`,
    });
  }

  for (const cred of credentialsRes.data || []) {
    results.push({
      category: "credential",
      id: cred.id,
      title: cred.name,
      subtitle: `Credential • [${cred.credential_code}] • ${cred.credential_type}`,
      href: `/credentials/${cred.id}`,
    });
  }

  for (const part of participantsRes.data || []) {
    results.push({
      category: "participant",
      id: part.id,
      title: part.full_name,
      subtitle: `Learner • IC: ${part.ic_number || "N/A"} • ${part.email || ""}`,
      href: `/learner-360/${part.id}`,
    });
  }

  for (const ev of evidenceRes.data || []) {
    results.push({
      category: "document",
      id: ev.id,
      title: ev.title,
      subtitle: `Evidence Artifact • ${ev.evidence_type}`,
      href: `/evidence`,
    });
  }

  return { data: results };
}
