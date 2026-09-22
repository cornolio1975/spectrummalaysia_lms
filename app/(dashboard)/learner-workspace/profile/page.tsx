import React from 'react';
import { getLearnerWorkspace } from '@/services/learner-workspace';
import { createClient } from '@/utils/supabase/server';
import EditProfileClient from '@/components/profile/edit-profile-client';
import ChangePasswordClient from '@/components/profile/change-password-client';

export default async function LearnerProfilePage() {
  let errorMsg = null;
  let userProfile = null;
  let participantInfo = null;
  let userId: string | null = null;
  let participantId: string | null = null;

  try {
    const workspace = await getLearnerWorkspace();
    userId = workspace.userId;
    participantId = workspace.participantId || null;
    const supabase = await createClient();

    // Fetch auth profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    userProfile = profile;

    // Fetch LMS participant details
    if (participantId) {
      const { data: partInfo } = await supabase
        .from('participants')
        .select(`
          *,
          states ( name ),
          nadi_sites ( site_name )
        `)
        .eq('id', participantId)
        .single();
        
      participantInfo = partInfo;
    } else if (userProfile?.email) {
      // Fallback matching by email if participantId not strictly resolved from Workspace helper
      const { data: partInfo } = await supabase
        .from('participants')
        .select(`
          *,
          states ( name ),
          nadi_sites ( site_name )
        `)
        .eq('email', userProfile.email)
        .single();
      
      participantInfo = partInfo;
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

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-2">Manage your personal information and LMS preferences.</p>
        </div>
      </header>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-full p-1 border border-gray-200 shadow-sm flex items-center justify-center bg-gray-100 text-3xl font-bold text-indigo-600 uppercase">
              {userProfile?.full_name?.charAt(0) || 'L'}
            </div>
            <EditProfileClient 
              userId={userId!} 
              participantId={participantId} 
              initialData={{
                full_name: userProfile?.full_name || '',
                phone: participantInfo?.phone || '',
                ic_number: participantInfo?.ic_number || '',
                gender: participantInfo?.gender || '',
                organization: participantInfo?.organization || ''
              }} 
            />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900">{userProfile?.full_name || 'Learner'}</h2>
          <p className="text-gray-500">{userProfile?.email}</p>
          {participantInfo?.participant_code && (
            <div className="mt-3 inline-block bg-indigo-50 text-indigo-700 font-mono text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
              ID: {participantInfo.participant_code}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4 border-b pb-2">Personal Details</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Full Name</dt>
              <dd className="mt-1 font-medium text-gray-900">{userProfile?.full_name || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">IC / Passport Number</dt>
              <dd className="mt-1 font-medium text-gray-900">{participantInfo?.ic_number || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Phone Number</dt>
              <dd className="mt-1 font-medium text-gray-900">{participantInfo?.phone || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Gender</dt>
              <dd className="mt-1 font-medium text-gray-900 capitalize">{participantInfo?.gender || '-'}</dd>
            </div>
          </dl>
        </section>

        {/* Location & Organization */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4 border-b pb-2">Location & Organization</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">State</dt>
              <dd className="mt-1 font-medium text-gray-900">{participantInfo?.states?.name || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">NADI Site</dt>
              <dd className="mt-1 font-medium text-gray-900">{participantInfo?.nadi_sites?.site_name || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-gray-500 uppercase">Organization / School</dt>
              <dd className="mt-1 font-medium text-gray-900">{participantInfo?.organization || '-'}</dd>
            </div>
          </dl>
        </section>
      </div>
      
      <ChangePasswordClient />
    </div>
  );
}
