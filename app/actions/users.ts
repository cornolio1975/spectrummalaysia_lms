"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient();

  // The database RLS policy ("profiles_write_admin") restricts UPDATE on profiles
  // to only users whose auth_role() is 'super_admin'.
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    console.error("Failed to update user role:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserAssignment(
  userId: string,
  type: "state_id" | "nadi_id",
  valueId: string | null
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ [type]: valueId })
    .eq("id", userId);

  if (error) {
    console.error(`Failed to update ${type}:`, error);
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: !currentStatus })
    .eq("id", userId);

  if (error) {
    console.error("Failed to toggle user status:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  try {
    const adminAuthClient = createAdminClient();
    
    // Deleting the user from auth.users will cascade and delete their profile
    const { error } = await adminAuthClient.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error("Failed to delete user:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function createUser(data: { email: string; fullName: string; role: string; password?: string }) {
  try {
    const adminAuthClient = createAdminClient();
    
    // 1. Create the user in auth.users
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email: data.email,
      password: data.password || "Password123!",
      email_confirm: true,
      user_metadata: { full_name: data.fullName }
    });

    if (authError || !authData.user) {
      console.error("Failed to create user:", authError);
      return { error: authError?.message || "Failed to create user" };
    }

    // 2. The handle_new_user trigger automatically creates a profile, but we need to update it with the specific role
    const supabase = await createClient();
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: data.role, full_name: data.fullName })
      .eq("id", authData.user.id);
      
    if (profileError) {
      // We log it, but the user is created
      console.error("Failed to update initial role:", profileError);
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function adminResetPassword(userId: string, newPassword: string) {
  try {
    const adminAuthClient = createAdminClient();
    
    const { error } = await adminAuthClient.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      console.error("Failed to reset user password:", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function editUser(userId: string, data: { fullName: string; phone?: string; email?: string }) {
  try {
    const supabase = await createClient();
    
    // 1. Update Profile (Name & Phone)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ 
        full_name: data.fullName,
        phone: data.phone || null
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Failed to update profile:", profileError);
      return { error: profileError.message };
    }

    // 2. Update Email in Auth if provided
    if (data.email) {
      const adminAuthClient = createAdminClient();
      const { error: authError } = await adminAuthClient.auth.admin.updateUserById(userId, {
        email: data.email,
        email_confirm: true, // Auto-confirm
      });

      if (authError) {
        console.error("Failed to update email:", authError);
        return { error: authError.message };
      }
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
