"use client";

import { useState } from "react";
import { NadiForm } from "@/components/forms/nadi-form";
import { NadiFormData } from "@/lib/validations/nadi";
import { deleteNadiSite } from "@/app/actions/nadi";
import { useRouter } from "next/navigation";

interface NadiClientProps {
  nadiSites: any[];
  states: any[];
}

export function NadiClient({ nadiSites, states }: NadiClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNadi, setEditingNadi] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const router = useRouter();

  const handleOpenNew = () => {
    setEditingNadi(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (nadi: any) => {
    setEditingNadi(nadi);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this NADI site?")) {
      await deleteNadiSite(id);
      router.refresh();
    }
  };

  const filteredSites = nadiSites.filter((nadi) => {
    const matchesSearch = nadi.nadi_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          nadi.nadi_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = stateFilter ? nadi.state_id === stateFilter : true;
    return matchesSearch && matchesState;
  });

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>NADI Sites</h1>
            <p>Manage and monitor all NADI community centres</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenNew}>+ Add NADI Site</button>
        </div>
      </div>
      
      <div className="page-body">
        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "Total Sites", value: nadiSites.length, icon: "🏛" },
            { label: "Active Sites", value: nadiSites.filter(n=>n.status==='active').length, icon: "✅" },
            { label: "States Covered", value: new Set(nadiSites.map(n=>n.state_id)).size, icon: "🗺" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card card-sm" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "22px" }}>{icon}</span>
              <div>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary)" }}>{value}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="filter-bar" style={{ margin: 0, border: "none", borderBottom: "1px solid var(--border)", borderRadius: 0 }}>
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input 
                className="form-input" 
                placeholder="Search NADI sites…" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="form-select" 
              style={{ width: "auto", fontSize: "0.82rem", padding: "5px 10px" }}
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state.id} value={state.id}>{state.state_name}</option>
              ))}
            </select>
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>NADI Name</th>
                <th>State</th>
                <th>District</th>
                <th>Contact Person</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSites.length > 0 ? filteredSites.map((nadi) => (
                <tr key={nadi.id}>
                  <td><code style={{ fontSize: "0.72rem", background: "var(--surface)", padding: "2px 6px", borderRadius: "4px" }}>{nadi.nadi_code}</code></td>
                  <td style={{ fontWeight: 500 }}>{nadi.nadi_name}</td>
                  <td>{nadi.states?.state_name}</td>
                  <td>{nadi.district || "-"}</td>
                  <td style={{ fontSize: "0.82rem" }}>{nadi.contact_person || "-"}</td>
                  <td><span className={`badge ${nadi.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>{nadi.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(nadi)}>Edit</button>
                      <button className="btn btn-ghost btn-sm text-red-500" onClick={() => handleDelete(nadi.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>No NADI sites found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{editingNadi ? "Edit NADI Site" : "Add NADI Site"}</h2>
            <NadiForm 
              initialData={editingNadi} 
              states={states} 
              onSuccess={() => setIsFormOpen(false)} 
              onCancel={() => setIsFormOpen(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
}
