"use client";

import { useState } from "react";
import { Award, Search, MoreVertical, CheckCircle, XCircle, AlertTriangle, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateTrainerStatus } from "@/app/actions/trainers";

export function TrainerCredentialsClient({ credentials }: { credentials: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();

  const getCalculatedStatus = (cred: any) => {
    if (cred.status === 'rejected') return { label: 'Rejected', color: 'badge-error' };
    if (cred.status === 'pending') return { label: 'Pending Verification', color: 'badge-warning' };
    
    if (!cred.expiry_date) return { label: 'Valid (Lifetime)', color: 'badge-success' };
    
    const expiry = new Date(cred.expiry_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilExpiry < 0) {
      return { label: 'Expired', color: 'badge-error' };
    } else if (daysUntilExpiry <= 30) {
      return { label: 'Expiring Soon', color: 'badge-warning' };
    }
    
    return { label: 'Valid', color: 'badge-success' };
  };

  const filteredCredentials = credentials.filter(cred => {
    const matchesSearch = 
      cred.credential_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cred.trainers?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (statusFilter === 'all') return matchesSearch;
    
    const calcStatus = getCalculatedStatus(cred).label.toLowerCase();
    if (statusFilter === 'valid') return matchesSearch && calcStatus.includes('valid');
    if (statusFilter === 'expiring') return matchesSearch && calcStatus === 'expiring soon';
    if (statusFilter === 'expired') return matchesSearch && calcStatus === 'expired';
    if (statusFilter === 'pending') return matchesSearch && calcStatus === 'pending verification';
    if (statusFilter === 'rejected') return matchesSearch && calcStatus === 'rejected';
    
    return matchesSearch;
  });

  const handleUpdateStatus = async (id: string, action: string) => {
    // In a real app we'd have a specific action for credentials.
    // Reusing the generic updateTrainerStatus as placeholder for the UI
    setOpenDropdown(null);
    alert(`Credential ${action} action triggered for ID: ${id}`);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input w-full pl-10 bg-white border-gray-300 focus:border-primary-500 focus:ring-primary-500"
              placeholder="Search credentials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="form-select bg-white border-gray-300"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="valid">Valid</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="text-sm text-gray-500 font-medium">
          {filteredCredentials.length} credentials
        </div>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Credential Details</th>
            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Trainer</th>
            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Expiry Date</th>
            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Status</th>
            <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredCredentials.length > 0 ? (
            filteredCredentials.map((cred: any) => {
              const status = getCalculatedStatus(cred);
              
              return (
                <tr key={cred.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{cred.credential_name}</h4>
                        <p className="text-xs text-gray-500">Issued by {cred.issuing_organization}</p>
                        {cred.credential_number && <p className="text-xs text-gray-400 mt-1">ID: {cred.credential_number}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-primary-700">
                    {cred.trainers?.name || "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {cred.expiry_date ? new Date(cred.expiry_date).toLocaleDateString() : 'Lifetime'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === cred.id ? null : cred.id)}
                      className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    
                    {openDropdown === cred.id && (
                      <div className="absolute right-6 top-10 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50 text-left">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left">
                          <Eye className="h-4 w-4" /> View Details
                        </button>
                        
                        {(cred.status === 'pending' || cred.status === 'rejected') && (
                          <button 
                            onClick={() => handleUpdateStatus(cred.id, 'verify')}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left border-t border-gray-100 mt-1 pt-2"
                          >
                            <CheckCircle className="h-4 w-4" /> Verify Credential
                          </button>
                        )}
                        
                        {cred.status !== 'rejected' && (
                          <button 
                            onClick={() => handleUpdateStatus(cred.id, 'reject')}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                          >
                            <XCircle className="h-4 w-4" /> Reject Credential
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                <Award className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p>No credentials found matching your criteria.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
