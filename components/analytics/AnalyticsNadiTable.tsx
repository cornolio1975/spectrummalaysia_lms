"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";

export default function AnalyticsNadiTable({ 
  rows = [], 
  columns = [], 
  dataKey, 
  searchQuery = "" 
}: { 
  rows: any[], 
  columns: any[], 
  dataKey: "programmes" | "monthly" | "quarterly" | "weekly", 
  searchQuery: string 
}) {
  const safeRows = rows || [];
  const safeColumns = columns || [];

  const [pageSize, setPageSize] = useState<number | "All">(50);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!searchQuery) return safeRows;
    const lowerQ = searchQuery.toLowerCase().trim();
    return safeRows.filter(r => 
      (r?.name || "").toLowerCase().includes(lowerQ) || 
      (r?.refId || "").toLowerCase().includes(lowerQ) ||
      (r?.state || "").toLowerCase().includes(lowerQ)
    );
  }, [safeRows, searchQuery]);

  // Reset page when search or total rows change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dataKey, safeRows.length]);

  // Calculate global totals for footer across ALL filtered rows
  const footerTotals = useMemo(() => {
    const totals: any = {
      globalEvents: 0,
      globalPax: 0,
      columns: {}
    };

    filteredRows.forEach(row => {
      totals.globalEvents += Number(row?.totalEvents) || 0;
      totals.globalPax += Number(row?.totalPax) || 0;
      
      safeColumns.forEach(col => {
        if (!totals.columns[col.id]) {
          totals.columns[col.id] = { events: 0, pax: 0, participation: 0 };
        }
        totals.columns[col.id].events += Number(row?.[dataKey]?.[col.id]?.events) || 0;
        totals.columns[col.id].pax += Number(row?.[dataKey]?.[col.id]?.pax) || 0;
        totals.columns[col.id].participation += Number(row?.[dataKey]?.[col.id]?.participation) || 0;
      });
    });

    return totals;
  }, [filteredRows, safeColumns, dataKey]);

  // Pagination calculation
  const totalItems = filteredRows.length;
  const isAll = pageSize === "All";
  const numPageSize = typeof pageSize === "number" ? pageSize : totalItems;
  const totalPages = isAll ? 1 : Math.ceil(totalItems / numPageSize) || 1;
  const validatedCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedRows = useMemo(() => {
    if (isAll) return filteredRows;
    const start = (validatedCurrentPage - 1) * numPageSize;
    return filteredRows.slice(start, start + numPageSize);
  }, [filteredRows, isAll, validatedCurrentPage, numPageSize]);

  if (filteredRows.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        <p className="text-lg">No NADI sites match the selected filters or search.</p>
      </div>
    );
  }

  const getHeatClass = (events: number) => {
    if (!events || events === 0) return "bg-white";
    if (events <= 2) return "bg-orange-50"; // Low heat
    if (events <= 5) return "bg-orange-100"; // Medium heat
    return "bg-orange-200"; // High heat
  };

  const startIndex = isAll ? 0 : (validatedCurrentPage - 1) * numPageSize;
  const endIndex = isAll ? totalItems : Math.min(startIndex + numPageSize, totalItems);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Table Pagination Header / Info */}
      <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border-b border-gray-200 text-xs text-gray-600">
        <div>
          Showing <span className="font-semibold text-gray-900">{totalItems === 0 ? 0 : startIndex + 1}</span> to{" "}
          <span className="font-semibold text-gray-900">{endIndex}</span> of{" "}
          <span className="font-semibold text-gray-900">{totalItems}</span> rows
        </div>
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select 
            className="border border-gray-300 rounded px-2 py-0.5 text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={pageSize}
            onChange={(e) => {
              const val = e.target.value === "All" ? "All" : Number(e.target.value);
              setPageSize(val);
              setCurrentPage(1);
            }}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="All">All ({totalItems})</option>
          </select>

          {!isAll && totalPages > 1 && (
            <div className="flex items-center gap-1 ml-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={validatedCurrentPage === 1}
                className="px-2 py-0.5 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                Prev
              </button>
              <span className="px-1 text-gray-700">
                {validatedCurrentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={validatedCurrentPage === totalPages}
                className="px-2 py-0.5 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-auto flex-1 relative">
        <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-20">
            {/* Top Header Grouping */}
            <tr>
              <th className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-900 sticky left-0 bg-slate-50 z-30" rowSpan={2}>#</th>
              <th className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-900 sticky left-12 bg-slate-50 z-30" rowSpan={2}>REF ID</th>
              <th className="px-4 py-3 border-b border-gray-200 font-semibold text-gray-900 sticky left-32 bg-slate-50 z-30" rowSpan={2}>NADI SITE</th>
              <th className="px-4 py-3 border-b border-r border-gray-200 font-semibold text-gray-900 sticky left-[250px] bg-slate-50 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" rowSpan={2}>STATE</th>
              
              {/* Dynamic Column Headers */}
              {safeColumns.map((col) => (
                <th key={col.id} colSpan={3} className="px-4 py-2 border-b border-r border-gray-200 font-bold text-center text-indigo-900 bg-indigo-50/50">
                  {String(col?.name || "").toUpperCase()}
                </th>
              ))}

              {/* Total Header */}
              <th colSpan={2} className="px-4 py-2 border-b border-gray-200 font-bold text-center text-gray-900 bg-gray-100">
                TOTAL EVENTS / PAX
              </th>
            </tr>
            
            {/* Sub Headers */}
            <tr>
              {safeColumns.map((col) => (
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
            {paginatedRows.map((row, index) => {
              const globalIndex = startIndex + index + 1;
              return (
                <tr key={row?.id || index} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3 text-gray-500 sticky left-0 bg-white group-hover:bg-gray-50 z-10">{globalIndex}</td>
                  <td className="px-4 py-3 font-medium text-indigo-600 sticky left-12 bg-white group-hover:bg-gray-50 z-10">
                    <Link 
                      href={`?nadi=${encodeURIComponent(row.id || '')}`} 
                      className="hover:underline"
                    >
                      {row?.refId || "-"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium sticky left-32 bg-white group-hover:bg-gray-50 z-10">{row?.name || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 border-r sticky left-[250px] bg-white group-hover:bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                    {row?.state || "-"}
                  </td>

                  {/* Dynamic Column Data */}
                  {safeColumns.map((col) => {
                    const data = row?.[dataKey]?.[col.id] || { events: 0, pax: 0, participation: 0 };
                    return (
                      <React.Fragment key={`${row.id}-${col.id}`}>
                        <td className={`px-3 py-3 text-center ${getHeatClass(data.events)}`}>{data.events}</td>
                        <td className="px-3 py-3 text-center">{data.pax}</td>
                        <td className="px-3 py-3 text-center border-r text-gray-400">{data.participation}</td>
                      </React.Fragment>
                    );
                  })}

                  {/* Row Totals */}
                  <td className={`px-3 py-3 text-center font-bold border-l ${getHeatClass(row?.totalEvents || 0)}`}>
                    {row?.totalEvents ?? 0}
                  </td>
                  <td className="px-3 py-3 text-center font-bold">
                    {row?.totalPax ?? 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-100 font-bold sticky bottom-0 z-20">
            <tr>
              <td colSpan={4} className="px-4 py-4 text-right border-t border-r border-gray-300 sticky left-0 z-30 bg-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                GRAND TOTAL
              </td>
              
              {safeColumns.map((col) => (
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
    </div>
  );
}
