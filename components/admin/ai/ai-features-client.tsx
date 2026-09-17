"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bot, 
  Sparkles, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  BarChart3, 
  Network, 
  Sliders, 
  ShieldAlert,
  Loader2
} from "lucide-react";
import { updateAIFeatureSetting } from "@/app/actions/ai";
import { toast } from "sonner";

interface Props {
  features: any[];
  providers: any[];
}

export function AIFeaturesClient({ features, providers }: Props) {
  const [editingFeature, setEditingFeature] = useState<any | null>(null);
  const [providerId, setProviderId] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [allowExternal, setAllowExternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleToggleFeature = async (featureId: string, currentState: boolean) => {
    try {
      const res = await updateAIFeatureSetting(featureId, { is_enabled: !currentState });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Feature ${!currentState ? "enabled" : "disabled"}`);
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update feature setting");
    }
  };

  const handleOpenEdit = (feat: any) => {
    setEditingFeature(feat);
    setProviderId(feat.provider_id || providers[0]?.id || "");
    setTemperature(feat.temperature || 0.7);
    setMaxTokens(feat.max_tokens || 1024);
    setAllowExternal(feat.allow_external_ai || false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeature) return;

    setSubmitting(true);
    try {
      const res = await updateAIFeatureSetting(editingFeature.id, {
        provider_id: providerId || undefined,
        temperature: Number(temperature),
        max_tokens: Number(maxTokens),
        allow_external_ai: allowExternal,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("AI feature parameters successfully saved");
        setEditingFeature(null);
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save parameters");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-indigo-600" />
            AI Features & Governance Matrix
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure per-feature models, privacy boundaries, temperature controls, and human-in-the-loop review rules.
          </p>
        </div>
      </div>

      {/* Unified AI Sub-Nav */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          <Link
            href="/admin/ai/providers"
            className="pb-3 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 flex items-center gap-2"
          >
            <Bot className="h-4 w-4" /> Providers Studio
          </Link>
          <Link
            href="/admin/ai/features"
            className="pb-3 px-1 border-b-2 font-medium text-sm border-indigo-600 text-indigo-600 flex items-center gap-2"
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

      {/* Features Matrix Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 text-xs">
              <tr>
                <th className="px-6 py-3">Feature Name & Code</th>
                <th className="px-6 py-3">Domain</th>
                <th className="px-6 py-3">Assigned Provider & Model</th>
                <th className="px-6 py-3">Temperature</th>
                <th className="px-6 py-3">External AI</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {features.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50/75 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{f.feature_name}</p>
                    <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {f.feature_code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {f.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">
                      {f.provider?.name || "Built-in Simulation"}
                    </p>
                    <span className="text-xs text-gray-400 font-mono">
                      {f.model?.model_code || "sim-coach-v1"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">
                    {f.temperature}
                  </td>
                  <td className="px-6 py-4">
                    {f.allow_external_ai ? (
                      <span className="text-xs text-amber-700 bg-amber-50 font-semibold px-2 py-0.5 rounded border border-amber-200">
                        Permitted
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-700 bg-emerald-50 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                        Local / Free Only
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        f.is_enabled
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {f.is_enabled ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleFeature(f.id, f.is_enabled)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded ${
                        f.is_enabled
                          ? "text-red-600 hover:bg-red-50"
                          : "text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {f.is_enabled ? "Turn Off" : "Turn On"}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(f)}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      title="Edit Parameters"
                    >
                      <Sliders className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Parameters Modal */}
      {editingFeature && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">
              Feature Settings: {editingFeature.feature_name}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Assigned AI Provider
                </label>
                <select
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.is_free ? "Free" : "Paid"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Temperature ({temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Precise (0.0)</span>
                    <span>Creative (1.0)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Max Output Tokens
                  </label>
                  <input
                    type="number"
                    min="128"
                    max="8192"
                    step="128"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allowExt"
                  checked={allowExternal}
                  onChange={(e) => setAllowExternal(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="allowExt" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Allow external cloud AI transmission (Sanitizes PII before sending)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingFeature(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Apply Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
