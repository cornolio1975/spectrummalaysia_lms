"use client";

import { useState, useTransition } from "react";
import { updateOwnPassword } from "@/app/actions/profile";

export function PasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword.length < 6) {
      setStatus({ message: "Password must be at least 6 characters long.", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ message: "Passwords do not match.", type: "error" });
      return;
    }

    startTransition(async () => {
      const res = await updateOwnPassword(newPassword);
      if (res.error) {
        setStatus({ message: res.error, type: "error" });
      } else {
        setStatus({ message: "Password updated successfully!", type: "success" });
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
      {status && (
        <div className={`p-3 text-sm rounded border ${status.type === "error" ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>
          {status.message}
        </div>
      )}

      <div className="max-w-md flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-primary)]" htmlFor="new-password">
          New Password
        </label>
        <input 
          id="new-password"
          required
          type="password" 
          className="form-input" 
          placeholder="Min. 6 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div className="max-w-md flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-primary)]" htmlFor="confirm-password">
          Confirm New Password
        </label>
        <input 
          id="confirm-password"
          required
          type="password" 
          className="form-input" 
          placeholder="Re-type new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          disabled={isPending || !newPassword || !confirmPassword}
          className="btn btn-primary"
        >
          {isPending ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );
}
