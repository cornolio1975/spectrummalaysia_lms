"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Eye, 
  MapPin, 
  Sparkles,
  Loader2
} from "lucide-react";
import { runAutomatedInterventionCheck } from "@/app/actions/interventions";
import { toast } from "sonner";

interface Props {
  participants: any[];
  openInterventions: any[];
}

export function LearnerDirectoryClient({ participants, openInterventions }: Props) {
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [runningAudit, setRunningAudit] = useState(false);

  const atRiskIds = new Set(openInterventions.map((i) => i.participant_id));

  const handleRunAudit = async () => {
    setRunningAudit(true);
    try {
      const res = await runAutomatedInterventionCheck();
      toast.success(
        `Audit Complete: Evaluated ${res.checkedCount} records, identified ${res.createdCount} new lagging alerts.`
      );
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Failed to run automated intervention audit");
    } finally {
      setRunningAudit(false);
    }
  };

  const filtered = participants.filter((p) => {
    const matchesSearch =
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.ic_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.nadi_sites?.site_name?.toLowerCase().includes(search.toLowerCase());

    const isAtRisk = atRiskIds.has(p.id);
    const matchesFilter =
      filterState === "all" ||
      (filterState === "at_risk" && isAtRisk) ||
      (filterState === "on_track" && !isAtRisk);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-indigo-600" />
            Learner 360° Intelligence Hub
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Holistic learner profiles, cross-course telemetry, competency maps, and proactive intervention radar.
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={runningAudit}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition"
        >
          {runningAudit ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Auditing telemetry...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Run Proactive Dropout Audit
            </>
          )}
        </button>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 block">Total Enrolled Learners</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{participants.length}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 block">Flagged At-Risk / Lagging</span>
          <span className="text-2xl font-bold text-red-600 mt-1 block">{atRiskIds.size}</span>
          <span className="text-[11px] text-gray-400 mt-1 block">Active interventions pending</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 block">Healthy / On-Track</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {participants.length - atRiskIds.size}
          </span>
          <span className="text-[11px] text-gray-400 mt-1 block">Progressing normally</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search learner name, IC, email, NADI site..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status:</span>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Learners</option>
            <option value="at_risk">Flagged At-Risk Only</option>
            <option value="on_track">On-Track Only</option>
          </select>
        </div>
      </div>

      {/* Learners Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 text-xs">
              <tr>
                <th className="px-6 py-3">Learner Name & IC</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">NADI Site & State</th>
                <th className="px-6 py-3">Progress Risk State</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No learners match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isAtRisk = atRiskIds.has(p.id);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/75 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{p.full_name}</p>
                        <span className="text-xs text-gray-400 font-mono">
                          {p.ic_number || "No IC recorded"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        <p>{p.email || "—"}</p>
                        <p className="text-gray-400 mt-0.5">{p.phone || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-700">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>
                            {p.nadi_sites?.site_name || "Central"} ({p.states?.state_name || "MY"})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isAtRisk ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3" /> Flagged At-Risk
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" /> On Track
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/learner-360/${p.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition"
                        >
                          <Eye className="h-3.5 w-3.5" /> 360° Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
