"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  revokeCertificate,
  issueCertificate,
  replaceCertificate,
  getCertificateAuditTrail,
} from "@/app/actions/certificates";
import { toast } from "sonner";

interface CertificatesClientProps {
  certificates: any[];
  participants: any[];
  programmes: any[];
  courses?: any[];
}

export function CertificatesClient({
  certificates,
  participants,
  programmes,
  courses = [],
}: CertificatesClientProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");

  // Issue Modal
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);

  // Revoke Modal
  const [revokingCert, setRevokingCert] = useState<any | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);

  // Replace Modal
  const [replacingCert, setReplacingCert] = useState<any | null>(null);
  const [correctedName, setCorrectedName] = useState("");
  const [replaceReason, setReplaceReason] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);

  // Audit History Modal
  const [historyCert, setHistoryCert] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Handlers
  const handleOpenRevokeModal = (cert: any) => {
    setRevokingCert(cert);
    setRevokeReason("");
  };

  const handleConfirmRevoke = async () => {
    if (!revokeReason.trim()) {
      toast.error("Please enter a mandatory revocation reason.");
      return;
    }
    setIsRevoking(true);
    try {
      const res = await revokeCertificate(revokingCert.id, revokeReason);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Certificate ${revokingCert.certificate_no} has been revoked.`);
        setRevokingCert(null);
        router.refresh();
      }
    } finally {
      setIsRevoking(false);
    }
  };

  const handleOpenReplaceModal = (cert: any) => {
    setReplacingCert(cert);
    const snapshot = cert.snapshot_data || {};
    setCorrectedName(snapshot.learner_full_name || cert.participants?.full_name || "");
    setReplaceReason("");
  };

  const handleConfirmReplace = async () => {
    if (!replaceReason.trim()) {
      toast.error("Please enter a mandatory replacement reason.");
      return;
    }
    setIsReplacing(true);
    try {
      const res = await replaceCertificate({
        originalCertificateId: replacingCert.id,
        correctedLearnerName: correctedName.trim() || undefined,
        reason: replaceReason.trim(),
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`New certificate ${res.data?.certificate_no} issued as replacement.`);
        setReplacingCert(null);
        router.refresh();
      }
    } finally {
      setIsReplacing(false);
    }
  };

  const handleViewAuditHistory = async (cert: any) => {
    setHistoryCert(cert);
    setLoadingHistory(true);
    try {
      const res = await getCertificateAuditTrail(cert.id);
      setAuditLogs(res.data || []);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleIssueCertificate = async () => {
    if (!selectedParticipant) {
      setIssueError("Please select a participant.");
      return;
    }
    setIsIssuing(true);
    setIssueError(null);
    try {
      const res = await issueCertificate({
        participantId: selectedParticipant,
        courseId: selectedCourse || undefined,
      });
      if (res.error) {
        setIssueError(res.error);
      } else {
        toast.success(`Certificate ${res.data?.certificate_no} issued successfully!`);
        setIsIssueModalOpen(false);
        router.refresh();
      }
    } finally {
      setIsIssuing(false);
    }
  };

  const filteredCerts = certificates.filter((cert) => {
    const snapshot = cert.snapshot_data || {};
    const learner = snapshot.learner_full_name || cert.participants?.full_name || "";
    const courseTitle = snapshot.course_title || cert.courses?.title || cert.programmes?.programme_name || "";
    const searchString = `${cert.certificate_no} ${learner} ${courseTitle}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    const matchesCourse = courseFilter === "all" || cert.course_id === courseFilter || cert.snapshot_data?.course_code === courseFilter;

    return matchesSearch && matchesStatus && matchesCourse;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "issued":
        return "badge-success";
      case "pending":
      case "eligible":
        return "badge-warning";
      case "revoked":
        return "badge-danger";
      case "replaced":
        return "badge-neutral";
      default:
        return "badge-neutral";
    }
  };

  return (
    <>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1>Certificate Management</h1>
            <p>Issue, verify, replace, and audit accredited micro-credentials &amp; certificates</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Link href="/credentials/designer" className="btn btn-secondary btn-sm">
              🎨 Template Builder
            </Link>
            <button className="btn btn-primary btn-sm" onClick={() => setIsIssueModalOpen(true)}>
              + Issue Certificate
            </button>
          </div>
        </div>
      </div>

      <div className="page-body space-y-4">
        
        {/* Filter Toolbar */}
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="search-input-wrap flex-1 min-w-[260px]">
              <span className="search-icon">🔍</span>
              <input
                className="form-input"
                placeholder="Search certificate ID, learner name, or course…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                className="form-select text-xs py-1.5"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="issued">Issued (Valid)</option>
                <option value="revoked">Revoked</option>
                <option value="replaced">Replaced</option>
              </select>

              <select
                className="form-select text-xs py-1.5"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="all">All Courses / Micro-Credentials</option>
                <option value="SPM-LMS-MC-001">MC-001: Startup Ready Malaysia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="card p-0 overflow-x-auto">
          <table className="data-table w-full text-left">
            <thead>
              <tr>
                <th>Certificate ID</th>
                <th>Learner</th>
                <th>Course / Micro-Credential</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCerts.length > 0 ? (
                filteredCerts.map((cert) => {
                  const snapshot = cert.snapshot_data || {};
                  const learner = snapshot.learner_full_name || cert.participants?.full_name || "-";
                  const title = snapshot.course_title || cert.courses?.title || cert.programmes?.programme_name || "Micro-Credential";
                  const isRevoked = cert.status === "revoked";
                  const isReplaced = cert.status === "replaced";

                  return (
                    <tr key={cert.id} className="hover:bg-slate-50/50">
                      <td className="font-mono font-bold text-xs">
                        <Link
                          href={`/certificates/${cert.id}/view`}
                          className="text-primary-600 hover:underline"
                        >
                          {cert.certificate_no}
                        </Link>
                      </td>
                      <td className="font-medium text-sm text-gray-900">{learner}</td>
                      <td>
                        <div className="text-sm font-semibold text-gray-800 line-clamp-1">{title}</div>
                        <div className="text-xs font-mono text-gray-400">
                          {snapshot.course_code || cert.courses?.course_code || "SPM-LMS-MC-001"}
                        </div>
                      </td>
                      <td className="text-xs text-gray-600">
                        {cert.issue_date ? new Date(cert.issue_date).toLocaleDateString("en-MY") : "-"}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(cert.status)} text-[11px] uppercase`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/certificates/${cert.id}/view`}
                            className="btn btn-outline btn-xs"
                            title="View & Download A4 Landscape Certificate"
                          >
                            👁️ View / Print
                          </Link>
                          <Link
                            href={`/verify/certificate/${cert.certificate_no}`}
                            target="_blank"
                            className="btn btn-ghost btn-xs text-blue-600"
                            title="Open Public Verification Page"
                          >
                            🛡️ Verify
                          </Link>
                          <button
                            onClick={() => handleViewAuditHistory(cert)}
                            className="btn btn-ghost btn-xs text-slate-600"
                            title="View Audit Trail"
                          >
                            📜 Audit
                          </button>
                          {!isRevoked && !isReplaced && (
                            <>
                              <button
                                onClick={() => handleOpenReplaceModal(cert)}
                                className="btn btn-ghost btn-xs text-amber-600"
                                title="Replace with corrected certificate"
                              >
                                🔄 Replace
                              </button>
                              <button
                                onClick={() => handleOpenRevokeModal(cert)}
                                className="btn btn-ghost btn-xs text-red-600"
                                title="Revoke certificate"
                              >
                                ⛔ Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No certificates found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revocation Modal (Section 42.11) */}
      {revokingCert && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <span>⛔</span> Revoke Certificate
              </h3>
              <button
                onClick={() => setRevokingCert(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p>
                You are about to revoke certificate <strong className="font-mono text-gray-900">{revokingCert.certificate_no}</strong>.
              </p>
              <p className="text-xs text-red-600 font-medium">
                This action is permanent and will display as REVOKED on the public verification page.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Mandatory Revocation Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                className="form-textarea w-full text-sm p-2.5 border rounded-lg"
                rows={3}
                placeholder="e.g. Academic dishonesty detected on capstone evaluation..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setRevokingCert(null)}
                disabled={isRevoking}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleConfirmRevoke}
                disabled={isRevoking || !revokeReason.trim()}
              >
                {isRevoking ? "Revoking..." : "Confirm Revocation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replacement Modal (Section 42.12) */}
      {replacingCert && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-amber-700 flex items-center gap-2">
                <span>🔄</span> Replace Certificate
              </h3>
              <button
                onClick={() => setReplacingCert(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <p>
                Replacing certificate <strong className="font-mono text-gray-900">{replacingCert.certificate_no}</strong>.
              </p>
              <p className="text-amber-800">
                The original certificate will be preserved with status <strong>REPLACED</strong>, and a new unique certificate ID will be generated.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Corrected Learner Full Name
              </label>
              <input
                className="form-input w-full text-sm"
                value={correctedName}
                onChange={(e) => setCorrectedName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Replacement Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                className="form-textarea w-full text-sm p-2.5 border rounded-lg"
                rows={2}
                placeholder="e.g. Corrected spelling error in recipient surname..."
                value={replaceReason}
                onChange={(e) => setReplaceReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setReplacingCert(null)}
                disabled={isReplacing}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleConfirmReplace}
                disabled={isReplacing || !replaceReason.trim()}
              >
                {isReplacing ? "Issuing Replacement..." : "Issue Replacement"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Modal (Section 42.16) */}
      {historyCert && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Certificate Audit Trail</h3>
                <p className="text-xs font-mono text-gray-500">{historyCert.certificate_no}</p>
              </div>
              <button
                onClick={() => setHistoryCert(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
              {loadingHistory ? (
                <div className="text-center py-6 text-sm text-gray-500">Loading audit history…</div>
              ) : auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 uppercase tracking-wider">{log.event}</span>
                      <span className="text-slate-400">{new Date(log.created_at).toLocaleString("en-MY")}</span>
                    </div>
                    <div className="text-slate-600">Actor: {log.actor_name || "System"}</div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <pre className="text-[10px] bg-white p-1.5 rounded border border-slate-200 overflow-x-auto text-slate-700">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-sm text-gray-500">No audit records found.</div>
              )}
            </div>

            <div className="text-right pt-2 border-t">
              <button className="btn btn-outline btn-sm" onClick={() => setHistoryCert(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Certificate Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">+ Issue Accredited Certificate</h3>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {issueError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
                {issueError}
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-700">Select Recipient</label>
                <select
                  className="form-select w-full text-sm"
                  value={selectedParticipant}
                  onChange={(e) => setSelectedParticipant(e.target.value)}
                >
                  <option value="">Select a learner…</option>
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.email || p.ic_number || "No ID"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-700">Micro-Credential</label>
                <select
                  className="form-select w-full text-sm"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">SPM-LMS-MC-001: Startup Ready Malaysia</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.course_code}: {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setIsIssueModalOpen(false)}
                disabled={isIssuing}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleIssueCertificate}
                disabled={isIssuing || !selectedParticipant}
              >
                {isIssuing ? "Issuing Certificate..." : "Issue Certificate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
