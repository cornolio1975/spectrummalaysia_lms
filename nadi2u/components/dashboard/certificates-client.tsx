"use client";

import { useState } from "react";
import { revokeCertificate } from "@/app/actions/certificates";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CertificatesClientProps {
  certificates: any[];
}

export function CertificatesClient({ certificates }: CertificatesClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleRevoke = async (id: string) => {
    const reason = prompt("Enter reason for revocation:");
    if (reason) {
      await revokeCertificate(id, reason);
      router.refresh();
    }
  };

  const filteredCerts = certificates.filter((cert) => {
    const searchString = `${cert.certificate_no} ${cert.participants?.profiles?.full_name} ${cert.programmes?.programme_name}`.toLowerCase();
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
          <button className="btn btn-primary btn-sm" onClick={() => alert('Certificate issuance is typically automated upon course completion.')}>+ Issue Certificate</button>
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
                  <td>{cert.participants?.profiles?.full_name || "-"}</td>
                  <td>{cert.programmes?.programme_name}</td>
                  <td>{cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : "-"}</td>
                  <td><span className={`badge ${getStatusBadge(cert.status)}`}>{cert.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Link href={`/verify/${cert.certificate_no}`} target="_blank" className="btn btn-outline btn-sm">Verify Link</Link>
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
    </>
  );
}
