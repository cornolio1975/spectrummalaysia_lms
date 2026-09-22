"use client";

import React from "react";

export default function AnalyticsFilterPanel({ filters, options, onChange, onClear, onCloseMobile }: any) {
  const years = ["2026", "2025", "2024"]; // In real life, generated dynamically
  const ageGroups = ["All", "0-12", "13-17", "18-24", "25-34", "35-44", "45-54", "55+"];
  
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b flex justify-between items-center lg:hidden">
        <h2 className="font-bold text-lg">Filters</h2>
        <button onClick={onCloseMobile} className="text-gray-500 font-bold">X</button>
      </div>

      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900 hidden lg:block">FILTER PANEL</h2>
          <button 
            onClick={onClear}
            className="text-xs text-indigo-600 font-medium hover:text-indigo-800"
          >
            Clear All
          </button>
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2 mb-2">
          {Object.entries(filters).map(([k, v]) => {
            if (!v || v === 'All' || k === 'year') return null;
            return (
              <span key={k} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs">
                {k}: {v as string}
                <button onClick={() => onChange(k, null)} className="hover:text-indigo-900">×</button>
              </span>
            );
          })}
        </div>
      </div>

      <div className="p-4 overflow-y-auto space-y-5 flex-1">
        
        {/* YEAR */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">YEAR</label>
          <select 
            className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.year}
            onChange={(e) => onChange('year', e.target.value)}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* DUSP */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">DUSP</label>
          <select 
            className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.dusp || ""}
            onChange={(e) => onChange('dusp', e.target.value || null)}
          >
            <option value="">[ All DUSP ▼ ]</option>
            {options.dusps.map((d: string) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* TECH PARTNER */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">TECH PARTNER</label>
          <select 
            className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.dusp || ""} // As requested, tp_dusp handles both for now
            onChange={(e) => onChange('dusp', e.target.value || null)}
          >
            <option value="">[ All Tech Partners ▼ ]</option>
            {options.dusps.map((d: string) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* ENTITY */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">ENTITY</label>
          <select 
            className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.entity || ""}
            onChange={(e) => onChange('entity', e.target.value || null)}
          >
            <option value="">[ All Entities ▼ ]</option>
            {options.entities.map((d: string) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* PHASE */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">PHASE</label>
          <select 
            className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.phase || ""}
            onChange={(e) => onChange('phase', e.target.value || null)}
          >
            <option value="">[ All Phases ▼ ]</option>
            {options.phases.map((d: string) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* STATE */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">STATE</label>
          <select 
            className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.stateId || ""}
            onChange={(e) => onChange('state', e.target.value || null)}
          >
            <option value="">[ All States ▼ ]</option>
            {options.states.map((s: any) => <option key={s.id} value={s.id}>{s.state_name}</option>)}
          </select>
        </div>
        
        {/* NADI */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">NADI</label>
          <select 
            className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.nadiId || ""}
            onChange={(e) => onChange('nadi', e.target.value || null)}
          >
            <option value="">[ All NADI ▼ ]</option>
            {options.nadis
              .filter((n:any) => !filters.stateId || true /* Could pre-filter based on state here if states relationship returned in options */)
              .map((n: any) => <option key={n.id} value={n.id}>{n.site_name}</option>)}
          </select>
        </div>

        {/* PROGRAMME */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">PROGRAMME / SUB-PILLAR</label>
          <select 
            className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.programmeId || ""}
            onChange={(e) => onChange('programme', e.target.value || null)}
          >
            <option value="">[ All Programmes ▼ ]</option>
            {options.programmes.map((p: any) => (
              <option key={p.id} value={p.id}>{p.programme_name}</option>
            ))}
          </select>
        </div>

        {/* GENDER */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">GENDER</label>
          <select 
            className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.gender}
            onChange={(e) => onChange('gender', e.target.value)}
          >
            <option value="All">[ All Gender ▼ ]</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* AGE */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">AGE</label>
          <select 
            className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            value={filters.age}
            onChange={(e) => onChange('age', e.target.value)}
          >
            {ageGroups.map(a => <option key={a} value={a}>{a === 'All' ? '[ All Ages ▼ ]' : a}</option>)}
          </select>
        </div>

      </div>
    </div>
  );
}
