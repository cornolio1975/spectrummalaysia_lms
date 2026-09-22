"use client";

import React from "react";

export default function AnalyticsKpiCards({ kpis }: { kpis: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* EVENTS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-500 font-semibold text-xs tracking-wider">EVENTS</h3>
          <span className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg text-xs">📅</span>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">{kpis.totalEvents.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-1">Total qualifying events</p>
        </div>
      </div>

      {/* EVENTS CREATED (using same logic for this basic version, but can be distinct) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-500 font-semibold text-xs tracking-wider">EVENTS CREATED</h3>
          <span className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg text-xs">📝</span>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">{kpis.totalEvents.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-1">Total created within period</p>
        </div>
      </div>

      {/* PAX */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-500 font-semibold text-xs tracking-wider">PAX</h3>
          <span className="text-blue-600 bg-blue-50 p-1.5 rounded-lg text-xs">👥</span>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">{kpis.totalPax.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-1">Unique participants</p>
        </div>
      </div>

      {/* TOTAL NADI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-gray-500 font-semibold text-xs tracking-wider">TOTAL NADI</h3>
          <span className="text-orange-600 bg-orange-50 p-1.5 rounded-lg text-xs">🏢</span>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">{kpis.totalNadi.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-1">Active NADI sites</p>
        </div>
      </div>

    </div>
  );
}
