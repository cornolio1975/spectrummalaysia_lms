"use client";

import { useState } from "react";
import { deleteMedia } from "@/app/actions/media";
import { FileUploader } from "@/components/ui/file-uploader";

interface MediaClientProps {
  mediaFiles: any[];
}

export function MediaClient({ mediaFiles }: MediaClientProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id: string, fileUrl: string) => {
    if (confirm("Are you sure you want to delete this file? This will break any links pointing to it.")) {
      // The fileUrl looks like https://<project>.supabase.co/storage/v1/object/public/spectrummy-media/category/filename.ext
      // We need to extract just the path 'category/filename.ext'
      
      let filePath = fileUrl;
      const urlParts = fileUrl.split('/spectrummy-media/');
      if (urlParts.length > 1) {
        filePath = urlParts[1];
      }

      await deleteMedia(id, filePath);
    }
  };

  const filteredMedia = mediaFiles.filter((m) => {
    const matchesSearch = (m.title || m.file_name).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (fileType: string) => {
    if (!fileType) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('pdf')) return '📑';
    return '📄';
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>Media Library</h1>
            <p>Manage uploaded files, videos, and documents</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setIsUploading(true)}>+ Upload File</button>
        </div>
      </div>
      
      <div className="page-body">
        <div className="card" style={{ padding: "0" }}>
          <div className="filter-bar" style={{ margin: 0, border: "none", borderBottom: "1px solid var(--border)", borderRadius: 0, display: "flex", gap: "10px" }}>
            <div className="search-input-wrap" style={{ flex: 1 }}>
              <span className="search-icon">🔍</span>
              <input 
                className="form-input" 
                placeholder="Search media by title or filename…" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="form-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ width: "200px" }}>
              <option value="all">All Categories</option>
              <option value="learning_video">Learning Videos</option>
              <option value="document">Documents</option>
              <option value="participant_photo">Participant Photos</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="p-6">
            {filteredMedia.length === 0 ? (
              <div className="text-center p-12 text-gray-500">
                <div className="text-5xl mb-4">📁</div>
                <p>No media files found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMedia.map((m) => (
                  <div key={m.id} className="border rounded-lg overflow-hidden flex flex-col bg-white hover:shadow-md transition-shadow">
                    <div className="h-32 bg-gray-100 flex items-center justify-center border-b relative group">
                      {m.file_type?.includes('image') ? (
                        <img src={m.file_url} alt={m.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-5xl opacity-50">{getFileIcon(m.file_type)}</div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm bg-white text-black border-none">View</a>
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <div className="font-medium text-sm text-gray-900 truncate mb-1" title={m.title}>{m.title}</div>
                      <div className="text-xs text-gray-500 truncate mb-3">{m.file_name}</div>
                      
                      <div className="mt-auto flex justify-between items-center text-xs">
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">{m.category.replace('_', ' ')}</span>
                        <button className="text-red-500 hover:underline" onClick={() => handleDelete(m.id, m.file_url)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Upload File</h2>
            <FileUploader 
              onSuccess={() => setIsUploading(false)} 
              onCancel={() => setIsUploading(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
}
