"use client";

import { useState } from "react";
import { revokeCertificate, issueCertificate } from "@/app/actions/certificates";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CertificatesClientProps {
  certificates: any[];
  participants: any[];
  programmes: any[];
}

export function CertificatesClient({ certificates, participants, programmes }: CertificatesClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [issueSuccess, setIssueSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleRevoke = async (id: string) => {
    const reason = prompt("Enter reason for revocation:");
    if (reason) {
      await revokeCertificate(id, reason);
      router.refresh();
    }
  };

  const handleOpenIssueModal = () => {
    setSelectedParticipant("");
    setSelectedProgramme("");
    setIssueError(null);
    setIssueSuccess(null);
    setIsIssueModalOpen(true);
  };

  const handleIssueCertificate = async () => {
    if (!selectedParticipant || !selectedProgramme) {
      setIssueError("Please select both a participant and a programme.");
      return;
    }
    setIsIssuing(true);
    setIssueError(null);
    const result = await issueCertificate(selectedParticipant, selectedProgramme);
    setIsIssuing(false);
    if (result.error) {
      setIssueError(result.error);
    } else {
      setIssueSuccess(`Certificate ${result.data?.certificate_no} issued successfully!`);
      router.refresh();
      setTimeout(() => setIsIssueModalOpen(false), 2000);
    }
  };

  const filteredCerts = certificates.filter((cert) => {
    const searchString = `${cert.certificate_no} ${cert.participants?.full_name} ${cert.programmes?.programme_name}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'issued': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'revoked': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1>Certificates</h1>
            <p>Manage and verify participant certificates</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenIssueModal}>+ Issue Certificate</button>
        </div>
      </div>
      
      <div className="page-body">
        <div className="card" style={{ padding: "0" }}>
          <div className="filter-bar" style={{ margin: 0, border: "none", borderBottom: "1px solid var(--border)", borderRadius: 0 }}>
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input 
                className="form-input" 
                placeholder="Search by ID, name, or programme…" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>Certificate No.</th>
                <th>Participant</th>
                <th>Programme</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCerts.length > 0 ? filteredCerts.map((cert) => (
                <tr key={cert.id}>
                  <td style={{ fontWeight: 600, fontFamily: "monospace" }}>{cert.certificate_no}</td>
                  <td>{cert.participants?.full_name || "-"}</td>
                  <td>{cert.programmes?.programme_name}</td>
                  <td>{cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : "-"}</td>
                  <td><span className={`badge ${getStatusBadge(cert.status)}`}>{cert.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Link href={`/certificates/${cert.id}/view`} className="btn btn-outline btn-sm">View/Print</Link>
                      <Link href={`/verify/${cert.certificate_no}`} target="_blank" className="btn btn-ghost btn-sm text-gray-500">Verify Link</Link>
                      {cert.status !== 'revoked' && (
                        <button className="btn btn-ghost btn-sm text-red-500" onClick={() => handleRevoke(cert.id)}>Revoke</button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>No certificates found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Certificate Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Issue Certificate</h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                onClick={() => setIsIssueModalOpen(false)}
              >
                &times;
              </button>
            </div>

            {issueSuccess ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎓</div>
                <p className="text-green-600 font-semibold text-lg">{issueSuccess}</p>
                <p className="text-sm text-gray-500 mt-2">The certificate list will be refreshed shortly.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {issueError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {issueError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Participant <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="form-select w-full"
                    value={selectedParticipant}
                    onChange={(e) => setSelectedParticipant(e.target.value)}
                  >
                    <option value="">— Select Participant —</option>
                    {participants.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} {p.ic_number ? `(${p.ic_number})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Programme <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="form-select w-full"
                    value={selectedProgramme}
                    onChange={(e) => setSelectedProgramme(e.target.value)}
                  >
                    <option value="">— Select Programme —</option>
                    {programmes.map((prog: any) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.programme_name} ({prog.programme_code})
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  A unique certificate number (SpectrumMY-YYYY-XXXXXX) will be auto-generated.
                </p>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    className="btn btn-outline"
                    onClick={() => setIsIssueModalOpen(false)}
                    disabled={isIssuing}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleIssueCertificate}
                    disabled={isIssuing}
                  >
                    {isIssuing ? "Issuing..." : "Issue Certificate"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
