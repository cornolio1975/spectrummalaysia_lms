"use client";

import { useState, useRef } from "react";
import { uploadMedia } from "@/app/actions/media";

interface FileUploaderProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FileUploader({ onSuccess, onCancel }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("document");
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name);
      }
      
      // Auto-set category based on file type
      if (selectedFile.type.startsWith('video/')) setCategory('learning_video');
      else if (selectedFile.type.startsWith('image/')) setCategory('other');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("title", title);

    const result = await uploadMedia(formData);

    setIsUploading(false);

    if (result.error) {
      setError(result.error);
    } else {
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${file ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
        />
        {file ? (
          <div>
            <div className="text-4xl mb-2">📄</div>
            <p className="font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            <button type="button" className="text-sm text-red-500 hover:underline mt-2" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
              Remove file
            </button>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-2 text-gray-400">📁</div>
            <p className="font-medium text-gray-900">Click to select a file</p>
            <p className="text-sm text-gray-500 mt-1">Supports PDF, MP4, JPEG, PNG</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input 
          type="text" 
          className="form-input w-full" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="File title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select 
          className="form-select w-full" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="learning_video">Learning Video</option>
          <option value="document">Document (PDF/Word)</option>
          <option value="recorded_session">Recorded Session</option>
          <option value="participant_photo">Participant Photo</option>
          <option value="event_photo">Event Photo</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline" disabled={isUploading}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isUploading || !file}>
          {isUploading ? "Uploading..." : "Upload File"}
        </button>
      </div>
    </form>
  );
}
