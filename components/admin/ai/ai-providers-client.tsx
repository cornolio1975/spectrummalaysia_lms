"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  Terminal, 
  BarChart3, 
  Network, 
  Power, 
  Star, 
  ExternalLink,
  Loader2
} from "lucide-react";
import { toggleAIProvider, setAIProviderDefault, updateAIProvider } from "@/app/actions/ai";
import { toast } from "sonner";

interface Props {
  providers: any[];
}

export function AIProvidersClient({ providers }: Props) {
  const [editingProvider, setEditingProvider] = useState<any | null>(null);
  const [endpoint, setEndpoint] = useState("");
  const [dailyLimit, setDailyLimit] = useState(200);
  const [submitting, setSubmitting] = useState(false);

  const handleToggle = async (providerId: string, currentState: boolean) => {
    try {
      const res = await toggleAIProvider(providerId, !currentState);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Provider ${!currentState ? "enabled" : "disabled"} successfully`);
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle provider");
    }
  };

  const handleSetDefault = async (providerId: string) => {
    try {
      const res = await setAIProviderDefault(providerId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Default AI provider updated!");
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to set default provider");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;

    setSubmitting(true);
    try {
      const res = await updateAIProvider(editingProvider.id, {
        endpoint: endpoint.trim() || undefined,
        daily_request_limit: Number(dailyLimit),
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Provider configuration updated");
        setEditingProvider(null);
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update provider");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Management Header & Sub-Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Bot className="h-7 w-7 text-indigo-600" />
            AI Gateway & Provider Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Provider-neutral AI routing, free-first local inference, Hostinger AI Router, and enterprise fallback chains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" /> Free-First Policy Active
          </span>
        </div>
      </div>

      {/* Unified AI Sub-Nav */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          <Link
            href="/admin/ai/providers"
            className="pb-3 px-1 border-b-2 font-medium text-sm border-indigo-600 text-indigo-600 flex items-center gap-2"
          >
            <Bot className="h-4 w-4" /> Providers Studio
          </Link>
          <Link
            href="/admin/ai/features"
            className="pb-3 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" /> Features Matrix
          </Link>
          <Link
            href="/admin/ai/test"
            className="pb-3 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 flex items-center gap-2"
          >
            <Terminal className="h-4 w-4" /> Test Console
          </Link>
          <Link
            href="/admin/ai/usage"
            className="pb-3 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" /> Usage & Cost
          </Link>
          <Link
            href="/admin/ai/router"
            className="pb-3 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 flex items-center gap-2"
          >
            <Network className="h-4 w-4" /> Hostinger Router
          </Link>
        </nav>
      </div>

      {/* Providers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((p) => (
          <div
            key={p.id}
            className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition ${
              p.is_default
                ? "border-indigo-400 ring-2 ring-indigo-50"
                : p.is_enabled
                ? "border-emerald-200"
                : "border-gray-200 opacity-80"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">
                  {p.provider_type}
                </span>

                <div className="flex items-center gap-1.5">
                  {p.is_free ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      FREE / LOCAL
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      PAID / BILLABLE
                    </span>
                  )}

                  {p.is_default && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      <Star className="h-3 w-3 fill-indigo-600" /> DEFAULT
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-gray-900 text-base">{p.name}</h3>
              <p className="text-xs text-gray-500 font-mono mt-1 truncate">
                {p.endpoint || "(Built-in simulation runtime)"}
              </p>

              {/* Models Available */}
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
                <span className="text-[11px] font-bold text-gray-400 uppercase block">
                  Configured Models ({p.ai_models?.length || 0})
                </span>
                {p.ai_models?.map((m: any) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between text-xs p-1.5 bg-gray-50 rounded"
                  >
                    <span className="font-medium text-gray-800">{m.model_name}</span>
                    <span className="font-mono text-[10px] text-gray-400">{m.model_code}</span>
                  </div>
                ))}
              </div>

              {/* Quota info */}
              <div className="mt-3 text-[11px] text-gray-400 grid grid-cols-2 gap-1">
                <span>Daily Limit: {p.daily_request_limit} reqs</span>
                <span>Priority: #{p.priority}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleToggle(p.id, p.is_enabled)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  p.is_enabled
                    ? "bg-red-50 text-red-700 hover:bg-red-100"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <Power className="h-3.5 w-3.5" />
                {p.is_enabled ? "Disable" : "Enable"}
              </button>

              <div className="flex items-center gap-1">
                {!p.is_default && p.is_enabled && (
                  <button
                    onClick={() => handleSetDefault(p.id)}
                    className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg transition"
                    title="Set as global default AI provider"
                  >
                    Set Default
                  </button>
                )}

                <button
                  onClick={() => {
                    setEditingProvider(p);
                    setEndpoint(p.endpoint || "");
                    setDailyLimit(p.daily_request_limit || 200);
                  }}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                  title="Configure Provider Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Provider Modal */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">
              Configure {editingProvider.name}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Endpoint URL
                </label>
                <input
                  type="url"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Daily Request Quota
                </label>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingProvider(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
