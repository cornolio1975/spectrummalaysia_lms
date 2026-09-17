"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bot, 
  Sparkles, 
  Terminal, 
  BarChart3, 
  Network, 
  Play, 
  Clock, 
  Coins, 
  CheckCircle2, 
  AlertTriangle,
  Loader2
} from "lucide-react";
import { executeAITest } from "@/app/actions/ai";
import { toast } from "sonner";

interface Props {
  providers: any[];
  features: any[];
}

export function AITestConsoleClient({ providers, features }: Props) {
  const [featureCode, setFeatureCode] = useState(features[0]?.feature_code || "ai_learner_assistant");
  const [providerCode, setProviderCode] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [prompt, setPrompt] = useState(
    "Explain the importance of prompt governance and auditability in Malaysian enterprise LMS platforms."
  );

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a test prompt");
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const res = await executeAITest({
        featureCode,
        prompt,
        providerCode: providerCode || undefined,
        temperature,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        setTestResult(res.data);
        toast.success("AI inference test completed!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to execute AI test");
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
            <Terminal className="h-7 w-7 text-indigo-600" />
            AI Test Console & Sandbox
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Safely test AI provider inference, token throughput, latency telemetry, and fallback routing in real-time.
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
            className="pb-3 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" /> Features Matrix
          </Link>
          <Link
            href="/admin/ai/test"
            className="pb-3 px-1 border-b-2 font-medium text-sm border-indigo-600 text-indigo-600 flex items-center gap-2"
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

      {/* Main Console Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Controls Form */}
        <form onSubmit={handleRunTest} className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900">Inference Parameters</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Target AI Feature
            </label>
            <select
              value={featureCode}
              onChange={(e) => setFeatureCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
            >
              {features.map((f) => (
                <option key={f.id} value={f.feature_code}>
                  {f.feature_name} ({f.feature_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Override Provider (Optional)
            </label>
            <select
              value={providerCode}
              onChange={(e) => setProviderCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">(Use Feature Default Routing)</option>
              {providers.map((p) => (
                <option key={p.id} value={p.code}>
                  {p.name} [{p.provider_type}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-700 uppercase mb-1">
              <span>Temperature</span>
              <span className="font-mono text-indigo-600">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Test Prompt
            </label>
            <textarea
              rows={4}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={testing}
            className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Running Inference...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Run Test Prompt
              </>
            )}
          </button>
        </form>

        {/* Right Side: Telemetry & Response Output */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-900">Inference Response & Telemetry</h2>
            {testResult && (
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  testResult.status === "simulated"
                    ? "bg-amber-100 text-amber-800"
                    : testResult.status === "success"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {testResult.status.toUpperCase()}
              </span>
            )}
          </div>

          {!testResult ? (
            <div className="p-16 text-center text-gray-400 text-sm">
              <Terminal className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              Configure parameters and click &quot;Run Test Prompt&quot; to inspect real-time AI generation.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Telemetry Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-400 block">Latency</span>
                  <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3 text-indigo-500" /> {testResult.latencyMs} ms
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Total Tokens</span>
                  <span className="font-bold text-gray-800 mt-0.5 block">
                    {testResult.usage?.totalTokens || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Estimated Cost</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <Coins className="h-3 w-3" /> ${testResult.estimatedCost?.toFixed(5) || "0.00000"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Active Provider</span>
                  <span className="font-bold text-indigo-600 mt-0.5 block truncate">
                    {testResult.provider}
                  </span>
                </div>
              </div>

              {/* Response Body */}
              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96">
                {testResult.response}
              </div>

              <div className="text-[11px] text-gray-400 font-mono flex items-center justify-between">
                <span>Request ID: {testResult.requestId}</span>
                <span>Model: {testResult.model}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
