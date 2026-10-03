"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient();
  
  // Verify caller is authorized to make this change
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  
  const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const allowedRoles = ['super_admin', 'programme_admin', 'state_admin', 'nadi_admin'];
  if (!callerProfile || !allowedRoles.includes(callerProfile.role)) {
    return { error: "Unauthorized: You don't have permission to change roles" };
  }

  // Use admin client to bypass RLS profiles_write_admin policy which only allows super_admin
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("profiles")
    .update({ role: newRole, account_status: 'active' })
    .eq("id", userId)
    .select();

  if (error) {
    console.error("Failed to update user role:", error);
    return { error: error.message };
  }
  
  if (!data || data.length === 0) {
     return { error: "Failed to update: User not found or RLS blocked" };
  }

  // Handle trainer table sync
  if (newRole === 'trainer') {
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
    if (profile) {
      const { data: existingTrainer } = await supabase.from('trainers').select('id').eq('profile_id', userId).maybeSingle();
      if (existingTrainer) {
        await supabase.from('trainers').update({ status: 'active', name: profile.full_name }).eq('id', existingTrainer.id);
      } else {
        await supabase.from('trainers').insert({
          profile_id: userId,
          name: profile.full_name,
          email: '', // Requires auth.users join to get real email, using empty for now
          status: 'active'
        });
      }
    }
  } else {
    // If they are no longer a trainer, set inactive (we shouldn't delete to preserve history)
    await supabase.from('trainers').update({ status: 'inactive' }).eq('profile_id', userId);
  }

  // Handle learner (participants) table sync
  if (newRole === 'learner') {
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', userId).single();
    if (profile) {
      const { data: existingParticipant } = await supabase.from('participants').select('id').eq('id', userId).maybeSingle();
      if (!existingParticipant) {
        await supabase.from('participants').insert({
          id: userId,
          full_name: profile.full_name || 'Unknown',
          email: '' // Requires auth.users join to get real email
        });
      }
    }
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

export async function updateAccountStatus(userId: string, status: "pending" | "active" | "inactive") {
  const supabase = await createClient();
  
  // Verify caller is authorized to make this change
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };
  
  const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const allowedRoles = ['super_admin', 'programme_admin', 'state_admin', 'nadi_admin'];
  if (!callerProfile || !allowedRoles.includes(callerProfile.role)) {
    return { error: "Unauthorized: You don't have permission to change status" };
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("profiles")
    .update({ account_status: status })
    .eq("id", userId)
    .select();

  if (error) {
    console.error("Failed to update account status:", error);
    return { error: error.message };
  }
  
  if (!data || data.length === 0) {
    return { error: "Failed to update: User not found or RLS blocked" };
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
      console.error("Failed to update initial role:", profileError);
    }

    // 3. If role is trainer, insert into trainers table
    if (data.role === 'trainer') {
      const { error: trainerError } = await supabase
        .from("trainers")
        .insert({
          profile_id: authData.user.id,
          name: data.fullName,
          email: data.email,
          status: 'active'
        });
      
      if (trainerError) {
        console.error("Failed to create trainer record:", trainerError);
      }
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
