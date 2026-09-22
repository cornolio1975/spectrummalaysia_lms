import React from 'react';
import { getTrainerWorkspace } from '@/services/trainer-workspace';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function TrainerCertificatesPage() {
  let errorMsg = null;
  let issuances: any[] = [];

  try {
    const { workspaceId } = await getTrainerWorkspace();
    const supabase = await createClient();

    // Fetch credential issuances related to the trainer's courses
    const { data, error } = await supabase
      .from('credential_issuances')
      .select(`
        id,
        status,
        issue_date,
        participants ( id, full_name ),
        credentials ( id, title: name, type: credential_type )
      `)
      .order('issue_date', { ascending: false });

    if (error) throw error;
    issuances = data || [];

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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificates & Digital Badges</h1>
          <p className="text-gray-500 mt-2">View credentials issued to learners in your courses.</p>
        </div>
      </header>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <strong>Note:</strong> Final credential issuance is controlled by the System Credential Engine. You can recommend or verify completion, but cannot bypass central credential rules.
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {issuances.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No credentials have been issued for your courses yet.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credential</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Issued</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {issuances.map((issuance: any) => (
                <tr key={issuance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {issuance.participants?.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">{issuance.credentials?.title}</span>
                    <br />
                    <span className="text-xs uppercase">{issuance.credentials?.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      issuance.status === 'issued' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {issuance.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {issuance.issue_date ? new Date(issuance.issue_date).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
