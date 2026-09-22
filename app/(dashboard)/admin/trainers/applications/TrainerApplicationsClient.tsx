"use client";

import { useState } from "react";
import { updateTrainerStatus } from "@/app/actions/trainers";
import { useRouter } from "next/navigation";
import { MoreHorizontal, User, Mail, Phone, Calendar, Clock, CheckCircle, Ban, AlertCircle } from "lucide-react";
import Link from "next/link";

export function TrainerApplicationsClient({ applications }: { applications: any[] }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const statuses = [
    { id: 'pending', label: 'Pending Review', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
    { id: 'review', label: 'In Review', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: AlertCircle },
    { id: 'active', label: 'Approved', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
    { id: 'rejected', label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200', icon: Ban },
  ];

  // Helper to map old statuses if needed
  const normalizeStatus = (status: string) => {
    if (status === 'suspended' || status === 'inactive') return 'rejected'; // For the kanban
    if (!status) return 'pending';
    return status;
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("trainerId", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const trainerId = e.dataTransfer.getData("trainerId");
    
    if (trainerId) {
      setIsUpdating(trainerId);
      await updateTrainerStatus(trainerId, newStatus);
      setIsUpdating(null);
      router.refresh();
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    await updateTrainerStatus(id, newStatus);
    setIsUpdating(null);
    router.refresh();
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-220px)] overflow-x-auto pb-4">
      {statuses.map((column) => {
        const columnApps = applications.filter(app => normalizeStatus(app.status) === column.id);
        
        return (
          <div 
            key={column.id} 
            className="flex-shrink-0 w-80 flex flex-col bg-gray-50 rounded-xl border border-gray-200"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`p-4 border-b rounded-t-xl font-bold flex justify-between items-center ${column.color}`}>
              <div className="flex items-center gap-2">
                <column.icon className="h-4 w-4" />
                {column.label}
              </div>
              <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">
                {columnApps.length}
              </span>
            </div>
            
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {columnApps.map(app => (
                <div 
                  key={app.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, app.id)}
                  className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-primary-300 transition-all ${isUpdating === app.id ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs flex-shrink-0">
                        {app.name?.substring(0,2).toUpperCase()}
                      </div>
                      <h4 className="font-bold text-gray-900 leading-tight">{app.name}</h4>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1.5 mb-3 mt-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{app.email}</span>
                    </div>
                    {app.specialization && (
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{app.specialization}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex gap-2">
                    <Link 
                      href={`/admin/trainers/${app.id}`}
                      className="flex-1 text-center py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded text-xs font-medium transition-colors"
                    >
                      View Profile
                    </Link>
                    
                    {column.id === 'pending' && (
                      <button 
                        onClick={() => handleStatusChange(app.id, 'review')}
                        className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium transition-colors"
                      >
                        Review
                      </button>
                    )}
                    {column.id === 'review' && (
                      <button 
                        onClick={() => handleStatusChange(app.id, 'active')}
                        className="flex-1 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded text-xs font-medium transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {columnApps.length === 0 && (
                <div className="text-center p-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  Drop trainers here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
