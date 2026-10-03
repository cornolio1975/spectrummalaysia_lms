import { createClient } from '@/utils/supabase/server';

import { cookies } from 'next/headers';

export default async function AdminSignupsPage() {
  const supabase = await createClient();
  
  // Fetch pending profiles
  const { data: signups } = await supabase
    .from('profiles')
    .select('*')
    .eq('approval_status', 'PENDING');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">NEW SIGN-UPS</h1>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2">Name</th>
            <th className="border-b p-2">Role</th>
            <th className="border-b p-2">Status</th>
            <th className="border-b p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {signups?.map((user: any) => (
            <tr key={user.id}>
              <td className="border-b p-2">{user.full_name}</td>
              <td className="border-b p-2">{user.role}</td>
              <td className="border-b p-2">{user.approval_status}</td>
              <td className="border-b p-2">
                <button className="bg-green-500 text-white px-2 py-1 rounded mr-2">Approve</button>
                <button className="bg-red-500 text-white px-2 py-1 rounded">Reject</button>
              </td>
            </tr>
          ))}
          {(!signups || signups.length === 0) && (
            <tr>
              <td colSpan={4} className="text-center p-4">No pending sign-ups.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
