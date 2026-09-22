"use client";

import React, { useMemo } from "react";
import Link from "next/link";

export default function AnalyticsNadiTable({ 
  rows, 
  columns, 
  dataKey, 
  searchQuery 
}: { 
  rows: any[], 
  columns: any[], 
  dataKey: "programmes" | "monthly" | "quarterly" | "weekly", 
  searchQuery: string 
}) {
  
  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows;
    const lowerQ = searchQuery.toLowerCase();
    return rows.filter(r => 
      r.name.toLowerCase().includes(lowerQ) || 
      r.refId.toLowerCase().includes(lowerQ) ||
      r.state.toLowerCase().includes(lowerQ)
    );
  }, [rows, searchQuery]);

  // Calculate global totals for footer
  const footerTotals = useMemo(() => {
    const totals: any = {
      globalEvents: 0,
      globalPax: 0,
      columns: {}
    };

    filteredRows.forEach(row => {
      totals.globalEvents += row.totalEvents;
      totals.globalPax += row.totalPax;
      
      columns.forEach(col => {
        if (!totals.columns[col.id]) {
          totals.columns[col.id] = { events: 0, pax: 0, participation: 0 };
        }
        totals.columns[col.id].events += row[dataKey]?.[col.id]?.events || 0;
        totals.columns[col.id].pax += row[dataKey]?.[col.id]?.pax || 0;
        totals.columns[col.id].participation += row[dataKey]?.[col.id]?.participation || 0;
      });
    });

    return totals;
  }, [filteredRows, columns, dataKey]);

  if (filteredRows.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        <p className="text-lg">No NADI sites match the selected filters or search.</p>
      </div>
    );
  }

  const getHeatClass = (events: number) => {
    if (events === 0) return "bg-white";
    if (events <= 2) return "bg-orange-50"; // Low heat
    if (events <= 5) return "bg-orange-100"; // Medium heat
    return "bg-orange-200"; // High heat
  };

  return (
    <div className="overflow-auto h-full relative">
      <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
        <thead className="bg-slate-50 sticky top-0 z-20">
          {/* Top Header Grouping */}
          <tr>
            <th className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-900 sticky left-0 bg-slate-50 z-30" rowSpan={2}>#</th>
            <th className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-900 sticky left-12 bg-slate-50 z-30" rowSpan={2}>REF ID</th>
            <th className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-900 sticky left-32 bg-slate-50 z-30" rowSpan={2}>NADI SITE</th>
            <th className="px-4 py-3 border-b border-r border-gray-200 font-semibold text-gray-900 sticky left-[250px] bg-slate-50 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" rowSpan={2}>STATE</th>
            
            {/* Dynamic Column Headers */}
            {columns.map((col) => (
              <th key={col.id} colSpan={3} className="px-4 py-2 border-b border-r border-gray-200 font-bold text-center text-indigo-900 bg-indigo-50/50">
                {col.name.toUpperCase()}
              </th>
            ))}

            {/* Total Header */}
            <th colSpan={2} className="px-4 py-2 border-b border-gray-200 font-bold text-center text-gray-900 bg-gray-100">
              TOTAL EVENTS / PAX
            </th>
          </tr>
          
          {/* Sub Headers */}
          <tr>
            {columns.map((col) => (
              <React.Fragment key={`${col.id}-sub`}>
                <th className="px-3 py-2 border-b border-gray-200 text-center font-medium text-gray-600 bg-slate-50">EVENT</th>
                <th className="px-3 py-2 border-b border-gray-200 text-center font-medium text-gray-600 bg-slate-50">PAX</th>
                <th className="px-3 py-2 border-b border-r border-gray-200 text-center font-medium text-gray-600 bg-slate-50">PART</th>
              </React.Fragment>
            ))}
            <th className="px-3 py-2 border-b border-gray-200 text-center font-bold text-gray-700 bg-gray-50">EVENT</th>
            <th className="px-3 py-2 border-b border-gray-200 text-center font-bold text-gray-700 bg-gray-50">PAX</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredRows.map((row, index) => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
              <td className="px-4 py-3 text-gray-500 sticky left-0 bg-white group-hover:bg-gray-50 z-10">{index + 1}</td>
              <td className="px-4 py-3 font-medium text-indigo-600 sticky left-12 bg-white group-hover:bg-gray-50 z-10">
                <Link 
                  href={`?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')), nadi: row.id }).toString()}`} 
                  className="hover:underline"
                >
                  {row.refId}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-900 font-medium sticky left-32 bg-white group-hover:bg-gray-50 z-10">{row.name}</td>
              <td className="px-4 py-3 text-gray-600 border-r sticky left-[250px] bg-white group-hover:bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                {row.state}
              </td>

              {/* Dynamic Column Data */}
              {columns.map((col) => {
                const data = row[dataKey]?.[col.id] || { events: 0, pax: 0, participation: 0 };
                return (
                  <React.Fragment key={`${row.id}-${col.id}`}>
                    <td className={`px-3 py-3 text-center ${getHeatClass(data.events)}`}>{data.events}</td>
                    <td className="px-3 py-3 text-center">{data.pax}</td>
                    <td className="px-3 py-3 text-center border-r text-gray-400">{data.participation}</td>
                  </React.Fragment>
                );
              })}

              {/* Row Totals */}
              <td className={`px-3 py-3 text-center font-bold border-l ${getHeatClass(row.totalEvents)}`}>
                {row.totalEvents}
              </td>
              <td className="px-3 py-3 text-center font-bold">
                {row.totalPax}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-100 font-bold sticky bottom-0 z-20">
          <tr>
            <td colSpan={4} className="px-4 py-4 text-right border-t border-r border-gray-300 sticky left-0 z-30 bg-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
              GRAND TOTAL
            </td>
            
            {columns.map((col) => (
              <React.Fragment key={`${col.id}-total`}>
                <td className="px-3 py-4 text-center border-t border-gray-300">{footerTotals.columns[col.id]?.events || 0}</td>
                <td className="px-3 py-4 text-center border-t border-gray-300">{footerTotals.columns[col.id]?.pax || 0}</td>
                <td className="px-3 py-4 text-center border-t border-r border-gray-300">{footerTotals.columns[col.id]?.participation || 0}</td>
              </React.Fragment>
            ))}

            <td className="px-3 py-4 text-center border-t border-l border-gray-300 text-indigo-700">{footerTotals.globalEvents}</td>
            <td className="px-3 py-4 text-center border-t border-gray-300 text-indigo-700">{footerTotals.globalPax}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
