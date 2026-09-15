"use client";

import { useState } from "react";
import { ProgrammeForm } from "@/components/forms/programme-form";
import { deleteProgramme } from "@/app/actions/programmes";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProgrammesClientProps {
  programmes: any[];
}

export function ProgrammesClient({ programmes }: ProgrammesClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  const handleOpenNew = () => {
    setEditingProgramme(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prog: any) => {
    setEditingProgramme(prog);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this programme?")) {
      await deleteProgramme(id);
      router.refresh();
    }
  };

  const filteredProgrammes = programmes.filter((prog) => {
    const matchesSearch = prog.programme_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          prog.programme_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? prog.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'draft': return 'badge-neutral';
      case 'published': return 'badge-info';
      case 'completed': return 'badge-primary';
      case 'archived': return 'badge-warning';
      default: return 'badge-neutral';
    }
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>Programmes</h1>
            <p>Manage all SpectrumMY programmes</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenNew}>+ New Programme</button>
        </div>
      </div>
      
      <div className="page-body">
        <div className="card" style={{ padding: "0" }}>
          <div className="filter-bar" style={{ margin: 0, border: "none", borderBottom: "1px solid var(--border)", borderRadius: 0 }}>
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input 
                className="form-input" 
                placeholder="Search programmes…" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="form-select" 
              style={{ width: "auto", fontSize: "0.82rem", padding: "5px 10px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Programme Name</th>
                <th>Category</th>
                <th>Target Age</th>
                <th>Status</th>
                <th>Modules</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProgrammes.length > 0 ? filteredProgrammes.map((prog) => (
                <tr key={prog.id}>
                  <td><code style={{ fontSize: "0.75rem", background: "var(--surface)", padding: "2px 6px", borderRadius: "4px" }}>{prog.programme_code}</code></td>
                  <td style={{ fontWeight: 600 }}>{prog.programme_name}</td>
                  <td>{prog.category || "-"}</td>
                  <td>{prog.target_age_group || "-"}</td>
                  <td><span className={`badge ${getStatusBadge(prog.status)}`}>{prog.status}</span></td>
                  <td>{prog.moduleCount}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Link href={`/programmes/${prog.id}`} className="btn btn-primary btn-sm">Curriculum</Link>
                      <button className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(prog)}>Edit</button>
                      <button className="btn btn-ghost btn-sm text-red-500" onClick={() => handleDelete(prog.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>No programmes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">{editingProgramme ? "Edit Programme" : "New Programme"}</h2>
            <ProgrammeForm 
              initialData={editingProgramme} 
              onSuccess={() => setIsFormOpen(false)} 
              onCancel={() => setIsFormOpen(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
}
