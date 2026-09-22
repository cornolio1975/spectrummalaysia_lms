"use client";

import { useState } from "react";
import { FileText, Search, MoreVertical, Eye, Download, CheckCircle, XCircle, File } from "lucide-react";
import { useRouter } from "next/navigation";

export function TrainerDocumentsClient({ documents }: { documents: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'badge-success';
      case 'rejected': return 'badge-error';
      case 'pending':
      default: return 'badge-warning';
    }
  };

  const getDocumentIcon = (type: string) => {
    return <File className="h-5 w-5" />;
  };

  const filteredDocs = documents.filter(doc => 
    doc.document_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.trainers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (id: string, action: string) => {
    setOpenDropdown(null);
    alert(`Action ${action} triggered for document ID: ${id}`);
    router.refresh();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="relative max-w-sm w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="form-input w-full pl-10 bg-white border-gray-300"
            placeholder="Search documents or trainers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500 font-medium">
          {filteredDocs.length} documents
        </div>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Document Name</th>
            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Trainer</th>
            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Size / Date</th>
            <th className="px-6 py-4 font-medium text-gray-500 text-sm">Status</th>
            <th className="px-6 py-4 font-medium text-gray-500 text-sm text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc: any) => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{doc.document_name}</h4>
                      <p className="text-xs text-gray-500 capitalize">{doc.document_type || "General"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-primary-700">
                  {doc.trainers?.name || "Unknown"}
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  <div className="flex flex-col">
                    <span>{doc.file_size ? (doc.file_size / 1024 / 1024).toFixed(2) + " MB" : "N/A"}</span>
                    <span className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${getStatusColor(doc.status)} capitalize`}>
                    {doc.status || "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right relative">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === doc.id ? null : doc.id)}
                    className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  
                  {openDropdown === doc.id && (
                    <div className="absolute right-6 top-10 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50 text-left">
                      <button 
                        onClick={() => handleAction(doc.id, 'preview')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        <Eye className="h-4 w-4" /> Secure Preview
                      </button>
                      <button 
                        onClick={() => handleAction(doc.id, 'download')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        <Download className="h-4 w-4" /> Download
                      </button>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      {(doc.status !== 'verified') && (
                        <button 
                          onClick={() => handleAction(doc.id, 'verify')}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left"
                        >
                          <CheckCircle className="h-4 w-4" /> Verify Document
                        </button>
                      )}
                      {(doc.status !== 'rejected') && (
                        <button 
                          onClick={() => handleAction(doc.id, 'reject')}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <XCircle className="h-4 w-4" /> Reject Document
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p>No documents found matching your criteria.</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
