import React from 'react';
import { getTrainerWorkspace } from '@/services/trainer-workspace';
import { createClient } from '@/utils/supabase/server';
import VideoUploader from '@/components/trainer/VideoUploader';
import Link from 'next/link';

export default async function TrainerStoragePage() {
  let errorMsg = null;
  let workspaceInfo: any = null;
  let files: any[] = [];
  let workspaceStats: any = { total_storage_mb: 0, max_storage_mb: 5000 };

  try {
    workspaceInfo = await getTrainerWorkspace();
    const supabase = await createClient();

    // Fetch storage stats
    const { data: statsData } = await supabase
      .from('trainer_workspaces')
      .select('total_storage_mb, max_storage_mb')
      .eq('id', workspaceInfo.workspaceId)
      .single();
    
    if (statsData) workspaceStats = statsData;

    // Fetch files from the DB media table (representing uploaded assets)
    const { data: fileData, error: fileError } = await supabase
      .from('media')
      .select('*')
      .eq('trainer_workspace_id', workspaceInfo.workspaceId)
      .order('created_at', { ascending: false });

    if (fileError) throw fileError;
    files = fileData || [];

  } catch (error: any) {
    errorMsg = error.message;
  }

  if (errorMsg) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p>{errorMsg}</p>
      </div>
    );
  }

  const usagePercent = Math.min(100, (workspaceStats.total_storage_mb / workspaceStats.max_storage_mb) * 100);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Storage & Files</h1>
          <p className="text-gray-500 mt-2">Manage your uploaded videos, documents, and other resources.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 col-span-1">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Storage Usage</h3>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div className={`h-4 rounded-full ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 75 ? 'bg-yellow-500' : 'bg-blue-600'}`} style={{ width: `${usagePercent}%` }}></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 font-medium">
            <span>{workspaceStats.total_storage_mb.toFixed(2)} MB used</span>
            <span>{workspaceStats.max_storage_mb.toFixed(2)} MB limit</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 col-span-2">
           <h3 className="text-lg font-bold text-gray-800 mb-4">Upload New File</h3>
           <VideoUploader workspaceId={workspaceInfo.workspaceId} />
        </div>
      </div>

      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Uploads</h2>
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          {files.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No files uploaded yet.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file: any) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        <span className="text-sm font-medium text-gray-900">{file.file_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.file_size ? `${(file.file_size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
