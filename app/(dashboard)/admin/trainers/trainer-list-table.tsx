"use client";

import { useState } from "react";
import { updateTrainerStatus } from "@/app/actions/trainers";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function TrainerListTable({ trainers, statusFilter }: { trainers: any[], statusFilter: string }) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    await updateTrainerStatus(id, newStatus);
    setIsUpdating(null);
    router.refresh();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'suspended':
      case 'inactive': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="card" style={{ padding: "0" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Trainer Name</th>
            <th>Email</th>
            <th>Specialization</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trainers && trainers.length > 0 ? (
            trainers.map((trainer: any) => (
              <tr key={trainer.id}>
                <td className="font-medium text-primary-600">
                  {trainer.name}
                </td>
                <td>{trainer.email || "-"}</td>
                <td>{trainer.specialization || "-"}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(trainer.status)} capitalize`}>
                    {trainer.status}
                  </span>
                </td>
                <td className="text-right flex items-center justify-end gap-2">
                  <Link href={`/events/trainers/${trainer.id}/edit`} className="text-sm font-medium text-primary-600 hover:underline">
                    Edit
                  </Link>
                  {statusFilter === 'pending' && (
                    <button 
                      onClick={() => handleStatusChange(trainer.id, 'active')}
                      disabled={isUpdating === trainer.id}
                      className="text-sm font-medium text-green-600 hover:underline ml-2"
                    >
                      Approve
                    </button>
                  )}
                  {statusFilter === 'active' && (
                    <button 
                      onClick={() => handleStatusChange(trainer.id, 'suspended')}
                      disabled={isUpdating === trainer.id}
                      className="text-sm font-medium text-red-600 hover:underline ml-2"
                    >
                      Suspend
                    </button>
                  )}
                  {statusFilter === 'suspended' && (
                    <button 
                      onClick={() => handleStatusChange(trainer.id, 'active')}
                      disabled={isUpdating === trainer.id}
                      className="text-sm font-medium text-green-600 hover:underline ml-2"
                    >
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center p-8 text-gray-500">
                No trainers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
