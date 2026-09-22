import React from 'react';
import { getLearnerWorkspace } from '@/services/learner-workspace';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function LearnerBadgesPage() {
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

  const badges = issuances.filter((i: any) => i.credentials?.type === 'badge');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Digital Badges</h1>
          <p className="text-gray-500 mt-2">Showcase your skills with verified digital badges.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/learner-workspace/certificates" className="text-indigo-600 font-medium hover:underline">
            &larr; Back to Certificates
          </Link>
        </div>
      </header>

      {badges.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-500 shadow-sm">
          <div className="text-5xl mb-4">🏅</div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Badges Yet</h3>
          <p>Complete specific modules and practical tasks to earn badges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {badges.map((issuance: any) => (
            <div key={issuance.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col items-center text-center group cursor-pointer">
              <div className="w-24 h-24 mb-4 rounded-full bg-indigo-50 border-4 border-indigo-100 flex items-center justify-center text-4xl group-hover:scale-110 transition shadow-inner">
                🏅
              </div>
              <h3 className="font-bold text-gray-900 text-sm leading-tight">{issuance.credentials?.name}</h3>
              <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-wider font-semibold">Issued {new Date(issuance.issued_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
