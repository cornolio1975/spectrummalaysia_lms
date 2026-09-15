"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function getMedia() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching media:", error);
    return { error: error.message };
  }

  return { data };
}

export async function uploadMedia(formData: FormData) {
  const file = formData.get("file") as File;
  const category = formData.get("category") as string;
  const title = formData.get("title") as string;
  
  if (!file) return { error: "No file provided" };
  if (!category) return { error: "Category is required" };

  const supabase = await createClient();
  
  // Create a unique file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${category}/${fileName}`;

  // Upload to Supabase Storage
  const { data: storageData, error: storageError } = await supabase
    .storage
    .from("spectrummy-media")
    .upload(filePath, file);

  if (storageError) {
    console.error("Storage upload error:", storageError);
    return { error: storageError.message };
  }

  // Get the public URL
  const { data: publicUrlData } = supabase
    .storage
    .from("spectrummy-media")
    .getPublicUrl(filePath);

  // Insert record into media table
  const { data: mediaData, error: dbError } = await supabase
    .from("media")
    .insert([{
      category,
      file_name: fileName,
      original_name: file.name,
      file_url: publicUrlData.publicUrl,
      file_type: file.type,
      file_size: file.size,
      title: title || file.name,
      is_public: true
    }])
    .select()
    .single();

  if (dbError) {
    console.error("Database insert error:", dbError);
    return { error: dbError.message };
  }

  revalidatePath("/media");
  return { data: mediaData };
}

export async function deleteMedia(id: string, filePath: string) {
  const supabase = await createClient();
  
  // First, remove from storage
  const { error: storageError } = await supabase
    .storage
    .from("spectrummy-media")
    .remove([filePath]);

  if (storageError) {
    console.error("Storage delete error:", storageError);
    // Proceeding to soft-delete anyway as the file might already be gone
  }

  // Soft delete in database
  const { error: dbError } = await supabase
    .from("media")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (dbError) {
    console.error("Database delete error:", dbError);
    return { error: dbError.message };
  }

  revalidatePath("/media");
  return { success: true };
}
