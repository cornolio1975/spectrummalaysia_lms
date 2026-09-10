"use client";

import { useState } from "react";

interface KPIsClientProps {
  kpiResults: any[];
}

export function KPIsClient({ kpiResults }: KPIsClientProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const getStatusColor = (achievementPct: number, warningThreshold: number, criticalThreshold: number) => {
    if (achievementPct >= 100) return "text-green-600 bg-green-50 border-green-200";
    if (achievementPct >= warningThreshold) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (achievementPct < criticalThreshold) return "text-red-600 bg-red-50 border-red-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getStatusText = (achievementPct: number, warningThreshold: number, criticalThreshold: number) => {
    if (achievementPct >= 100) return "Achieved";
    if (achievementPct >= warningThreshold) return "On Track";
    if (achievementPct < criticalThreshold) return "Critical";
    return "At Risk";
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>Key Performance Indicators</h1>
            <p>Track programme performance against targets</p>
          </div>
          <select 
            className="form-select" 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{ width: "120px" }}
          >
            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
            <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
          </select>
        </div>
      </div>
      
      <div className="page-body">
        {kpiResults.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-lg border text-gray-500">
            <div className="text-5xl mb-4">📊</div>
            <p>No KPI results recorded for the selected year.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpiResults.map((result) => {
              const kpi = result.kpis;
              // If we don't have achievement_pct directly on the row, calculate it
              const target = result.target_value || kpi.target_value;
              const actual = result.actual_value || 0;
              const achievement = result.achievement_pct || (target > 0 ? (actual / target) * 100 : 0);
              const warnThresh = kpi.warning_threshold || 70;
              const critThresh = kpi.critical_threshold || 50;

              const statusColorClass = getStatusColor(achievement, warnThresh, critThresh);

              return (
                <div key={result.id} className="card flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs font-mono text-gray-500 mb-1">{kpi.kpi_code}</div>
                      <h3 className="font-bold text-gray-900 leading-tight">{kpi.kpi_name}</h3>
                      {kpi.programmes && (
                        <div className="text-xs text-primary-600 mt-1">{kpi.programmes.programme_name}</div>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${statusColorClass}`}>
                      {getStatusText(achievement, warnThresh, critThresh)}
                    </span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Actual / Target</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {actual.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ {target.toLocaleString()} {kpi.unit}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: achievement >= 100 ? '#16a34a' : achievement < critThresh ? '#dc2626' : '#ea580c' }}>
                        {achievement.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(achievement, 100)}%`,
                        backgroundColor: achievement >= 100 ? '#16a34a' : achievement < critThresh ? '#dc2626' : '#ea580c'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
