"use client";

import { useState } from "react";
import { updateTrainerStatus } from "@/app/actions/trainers";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MoreVertical, Edit, User, Link as LinkIcon, Ban, CheckCircle, Eye } from "lucide-react";

export function TrainerListTable({ trainers, statusFilter, canEdit = true }: { trainers: any[], statusFilter: string, canEdit?: boolean }) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();

  const itemsPerPage = 10;

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    await updateTrainerStatus(id, newStatus);
    setIsUpdating(null);
    setOpenDropdown(null);
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

  const filteredTrainers = trainers.filter(trainer => 
    trainer.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    trainer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage);
  const paginatedTrainers = filteredTrainers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="card p-0">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl">
        <div className="relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="form-input w-full pl-10 bg-gray-50 border-transparent focus:bg-white"
            placeholder="Search trainers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredTrainers.length} results
        </div>
      </div>

      <table className="data-table w-full">
        <thead>
          <tr>
            <th className="px-6 py-4">Trainer Name</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Specialization</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {paginatedTrainers && paginatedTrainers.length > 0 ? (
            paginatedTrainers.map((trainer: any) => (
              <tr key={trainer.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-primary-700">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                      {trainer.name?.substring(0,2).toUpperCase()}
                    </div>
                    {trainer.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{trainer.email || "-"}</td>
                <td className="px-6 py-4 text-gray-600">{trainer.specialization || "-"}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${getStatusBadgeClass(trainer.status)} capitalize`}>
                    {trainer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right relative">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === trainer.id ? null : trainer.id)}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  
                  {openDropdown === trainer.id && (
                    <div className="absolute right-6 top-10 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50 text-left">
                      <Link href={`/admin/trainers/${trainer.id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="h-4 w-4" /> View Profile
                      </Link>
                      
                      {canEdit && (
                        <>
                          <Link href={`/events/trainers/${trainer.id}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Edit className="h-4 w-4" /> Edit Details
                          </Link>
                          <Link href={`/admin/trainers/assignments`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <LinkIcon className="h-4 w-4" /> Assign Course
                          </Link>
                          
                          <div className="border-t border-gray-100 my-1"></div>
                          
                          {(statusFilter === 'pending' || trainer.status === 'pending') && (
                            <button 
                              onClick={() => handleStatusChange(trainer.id, 'active')}
                              disabled={isUpdating === trainer.id}
                              className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4" /> Approve
                            </button>
                          )}
                          {(statusFilter === 'active' || trainer.status === 'active') && (
                            <button 
                              onClick={() => handleStatusChange(trainer.id, 'suspended')}
                              disabled={isUpdating === trainer.id}
                              className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left text-red-600 hover:bg-red-50"
                            >
                              <Ban className="h-4 w-4" /> Suspend
                            </button>
                          )}
                          {(statusFilter === 'suspended' || trainer.status === 'suspended') && (
                            <button 
                              onClick={() => handleStatusChange(trainer.id, 'active')}
                              disabled={isUpdating === trainer.id}
                              className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4" /> Reactivate
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center p-12 text-gray-500 bg-white">
                <div className="flex flex-col items-center justify-center">
                  <Search className="h-10 w-10 text-gray-300 mb-3" />
                  <p>No trainers found matching your criteria.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-xl">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
