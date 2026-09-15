"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { retryFailedMeetSyncs } from "@/app/actions/google-integration";

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

  const isHealthy = health.health.credentialsConfigured && health.health.calendarApiEnabled;

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
                {health.health.error}
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 border-t-4 border-t-green-500">
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
              <span>{new Date(health.health.lastCheckedAt).toLocaleString()}</span>
            </li>
          </ul>
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
