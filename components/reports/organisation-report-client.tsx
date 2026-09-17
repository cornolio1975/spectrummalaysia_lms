"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  Award, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  MapPin, 
  BarChart3, 
  Layers, 
  Download,
  Filter
} from "lucide-react";

interface Props {
  metrics: {
    totalLearners: number;
    totalCourses: number;
    totalIssuances: number;
    totalTrainingHours: number;
    completionRate: number;
    totalInterventions: number;
    resolvedInterventions: number;
    siteBreakdown: { name: string; state: string; learnersCount: number }[];
    categoryBreakdown: { category: string; coursesCount: number; enrolmentsCount: number }[];
  };
}

export function OrganisationReportClient({ metrics }: Props) {
  const [selectedState, setSelectedState] = useState("all");

  const filteredSites = metrics.siteBreakdown.filter(
    (s) => selectedState === "all" || s.state === selectedState
  );

  const uniqueStates = Array.from(new Set(metrics.siteBreakdown.map((s) => s.state))).filter(Boolean);

  const handleExportCSV = () => {
    const rows = [
      ["NADI Site", "State", "Active Learners"],
      ...filteredSites.map((s) => [s.name, s.state, String(s.learnersCount)]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `spectrum_organisation_kpis_${new Date().toISOString().split("T")[0]}.csv`);
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
            <Building2 className="h-7 w-7 text-indigo-600" />
            Institutional & Enterprise KPI Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Macro-level institutional health, regional NADI site delivery metrics, and credentialing velocity.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm transition"
        >
          <Download className="h-4 w-4" /> Export CSV Report
        </button>
      </div>

      {/* Top 4 Macro KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Enrolled Learners</span>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalLearners}</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Active Nationwide
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Accredited Issuances</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-600 mt-2">{metrics.totalIssuances}</div>
          <div className="text-xs text-gray-400 mt-1">Verifiable Micro-Credentials</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Overall Completion Rate</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold text-indigo-600 mt-2">{metrics.completionRate}%</div>
          <div className="text-xs text-gray-400 mt-1">Curriculum completion</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Dropout Prevention Rate</span>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-purple-600 mt-2">
            {metrics.totalInterventions > 0
              ? Math.round((metrics.resolvedInterventions / metrics.totalInterventions) * 100)
              : 100}
            %
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {metrics.resolvedInterventions} of {metrics.totalInterventions} alerts resolved
          </div>
        </div>
      </div>

      {/* Grid: Category Performance & Regional Site Delivery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Course Category Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            Curriculum Domain Distribution
          </h2>
          <p className="text-xs text-gray-500">
            Enrolments and courses grouped by training classification.
          </p>

          <div className="space-y-3 pt-2">
            {metrics.categoryBreakdown.map((cat, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-gray-800 text-sm block">{cat.category}</span>
                  <span className="text-gray-400">{cat.coursesCount} active courses</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-indigo-600 text-sm block">
                    {cat.enrolmentsCount}
                  </span>
                  <span className="text-gray-400 text-[10px]">learners enrolled</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Site Performance Table */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-600" />
                Regional NADI Site Telemetry
              </h2>
              <p className="text-xs text-gray-500">Learners active across community centers.</p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-gray-400" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All States</option>
                {uniqueStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[380px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5">NADI Center</th>
                  <th className="px-4 py-2.5">State</th>
                  <th className="px-4 py-2.5 text-right">Learner Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSites.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                      No sites found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredSites.map((site, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/75">
                      <td className="px-4 py-3 font-semibold text-gray-800">{site.name}</td>
                      <td className="px-4 py-3 text-gray-500">{site.state}</td>
                      <td className="px-4 py-3 text-right font-bold text-indigo-600">
                        {site.learnersCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
