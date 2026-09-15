"use client";

import { useState, useTransition } from "react";
import { updateUserRole, updateUserAssignment, toggleUserStatus, deleteUser } from "@/app/actions/users";
import { AddUserModal } from "./add-user-modal";
import { ResetPasswordModal } from "./reset-password-modal";
import { EditUserModal } from "./edit-user-modal";

type User = {
  id: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  state_id: string | null;
  nadi_id: string | null;
  created_at: string;
};

type Option = { id: string; name: string };

const ROLES = [
  { value: "super_admin", label: "Super Admin" },
  { value: "programme_admin", label: "Programme Admin" },
  { value: "state_admin", label: "State Admin" },
  { value: "nadi_admin", label: "NADI Admin" },
  { value: "trainer", label: "Trainer" },
  { value: "registrar", label: "Registrar" },
  { value: "observer", label: "Observer" },
];

export function UserTable({
  users,
  states,
  nadiSites,
}: {
  users: User[];
  states: { id: string; state_name: string }[];
  nadiSites: { id: string; nadi_name: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resetModalUser, setResetModalUser] = useState<{ id: string; name: string } | null>(null);
  const [editModalUser, setEditModalUser] = useState<{ id: string; initialData: any } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    startTransition(async () => {
      const { error } = await updateUserRole(userId, newRole);
      if (error) {
        showToast(error, "error");
      } else {
        showToast("Role updated successfully", "success");
      }
    });
  };

  const handleAssignmentChange = (userId: string, type: "state_id" | "nadi_id", valueId: string) => {
    startTransition(async () => {
      const { error } = await updateUserAssignment(userId, type, valueId === "none" ? null : valueId);
      if (error) {
        showToast(error, "error");
      } else {
        showToast("Assignment updated successfully", "success");
      }
    });
  };

  const handleStatusToggle = (userId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const { error } = await toggleUserStatus(userId, currentStatus);
      if (error) {
        showToast(error, "error");
      } else {
        showToast("Status updated successfully", "success");
      }
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
    
    startTransition(async () => {
      const { error } = await deleteUser(userId);
      if (error) {
        showToast(error, "error");
      } else {
        showToast("User deleted successfully", "success");
      }
    });
  };

  return (
    <div className="relative">
      <div className="p-4 border-b border-[var(--border)] bg-white flex justify-between items-center">
        <h2 className="font-semibold text-[var(--text-primary)]">All Users ({users.length})</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary text-sm px-4 py-2"
        >
          + Add New User
        </button>
      </div>

      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <ResetPasswordModal
        isOpen={!!resetModalUser}
        onClose={() => setResetModalUser(null)}
        userId={resetModalUser?.id || ""}
        userName={resetModalUser?.name || ""}
      />

      <EditUserModal
        isOpen={!!editModalUser}
        onClose={() => setEditModalUser(null)}
        userId={editModalUser?.id || ""}
        initialData={editModalUser?.initialData || null}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded shadow-lg text-white z-50 transition-opacity ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
          {toast.message}
        </div>
      )}

      {isPending && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
          <div className="spinner spinner-md border-primary"></div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-subtle)] text-[var(--text-muted)] text-xs uppercase tracking-wider border-b border-[var(--border)]">
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Assignment</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-muted)]">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* USER INFO */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--text-primary)]">
                      {user.full_name || "Unknown User"}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] font-mono mt-1" title="User ID">
                      {user.id.substring(0, 8)}...
                    </div>
                  </td>

                  {/* ROLE */}
                  <td className="px-6 py-4">
                    <select
                      className="form-input text-sm py-1.5 px-3 h-auto min-w-[160px] bg-white cursor-pointer"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={isPending}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* CONTEXTUAL ASSIGNMENT */}
                  <td className="px-6 py-4">
                    {user.role === "state_admin" && (
                      <select
                        className="form-input text-sm py-1.5 px-3 h-auto min-w-[160px] bg-white cursor-pointer"
                        value={user.state_id || "none"}
                        onChange={(e) => handleAssignmentChange(user.id, "state_id", e.target.value)}
                        disabled={isPending}
                      >
                        <option value="none">-- Select State --</option>
                        {states.map((s) => (
                          <option key={s.id} value={s.id}>{s.state_name}</option>
                        ))}
                      </select>
                    )}
                    
                    {user.role === "nadi_admin" && (
                      <select
                        className="form-input text-sm py-1.5 px-3 h-auto min-w-[160px] bg-white cursor-pointer"
                        value={user.nadi_id || "none"}
                        onChange={(e) => handleAssignmentChange(user.id, "nadi_id", e.target.value)}
                        disabled={isPending}
                      >
                        <option value="none">-- Select NADI Site --</option>
                        {nadiSites.map((n) => (
                          <option key={n.id} value={n.id}>{n.nadi_name}</option>
                        ))}
                      </select>
                    )}

                    {user.role !== "state_admin" && user.role !== "nadi_admin" && (
                      <span className="text-sm text-[var(--text-muted)] italic">N/A</span>
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleStatusToggle(user.id, user.is_active)}
                      disabled={isPending}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        user.is_active 
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {user.is_active ? "Active" : "Disabled"}
                    </button>
                  </td>

                  {/* DATE */}
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setEditModalUser({ 
                        id: user.id, 
                        initialData: { fullName: user.full_name, phone: (user as any).phone || "" }
                      })}
                      disabled={isPending}
                      className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors p-2 mr-1"
                      title="Edit User Info"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => setResetModalUser({ id: user.id, name: user.full_name || "Unknown User" })}
                      disabled={isPending}
                      className="text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors p-2 mr-1"
                      title="Reset Password"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={isPending}
                      className="text-red-500 hover:text-red-700 transition-colors p-2"
                      title="Delete User"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
