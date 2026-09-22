import React from 'react';
import { getLearnerWorkspace } from '@/services/learner-workspace';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function LearnerCertificatesPage() {
  let errorMsg = null;
  let issuances = [];

  try {
    const { userId } = await getLearnerWorkspace();
    const supabase = await createClient();

    // Fetch achievements (credential_issuances)
    const { data } = await supabase
      .from('credential_issuances')
      .select('*, credentials(*)')
      .eq('status', 'issued')
      .order('issued_at', { ascending: false });
      
    if (data) {
      issuances = data;
    }

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

  const certificates = issuances.filter((i: any) => i.credentials?.type === 'certificate');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
          <p className="text-gray-500 mt-2">View, download, and share your earned certificates.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/learner-workspace/badges" className="text-indigo-600 font-medium hover:underline">
            View Badges &rarr;
          </Link>
        </div>
      </header>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-500 shadow-sm">
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Certificates Yet</h3>
          <p>Complete courses and programmes to earn certificates.</p>
          <Link href="/learner-workspace/courses" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">
            Go to My Learning
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((issuance: any) => (
            <div key={issuance.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col items-center text-center">
              <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg mb-4 flex items-center justify-center border border-gray-200 relative overflow-hidden group">
                {/* Mock Certificate Preview */}
                <div className="absolute inset-2 border-4 border-double border-gray-300 p-2 text-center flex flex-col justify-center bg-white/50">
                  <div className="text-xs uppercase text-gray-400 font-bold tracking-widest mb-2">Certificate of Completion</div>
                  <div className="text-sm font-serif font-bold text-gray-800 leading-tight">
                    {issuance.credentials?.name}
                  </div>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                  <button className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition" title="Download">⬇️</button>
                  <button className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition" title="Share">🔗</button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 leading-tight">{issuance.credentials?.name}</h3>
              <p className="text-xs text-gray-500 mt-1">Issued: {new Date(issuance.issued_at).toLocaleDateString()}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                <p className="text-[10px] text-gray-400 font-mono text-left break-all">ID: {issuance.id}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
