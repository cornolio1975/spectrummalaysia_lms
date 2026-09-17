"use client";

import { useState } from "react";
import { 
  Briefcase, 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  FileText, 
  Award, 
  Plus,
  Loader2
} from "lucide-react";
import { reviewRPLApplication, submitRPLApplication } from "@/app/actions/rpl";
import { toast } from "sonner";

interface Props {
  applications: any[];
  participants: any[];
  courses: any[];
}

export function RPLApplicationsClient({ applications, participants, courses }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Review Modal State
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [reviewStatus, setReviewStatus] = useState<any>("approved");
  const [feedback, setFeedback] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // New Application Modal State
  const [isApplying, setIsApplying] = useState(false);
  const [participantId, setParticipantId] = useState(participants[0]?.id || "");
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [yearsExperience, setYearsExperience] = useState(5);
  const [claimSummary, setClaimSummary] = useState("");
  const [submittingApp, setSubmittingApp] = useState(false);

  const handleOpenReview = (app: any) => {
    setSelectedApp(app);
    setReviewStatus(app.status === "submitted" ? "approved" : app.status);
    setFeedback(app.assessor_feedback || "");
    setInterviewDate(app.interview_scheduled_at ? app.interview_scheduled_at.slice(0, 16) : "");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmittingReview(true);
    try {
      const res = await reviewRPLApplication({
        applicationId: selectedApp.id,
        status: reviewStatus,
        feedback,
        interviewDate: interviewDate || undefined,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("RPL review decision successfully updated!");
        setSelectedApp(null);
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update RPL application");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId || !courseId) return;

    setSubmittingApp(true);
    try {
      const res = await submitRPLApplication({
        participant_id: participantId,
        target_course_id: courseId,
        years_of_experience: Number(yearsExperience) || 1,
        experience_summary: claimSummary.trim() || "Candidate prior industry experience and equivalent coursework submission.",
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("RPL application submitted successfully!");
        setIsApplying(false);
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create application");
    } finally {
      setSubmittingApp(false);
    }
  };

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.participants?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      app.courses?.title?.toLowerCase().includes(search.toLowerCase()) ||
      app.application_code?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-indigo-600" />
            Recognition of Prior Learning (RPL)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Assess prior workplace experience, competency portfolios, and grant modular course exemptions.
          </p>
        </div>

        <button
          onClick={() => setIsApplying(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          Submit RPL Claim
        </button>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 block">Total Claims</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{applications.length}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 block">Under Review</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {applications.filter((a) => a.status === "submitted" || a.status === "under_review").length}
          </span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 block">Interviews Scheduled</span>
          <span className="text-2xl font-bold text-indigo-600 mt-1 block">
            {applications.filter((a) => a.status === "interview_scheduled").length}
          </span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 block">Exemptions Approved</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {applications.filter((a) => a.status === "approved").length}
          </span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidate, code, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="approved">Approved (Exempted)</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 text-xs">
              <tr>
                <th className="px-6 py-3">Claim Code</th>
                <th className="px-6 py-3">Applicant Candidate</th>
                <th className="px-6 py-3">Course Exemption Target</th>
                <th className="px-6 py-3">Experience</th>
                <th className="px-6 py-3">Evidence</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No RPL applications match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/75 transition">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-indigo-600">
                      {app.application_code || "RPL-PENDING"}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{app.participants?.full_name}</p>
                      <span className="text-xs text-gray-400 font-mono">
                        {app.participants?.email || app.participants?.phone}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{app.courses?.title}</p>
                      <span className="text-xs text-gray-400 font-mono">
                        {app.courses?.course_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {app.years_experience} years
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {app.rpl_evidence?.length || 0} artifacts
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          app.status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : app.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : app.status === "interview_scheduled"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {app.status?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenReview(app)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition"
                      >
                        Review Claim
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Assessor RPL Evaluation</h3>
                <p className="text-xs text-gray-500">
                  Applicant: {selectedApp.participants?.full_name} ({selectedApp.years_experience} yrs exp)
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
              <div>
                <span className="font-bold text-gray-700 block">Course Target for Exemption:</span>
                <p className="text-gray-600">{selectedApp.courses?.title}</p>
              </div>
              <div>
                <span className="font-bold text-gray-700 block">Candidate Claim Summary:</span>
                <p className="text-gray-600">{selectedApp.claim_summary || "No written summary provided."}</p>
              </div>
              {selectedApp.rpl_evidence?.length > 0 && (
                <div>
                  <span className="font-bold text-indigo-700 block">Evidence Artifacts:</span>
                  {selectedApp.rpl_evidence.map((ev: any) => (
                    <a
                      key={ev.id}
                      href={ev.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 hover:underline block truncate mt-0.5"
                    >
                      <ExternalLink className="h-3 w-3" /> {ev.title} ({ev.evidence_type})
                    </a>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Determination / Stage *
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="under_review">Under Review (Assessing Evidence)</option>
                  <option value="interview_scheduled">Schedule Panel Interview</option>
                  <option value="practical_validation">Request Practical Validation Test</option>
                  <option value="approved">Approve (Award Course Exemption Credit)</option>
                  <option value="rejected">Reject Claim</option>
                </select>
              </div>

              {reviewStatus === "interview_scheduled" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Interview Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Assessor Feedback & Findings
                </label>
                <textarea
                  rows={3}
                  placeholder="Record formal reasons for exemption approval, interview notes, or rejection rationale..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Save Decision
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Application Modal */}
      {isApplying && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Submit New RPL Claim</h3>
              <button
                onClick={() => setIsApplying(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateApp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Candidate Participant *
                </label>
                <select
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.ic_number || p.email || p.id.slice(0, 8)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Course Target for Exemption *
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.course_code}] {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Relevant Work Experience (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Prior Experience & Competency Claim *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail previous job roles, professional certifications, projects delivered, or equivalent academic credits..."
                  value={claimSummary}
                  onChange={(e) => setClaimSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsApplying(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApp}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submittingApp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Submit RPL Claim
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
