"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bot, 
  Sparkles, 
  Terminal, 
  BarChart3, 
  Network, 
  Clock, 
  Coins, 
  CheckCircle2, 
  AlertTriangle, 
  Download,
  Filter
} from "lucide-react";

interface Props {
  usageData: {
    logs: any[];
    budget: any;
    providers: any[];
    metrics: {
      totalRequests: number;
      successfulRequests: number;
      simulatedRequests: number;
      totalTokens: number;
      avgLatency: number;
    };
  };
}

export function AIUsageClient({ usageData }: Props) {
  const { logs, budget, metrics } = usageData;
  const [filterFeature, setFilterFeature] = useState("all");

  const spendPct = budget.max_monthly_budget_usd > 0
    ? Math.min(100, Math.round((Number(budget.current_spend_usd) / Number(budget.max_monthly_budget_usd)) * 100))
    : 0;

  const isWarning = spendPct >= (budget.alert_threshold_pct || 80);
  const isLimitReached = spendPct >= 100;

  const filteredLogs = logs.filter(
    (l) => filterFeature === "all" || l.feature_code === filterFeature
  );

  const handleExportCSV = () => {
    const rows = [
      ["Request ID", "Feature", "Provider", "Model", "Role", "Tokens", "Latency (ms)", "Status", "Timestamp"],
      ...filteredLogs.map((l) => [
        l.request_id,
        l.feature_code,
        l.provider_code,
        l.model_code,
        l.user_role,
        String(l.total_tokens),
        String(l.latency_ms),
        l.status,
        l.created_at,
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ai_usage_telemetry_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-600" />
            AI Usage, Cost & Telemetry Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time inference telemetry, budget burn rates, token accounting, and cost containment alerts.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm transition"
        >
          <Download className="h-4 w-4" /> Export Telemetry CSV
        </button>
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
            className="pb-3 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 flex items-center gap-2"
          >
            <Terminal className="h-4 w-4" /> Test Console
          </Link>
          <Link
            href="/admin/ai/usage"
            className="pb-3 px-1 border-b-2 font-medium text-sm border-indigo-600 text-indigo-600 flex items-center gap-2"
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

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 block">Total AI Invocations</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{metrics.totalRequests}</span>
          <span className="text-[11px] text-gray-400 mt-0.5 block">Recorded requests</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 block">Zero-Cost Simulations</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {metrics.simulatedRequests}
          </span>
          <span className="text-[11px] text-gray-400 mt-0.5 block">Free fallback inferences</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 block">Total Tokens Processed</span>
          <span className="text-2xl font-bold text-indigo-600 mt-1 block">
            {metrics.totalTokens.toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-400 mt-0.5 block">Prompt + output volume</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 block">Average Response Latency</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{metrics.avgLatency} ms</span>
          <span className="text-[11px] text-gray-400 mt-0.5 block">End-to-end execution</span>
        </div>
      </div>

      {/* Monthly Budget Tracker Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-600" />
              Monthly Budget Containment & Hard Cap
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Current Spend: ${Number(budget.current_spend_usd).toFixed(4)} of ${Number(budget.max_monthly_budget_usd).toFixed(2)} USD Cap
            </p>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              isLimitReached
                ? "bg-red-100 text-red-800"
                : isWarning
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {isLimitReached ? "LIMIT REACHED (SIMULATION ONLY)" : isWarning ? "NEAR BUDGET LIMIT" : "HEALTHY (NORMAL)"}
          </span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isLimitReached ? "bg-red-600" : isWarning ? "bg-amber-500" : "bg-emerald-600"
            }`}
            style={{ width: `${spendPct}%` }}
          />
        </div>
      </div>

      {/* Usage Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Recent AI Execution Logs (Latest 100)</h3>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={filterFeature}
              onChange={(e) => setFilterFeature(e.target.value)}
              className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Features</option>
              <option value="ai_course_builder">ai_course_builder</option>
              <option value="ai_learner_assistant">ai_learner_assistant</option>
              <option value="ai_quiz_generator">ai_quiz_generator</option>
              <option value="ai_report_explainer">ai_report_explainer</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-2.5">Feature</th>
                <th className="px-4 py-2.5">Provider & Model</th>
                <th className="px-4 py-2.5">Tokens</th>
                <th className="px-4 py-2.5">Latency</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No execution logs match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/75">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {log.feature_code}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-indigo-600 font-bold">{log.provider_code}</span>
                      <span className="text-gray-400 font-mono block text-[10px]">{log.model_code}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {log.total_tokens}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.latency_ms} ms
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-500">
                      {log.user_role || "learner"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          log.status === "simulated"
                            ? "bg-amber-100 text-amber-800"
                            : log.status === "success"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
