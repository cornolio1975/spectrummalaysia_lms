"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AnalyticsFilterPanel from "./AnalyticsFilterPanel";
import AnalyticsKpiCards from "./AnalyticsKpiCards";
import AnalyticsNadiTable from "./AnalyticsNadiTable";

export default function AnalyticsClient({ filters, filterOptions, initialData }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const data = initialData;
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL NADI");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for last refreshed
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push("?");
  };

  const handleExport = () => {
    // In a real implementation, this would trigger a CSV download.
    alert("Export functionality triggered with active filters.");
  };

  return (
    <div className="flex h-[calc(100vh-60px)] bg-slate-50 overflow-hidden text-sm">
      {/* Mobile filter toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="bg-indigo-600 text-white p-3 rounded-full shadow-lg"
        >
          {isMobileFilterOpen ? "Close Filters" : "Filters"}
        </button>
      </div>

      {/* Left Filter Panel */}
      <div className={`
        ${isMobileFilterOpen ? "fixed inset-0 z-40 bg-white overflow-y-auto" : "hidden"} 
        lg:block lg:relative lg:w-72 lg:flex-shrink-0 lg:border-r lg:bg-white lg:overflow-y-auto
      `}>
        <AnalyticsFilterPanel 
          filters={filters} 
          options={filterOptions} 
          onChange={handleFilterChange} 
          onClear={handleClearFilters} 
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />
      </div>

      {/* Main Dashboard Area */}
      <div className="flex-1 flex flex-col min-w-0 p-4 lg:p-6 lg:pb-0 overflow-hidden">
        {/* Scrollable top section for headers, tabs, KPIs */}
        <div className="flex-none overflow-y-auto pr-2 pb-4">
          {/* Header & Breadcrumb */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">
                Home {'>'} Analytics {'>'} NADI
              </div>
              <h1 className="text-2xl font-bold text-gray-900">NADI Analytics</h1>
            </div>
            <div className="flex flex-col items-end text-xs text-gray-500">
              <div suppressHydrationWarning>Last refreshed: {lastRefreshed.toLocaleString()}</div>
              <div className="text-indigo-600 font-medium">Data source: Live LMS / Supabase</div>
            </div>
          </div>

          {/* Time Tabs */}
          <div className="flex space-x-1 border-b border-gray-200 mb-6 overflow-x-auto">
            {["ALL NADI", "QUARTERLY", "MONTHLY", "WEEKLY", "SUMMARY BY STATE"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab 
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* KPI Cards */}
          <div className="mb-6">
            <AnalyticsKpiCards kpis={data.kpis} />
          </div>

          {/* Search & Actions Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-72">
              <input 
                type="text" 
                placeholder="Search NADI name or Ref ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={handleExport}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <span>⬇️</span> Export
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-t-xl shadow-sm border-t border-l border-r border-gray-200 flex-1 min-h-0 flex flex-col mt-2">
          {activeTab === "ALL NADI" && (
            <AnalyticsNadiTable 
              rows={data.nadiRows} 
              columns={data.programmes} 
              dataKey="programmes"
              searchQuery={searchQuery}
            />
          )}
          {activeTab === "QUARTERLY" && (
            <AnalyticsNadiTable 
              rows={data.nadiRows} 
              columns={data.quarters} 
              dataKey="quarterly"
              searchQuery={searchQuery}
            />
          )}
          {activeTab === "MONTHLY" && (
            <AnalyticsNadiTable 
              rows={data.nadiRows} 
              columns={data.months} 
              dataKey="monthly"
              searchQuery={searchQuery}
            />
          )}
          {activeTab === "WEEKLY" && (
            <AnalyticsNadiTable 
              rows={data.nadiRows} 
              columns={data.weeks} 
              dataKey="weekly"
              searchQuery={searchQuery}
            />
          )}
          {activeTab === "SUMMARY BY STATE" && (
            <AnalyticsNadiTable 
              rows={data.stateRows} 
              columns={data.programmes} 
              dataKey="programmes"
              searchQuery={searchQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
}
