'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function VideoUploader({ workspaceId }: { workspaceId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Basic validation
      if (selectedFile.size > 500 * 1024 * 1024) { // 500MB limit for UI check
        setErrorMsg('File exceeds 500MB limit.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setErrorMsg('');
      setStatusMsg('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setErrorMsg('');
    setStatusMsg('Uploading...');

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${workspaceId}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('trainer_content')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          // Note: In a real app, use TUS resumable uploads for large video files.
          // This uses standard upload for demonstration purposes.
        });

      if (uploadError) throw uploadError;

      // Register file in media table
      const { error: dbError } = await supabase
        .from('media')
        .insert({
          file_name: file.name,
          original_name: file.name,
          file_url: filePath,
          file_type: file.type,
          file_size: file.size,
          category: file.type.startsWith('video/') ? 'learning_video' : 'document',
          trainer_workspace_id: workspaceId
        });

      if (dbError) throw dbError;

      setStatusMsg('Upload complete!');
      setFile(null);
      
      // Optionally trigger a refresh
      window.location.reload();

    } catch (error: any) {
      setErrorMsg(`Upload failed: ${error.message}`);
      setStatusMsg('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-2 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500">MP4, PDF, DOCX (Max. 500MB)</p>
          </div>
          <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" />
        </label>
      </div>

      {file && (
        <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="truncate pr-4 text-sm font-medium text-blue-900">{file.name}</div>
          <button 
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}

      {errorMsg && <p className="text-sm text-red-600 font-medium">{errorMsg}</p>}
      {statusMsg && <p className="text-sm text-green-600 font-medium">{statusMsg}</p>}
      
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '50%' }}></div>
          <p className="text-xs text-gray-500 mt-1 text-right">Processing...</p>
        </div>
      )}
    </div>
  );
}
