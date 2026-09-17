"use client";

import { useState } from "react";
import { 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity, 
  Save, 
  ExternalLink, 
  RefreshCw,
  Loader2
} from "lucide-react";
import { updateN8nConfig, testN8nConnectionAction } from "@/app/actions/n8n";
import { toast } from "sonner";

interface Props {
  config: any;
  recentJobs: any[];
}

export function N8nSettingsClient({ config, recentJobs }: Props) {
  const [baseUrl, setBaseUrl] = useState(config?.base_url || "https://automation.spectrum.my");
  const [isEnabled, setIsEnabled] = useState(config?.is_enabled || false);
  const [webhookSecret, setWebhookSecret] = useState(config?.webhook_secret_hash || "");
  const [saving, setSaving] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<any | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateN8nConfig({
        base_url: baseUrl,
        is_enabled: isEnabled,
        webhook_secret_hash: webhookSecret,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("n8n automation settings updated!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update n8n settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestStatus(null);
    try {
      const res = await testN8nConnectionAction();
      setTestStatus(res);
      if (res.success) {
        toast.success("n8n server connection successful!");
      } else {
        toast.info(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Zap className="h-7 w-7 text-indigo-600" />
            Hostinger n8n Automation Engine
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure external workflow automation, asynchronous event queues, and scheduled notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              config?.is_enabled
                ? "bg-emerald-100 text-emerald-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {config?.is_enabled ? "Integration Active" : "Standby (Disabled)"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900">Webhook Connection Parameters</h2>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              {testing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Testing...
                </>
              ) : (
                <>
                  <Activity className="h-3.5 w-3.5" /> Ping Server
                </>
              )}
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                n8n Instance URL *
              </label>
              <input
                type="url"
                required
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://automation.spectrum.my"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Webhook Shared Secret
              </label>
              <input
                type="password"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Used to verify HMAC-SHA256 signature in `X-Spectrum-Signature` header.
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
              <input
                type="checkbox"
                id="n8nEnabled"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="n8nEnabled" className="text-xs font-semibold text-gray-800 cursor-pointer">
                Enable server-side asynchronous webhook dispatching to n8n
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </form>

          {testStatus && (
            <div
              className={`p-3 rounded-lg text-xs font-medium border flex items-center justify-between ${
                testStatus.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <span>{testStatus.message}</span>
              <span>{testStatus.latencyMs} ms</span>
            </div>
          )}
        </div>

        {/* Right: Architecture & Resilience Card */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Resilience & Source-of-Truth Rules
          </h3>
          <ul className="text-xs text-gray-600 space-y-2.5 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
              <span><strong>Supabase is the permanent Source of Truth:</strong> n8n acts as an automation pipeline and never replaces the LMS database.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
              <span><strong>Non-Blocking Execution:</strong> If n8n times out or is offline, LMS course completions and credential issuances continue seamlessly.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-4 w-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
              <span><strong>Replay Protection:</strong> Every dispatch includes a unique `requestId` and timestamp for idempotent processing.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Recent Jobs Queue */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Recent n8n Event Dispatches & Jobs</h3>
          <span className="text-xs text-gray-400">Latest 25 records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-2.5">Job / Request ID</th>
                <th className="px-4 py-2.5">Event Type</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Retries</th>
                <th className="px-4 py-2.5">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No webhook events recorded yet.
                  </td>
                </tr>
              ) : (
                recentJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50/75">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600">
                      {job.job_id}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {job.event_type}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] capitalize ${
                          job.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : job.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {job.retry_count}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(job.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
