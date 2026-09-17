"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Award, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  UserCheck, 
  RefreshCw, 
  FileText,
  ExternalLink,
  Ban,
  Loader2
} from "lucide-react";
import { checkEligibility, issueCredential, revokeCredential, renewCredential } from "@/app/actions/credentials";
import { toast } from "sonner";

interface Props {
  credential: any;
  participants: any[];
}

export function CredentialDetailClient({ credential, participants }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "eligibility" | "issuances">("overview");

  // Eligibility Evaluation State
  const [selectedParticipantId, setSelectedParticipantId] = useState(participants[0]?.id || "");
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<any>(null);

  // Issuance State
  const [issuing, setIssuing] = useState(false);

  // Revocation State
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [submittingRevoke, setSubmittingRevoke] = useState(false);

  const handleEvaluate = async () => {
    if (!selectedParticipantId) {
      toast.error("Please select a participant to evaluate");
      return;
    }

    setEvaluating(true);
    setEvalResult(null);
    try {
      const res = await checkEligibility(selectedParticipantId, credential.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        setEvalResult(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to evaluate eligibility");
    } finally {
      setEvaluating(false);
    }
  };

  const handleIssue = async () => {
    if (!selectedParticipantId) return;

    setIssuing(true);
    try {
      const res = await issueCredential(selectedParticipantId, credential.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Credential successfully issued! Code: ${res.data.credential_id_code}`);
        // Refresh evaluation
        handleEvaluate();
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to issue credential");
    } finally {
      setIssuing(false);
    }
  };

  const handleRevokeSubmit = async () => {
    if (!revokingId || !revokeReason.trim()) {
      toast.error("Please enter a mandatory revocation reason");
      return;
    }

    setSubmittingRevoke(true);
    try {
      const res = await revokeCredential(revokingId, revokeReason);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Credential issuance revoked successfully");
        setRevokingId(null);
        setRevokeReason("");
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke credential");
    } finally {
      setSubmittingRevoke(false);
    }
  };

  const handleRenew = async (issuanceId: string) => {
    try {
      const res = await renewCredential(issuanceId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Credential renewed successfully!");
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to renew credential");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link href="/credentials" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Registry
        </Link>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 capitalize">
          Status: {credential.status}
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {credential.credential_code}
                </span>
                <span className="text-xs uppercase font-semibold text-gray-500 tracking-wider">
                  {credential.credential_type?.replace("_", " ")}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{credential.name}</h1>
              <p className="text-sm text-gray-600 mt-1 max-w-3xl">
                {credential.description || "No description provided."}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveTab("eligibility")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs transition"
            >
              <UserCheck className="h-4 w-4" />
              Evaluate & Issue
            </button>
          </div>
        </div>

        {/* Quick Attributes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 text-sm">
          <div>
            <span className="text-gray-400 text-xs block">Competency Level</span>
            <span className="font-semibold text-gray-800 capitalize">{credential.level}</span>
          </div>
          <div>
            <span className="text-gray-400 text-xs block">Learning Hours</span>
            <span className="font-semibold text-gray-800">{credential.learning_hours} hrs</span>
          </div>
          <div>
            <span className="text-gray-400 text-xs block">Validity</span>
            <span className="font-semibold text-gray-800">
              {credential.validity_months ? `${credential.validity_months} Months` : "Lifetime (No Expiry)"}
            </span>
          </div>
          <div>
            <span className="text-gray-400 text-xs block">Active Issuances</span>
            <span className="font-semibold text-emerald-600">
              {credential.credential_issuances?.length || 0} Recipients
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Layers className="h-4 w-4" /> Overview & Requirements ({credential.credential_requirements?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("eligibility")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "eligibility"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Live Eligibility Evaluator
          </button>
          <button
            onClick={() => setActiveTab("issuances")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "issuances"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Award className="h-4 w-4" /> Issued Recipients ({credential.credential_issuances?.length || 0})
          </button>
        </nav>
      </div>

      {/* TAB 1: OVERVIEW & REQUIREMENTS */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
                Eligibility Criteria & Verification Rules
              </h2>

              {(!credential.credential_requirements || credential.credential_requirements.length === 0) ? (
                <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                  No automated criteria specified. Anyone can be approved manually.
                </div>
              ) : (
                <div className="space-y-3">
                  {credential.credential_requirements.map((req: any, idx: number) => (
                    <div key={req.id || idx} className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {req.requirement_type.replace("_", " ")}
                        </span>
                        <h4 className="font-semibold text-gray-900 mt-1">{req.description}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          {req.min_score && <span>Min Score: <strong>{req.min_score}%</strong></span>}
                          {req.min_attendance_pct && <span>Min Attendance: <strong>{req.min_attendance_pct}%</strong></span>}
                          {req.practical_assessment_id && <span>Practical Rubric Assessment required</span>}
                        </div>
                      </div>
                      <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded">
                        Mandatory
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Learning Outcomes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
              <h2 className="text-base font-bold text-gray-900 mb-4">Target Learning Outcomes</h2>
              {(!credential.credential_learning_outcomes || credential.credential_learning_outcomes.length === 0) ? (
                <p className="text-sm text-gray-500">No outcomes cataloged yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-gray-700">
                  {credential.credential_learning_outcomes.map((lo: any, idx: number) => (
                    <li key={lo.id || idx} className="flex items-start gap-2">
                      <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{lo.outcome_text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Prerequisites & Stacking
              </h3>
              {(!credential.credential_prerequisites || credential.credential_prerequisites.length === 0) ? (
                <p className="text-xs text-gray-500">
                  No prior micro-credential prerequisite required for this qualification.
                </p>
              ) : (
                <div className="space-y-2">
                  {credential.credential_prerequisites.map((pr: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                      <span className="font-semibold text-gray-900">{pr.credentials?.name}</span>
                      <span className="text-xs block text-indigo-600 font-mono mt-0.5">
                        {pr.credentials?.credential_code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE ELIGIBILITY EVALUATOR */}
      {activeTab === "eligibility" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Automated Eligibility Engine
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select any registered participant to run a real-time verification audit against all course completions, quiz pass scores, practical assessments, and attendance records.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Select Participant to Audit
              </label>
              <select
                value={selectedParticipantId}
                onChange={(e) => setSelectedParticipantId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.ic_number || p.email || p.id.slice(0, 8)})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {evaluating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Evaluating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" /> Run Eligibility Check
                </>
              )}
            </button>
          </div>

          {/* Evaluation Result Display */}
          {evalResult && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div
                className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  evalResult.isEligible
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                    : "bg-amber-50/70 border-amber-200 text-amber-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  {evalResult.isEligible ? (
                    <CheckCircle className="h-8 w-8 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-8 w-8 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-bold text-base">
                      {evalResult.isEligible
                        ? "Participant is Fully Eligible for Issuance"
                        : "Requirements Incomplete"}
                    </h3>
                    <p className="text-xs mt-0.5 opacity-90">
                      Completed {evalResult.passedCount} of {evalResult.totalRequirements} criteria (
                      {evalResult.completionPercentage}%)
                    </p>
                  </div>
                </div>

                <div>
                  <button
                    onClick={handleIssue}
                    disabled={issuing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 shadow-sm disabled:opacity-50 transition"
                  >
                    {issuing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Issuing...
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4" /> Issue Micro-Credential
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Requirement details list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Detailed Verification Audit
                </h4>
                {evalResult.breakdown?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {item.passed ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      )}
                      <div>
                        <span className="font-medium text-gray-800">{item.description}</span>
                        {item.reason && (
                          <p className="text-xs text-gray-500 mt-0.5">{item.reason}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        item.passed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.passed ? "PASSED" : "PENDING"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ISSUED RECIPIENTS */}
      {activeTab === "issuances" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              Credential Issuances Registry
            </h2>
            <span className="text-xs text-gray-500">
              Total issued: {credential.credential_issuances?.length || 0}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Credential ID Code</th>
                  <th className="px-6 py-3">Recipient Name</th>
                  <th className="px-6 py-3">Issue Date</th>
                  <th className="px-6 py-3">Expiry Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(!credential.credential_issuances || credential.credential_issuances.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No issuances have been recorded yet for this credential.
                    </td>
                  </tr>
                ) : (
                  credential.credential_issuances.map((issuance: any) => (
                    <tr key={issuance.id} className="hover:bg-gray-50/75 transition">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-indigo-600 text-xs">
                          {issuance.credential_id_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {issuance.participants?.full_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {new Date(issuance.issue_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs">
                        {issuance.expiry_date
                          ? new Date(issuance.expiry_date).toLocaleDateString()
                          : "Lifetime"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            issuance.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : issuance.status === "revoked"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {issuance.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          href={`/verify/${issuance.credential_id_code}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Verify <ExternalLink className="h-3 w-3" />
                        </Link>

                        {issuance.status === "active" && (
                          <button
                            onClick={() => setRevokingId(issuance.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 ml-2"
                          >
                            <Ban className="h-3 w-3" /> Revoke
                          </button>
                        )}

                        {issuance.status === "expired" && (
                          <button
                            onClick={() => handleRenew(issuance.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-800 ml-2"
                          >
                            <RefreshCw className="h-3 w-3" /> Renew
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revocation Modal */}
      {revokingId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
              <Ban className="h-5 w-5" /> Revoke Credential Issuance
            </h3>
            <p className="text-xs text-gray-500">
              Revocation is an auditable action that invalidates this credential. A mandatory reason must be recorded for compliance.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Reason for Revocation *
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Academic integrity violation, administrative re-assessment, or participant request..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRevokingId(null);
                  setRevokeReason("");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevokeSubmit}
                disabled={submittingRevoke}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submittingRevoke ? "Revoking..." : "Confirm Revocation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
