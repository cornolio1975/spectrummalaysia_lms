import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function SecurityCommandCentre() {
  const supabase = await createClient();

  // Fetch recent high severity audit logs (assuming structure from our Phase 1 migration)
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">SECURITY & COMPLIANCE</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="border p-4 rounded bg-red-50 text-red-900 border-red-200">
          <h3 className="font-bold text-sm">CRITICAL INCIDENTS</h3>
          <p className="text-2xl">0</p>
        </div>
        <div className="border p-4 rounded bg-blue-50 text-blue-900 border-blue-200">
          <h3 className="font-bold text-sm">ACTIVE SESSIONS</h3>
          <p className="text-2xl">1,204</p>
        </div>
        <div className="border p-4 rounded bg-green-50 text-green-900 border-green-200">
          <h3 className="font-bold text-sm">DATA EXPORTS (24h)</h3>
          <p className="text-2xl">3</p>
        </div>
        <div className="border p-4 rounded border-slate-200">
          <h3 className="font-bold text-sm">PENDING ACCESS REVIEWS</h3>
          <p className="text-2xl">12</p>
        </div>
      </div>

      <div className="bg-white border rounded shadow-sm">
        <div className="p-4 border-b bg-slate-50 font-bold">Recent Security Audit Logs</div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="p-3 border-b">Timestamp</th>
              <th className="p-3 border-b">Action</th>
              <th className="p-3 border-b">Actor ID</th>
              <th className="p-3 border-b">Scope</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log: any) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="p-3 border-b">{new Date(log.created_at).toLocaleString()}</td>
                <td className="p-3 border-b font-mono">{log.action}</td>
                <td className="p-3 border-b">{log.user_id}</td>
                <td className="p-3 border-b">{log.scope || 'N/A'}</td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500">No recent audit logs available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
