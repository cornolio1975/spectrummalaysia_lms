"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCertificates() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("certificates")
    .select(`
      *,
      participants (
        full_name
      ),
      programmes (
        programme_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching certificates:", error);
    return { error: error.message };
  }

  return { data };
}

export async function getCertificateByNo(certificateNo: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("certificates")
    .select(`
      *,
      participants (
        full_name, phone
      ),
      programmes (
        programme_name,
        programme_code
      )
    `)
    .eq("certificate_no", certificateNo)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function issueCertificate(participantId: string, programmeId: string) {
  const supabase = await createClient();
  
  // Verify participant isn't already issued a certificate for this programme
  const { data: existing } = await supabase
    .from("certificates")
    .select("id")
    .eq("participant_id", participantId)
    .eq("programme_id", programmeId)
    .neq("status", "revoked")
    .single();

  if (existing) {
    return { error: "Participant already has an active certificate for this programme." };
  }

  const certNo = `SpectrumMY-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const { data, error } = await supabase
    .from("certificates")
    .insert([{
      certificate_no: certNo,
      participant_id: participantId,
      programme_id: programmeId,
      status: "issued",
      issue_date: new Date().toISOString().split("T")[0]
    }])
    .select()
    .single();

  if (error) {
    console.error("Error issuing certificate:", error);
    return { error: error.message };
  }

  revalidatePath("/certificates");
  return { data };
}

export async function revokeCertificate(certificateId: string, reason: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("certificates")
    .update({
      status: "revoked",
      revoke_reason: reason,
      revoked_at: new Date().toISOString()
    })
    .eq("id", certificateId)
    .select()
    .single();

  if (error) {
    console.error("Error revoking certificate:", error);
    return { error: error.message };
  }

  revalidatePath("/certificates");
  if (data?.certificate_no) {
    revalidatePath(`/verify/${data.certificate_no}`);
  }
  return { data };
}
