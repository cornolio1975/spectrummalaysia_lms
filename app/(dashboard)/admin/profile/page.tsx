import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { PasswordForm } from "./password-form";

export const metadata = {
  title: "My Profile | SpectrumMY LMS",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-6 max-w-[800px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">My Profile</h1>
        <p className="text-[var(--text-muted)]">
          Manage your account settings and update your password.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Account Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Full Name</label>
              <div className="mt-1 font-medium text-[var(--text-primary)]">
                {profile?.full_name || "Unknown User"}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Email Address</label>
              <div className="mt-1 font-medium text-[var(--text-primary)]">
                {user.email}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">System Role</label>
              <div className="mt-1 font-medium text-[var(--text-primary)] capitalize">
                {profile?.role?.replace("_", " ") || "Observer"}
              </div>
            </div>
          </div>
        </div>

        {/* Password Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[var(--border)] overflow-hidden">
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Change Password</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Ensure your account is using a long, random password to stay secure.</p>
          </div>
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
