"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { retryFailedMeetSyncs, testGoogleConnection } from "@/app/actions/google-integration";

interface GoogleIntegrationClientProps {
  health: {
    health: {
      credentialsConfigured: boolean;
      domainConfigured: boolean;
      calendarApiEnabled: boolean;
      meetApiEnabled: boolean;
      lastCheckedAt: string;
      error?: string;
    };
    pendingSyncs: number;
    failedSyncs: number;
  };
}

export function GoogleIntegrationClient({ health }: GoogleIntegrationClientProps) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleRetry = async () => {
    setSyncing(true);
    try {
      const res = await retryFailedMeetSyncs();
      alert(`Retried ${res.attempted} classes. ${res.synced} synced successfully.`);
      router.refresh();
    } finally {
      setSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testGoogleConnection();
      if (res.calendarApiEnabled) {
        setTestResult("Connection test succeeded! Calendar & Meet APIs are reachable.");
      } else {
        setTestResult(res.error || "Connection test failed.");
      }
      router.refresh();
    } catch (err: any) {
      setTestResult(`Test failed: ${err.message || String(err)}`);
    } finally {
      setTesting(false);
    }
  };

  const isHealthy = health.health.credentialsConfigured && health.health.calendarApiEnabled;
  const isAccountNotFound = health.health.error?.includes("account not found");

  return (
    <div className="max-w-4xl space-y-6">
      <div className="page-header">
        <h1>Google Integration</h1>
        <p>Manage connection to Google Workspace (Calendar & Meet)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 border-t-4 border-t-blue-500">
          <div className="flex justify-between items-start mb-4">
            <h3 className="m-0 flex items-center gap-2">
              <span className="text-xl">⚙️</span> Core Configuration
            </h3>
            <span className={`badge ${health.health.credentialsConfigured ? 'badge-success' : 'badge-danger'}`}>
              {health.health.credentialsConfigured ? "Configured" : "Missing credentials"}
            </span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-1">Service Account (JSON)</div>
              <div className="text-sm text-muted">
                {health.health.credentialsConfigured 
                  ? "✓ Loaded from environment" 
                  : "✗ Missing GOOGLE_SERVICE_ACCOUNT_JSON"}
              </div>
            </div>
            
            {health.health.error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                <div className="font-semibold mb-1">Calendar API error:</div>
                <div className="font-mono text-xs">{health.health.error}</div>
              </div>
            )}

            {isAccountNotFound && (
              <div className="p-3.5 bg-amber-50 text-amber-900 text-xs rounded-md border border-amber-200 space-y-2">
                <div className="font-semibold flex items-center gap-1.5 text-amber-950">
                  <span>💡</span> Diagnostic Guide: Account Not Found
                </div>
                <p>
                  Google returned <code>invalid_grant: account not found</code>. This occurs when the service account email defined in <code>GOOGLE_SERVICE_ACCOUNT_JSON</code> does not exist or has been deleted in Google Cloud IAM.
                </p>
                <div className="font-medium text-amber-950 pt-1">To resolve:</div>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Go to <strong>Google Cloud Console</strong> &gt; <strong>IAM &amp; Admin</strong> &gt; <strong>Service Accounts</strong>.</li>
                  <li>Verify the service account exists, or create a new one (e.g. <code>spectrummy-lms@your-project.iam.gserviceaccount.com</code>).</li>
                  <li>Click <strong>Keys</strong> &gt; <strong>Add Key</strong> &gt; <strong>Create new key (JSON)</strong>.</li>
                  <li>Enable <strong>Google Calendar API</strong> in <em>APIs &amp; Services &gt; Library</em>.</li>
                  <li>Copy the single-line JSON content into <code>GOOGLE_SERVICE_ACCOUNT_JSON</code> in <code>.env.local</code> and restart the server.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 border-t-4 border-t-green-500 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="m-0 flex items-center gap-2">
                <span className="text-xl">📅</span> API Health
              </h3>
              <span className={`badge ${health.health.calendarApiEnabled ? 'badge-success' : 'badge-warning'}`}>
                {health.health.calendarApiEnabled ? "Connected" : "Disconnected"}
              </span>
            </div>
            
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center py-2 border-b border-gray-100">
                <span>Google Calendar API</span>
                {health.health.calendarApiEnabled ? <span className="text-green-600">✓ OK</span> : <span className="text-red-500">✗ Failing</span>}
              </li>
              <li className="flex justify-between items-center py-2 border-b border-gray-100">
                <span>Google Meet API</span>
                {health.health.meetApiEnabled ? <span className="text-green-600">✓ OK</span> : <span className="text-red-500">✗ Failing</span>}
              </li>
              <li className="flex justify-between items-center py-2">
                <span className="text-muted">Last Checked</span>
                <span suppressHydrationWarning>{new Date(health.health.lastCheckedAt).toLocaleString()}</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              className="btn btn-outline btn-sm w-full"
              onClick={handleTestConnection}
              disabled={testing}
            >
              {testing ? "Testing Connection..." : "🔄 Re-test Google Connection"}
            </button>
            {testResult && (
              <div className={`mt-2 p-2 text-xs rounded ${testResult.includes('succeeded') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {testResult}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="mb-4">Sync Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded border">
            <div className="text-sm text-muted">Pending Meets</div>
            <div className="text-2xl font-bold mt-1">{health.pendingSyncs}</div>
          </div>
          <div className="bg-red-50 p-4 rounded border border-red-100">
            <div className="text-sm text-red-800">Failed / Waiting Retry</div>
            <div className="text-2xl font-bold text-red-900 mt-1">{health.failedSyncs}</div>
          </div>
        </div>

        {(health.pendingSyncs > 0 || health.failedSyncs > 0) && (
          <button 
            className="btn btn-primary"
            onClick={handleRetry}
            disabled={syncing || !isHealthy}
          >
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        )}
        {!isHealthy && (health.pendingSyncs > 0 || health.failedSyncs > 0) && (
          <p className="text-sm text-muted mt-2">Cannot sync until Google API is healthy.</p>
        )}
      </div>
    </div>
  );
}
