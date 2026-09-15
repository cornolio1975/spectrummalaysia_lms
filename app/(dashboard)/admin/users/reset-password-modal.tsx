"use client";

import { useState, useTransition } from "react";
import { adminResetPassword } from "@/app/actions/users";

export function ResetPasswordModal({
  isOpen,
  onClose,
  userId,
  userName,
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    startTransition(async () => {
      const res = await adminResetPassword(userId, newPassword);
      if (res.error) {
        setError(res.error);
      } else {
        // Success
        setNewPassword("");
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Reset Password</h2>
          <button 
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            Set a new password for <strong>{userName}</strong>.
          </p>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)]">New Password</label>
            <input 
              required
              type="text" 
              className="form-input" 
              placeholder="e.g. Password123!"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-[var(--border)]">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending || !newPassword}
              className="btn btn-primary"
            >
              {isPending ? "Resetting..." : "Reset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
