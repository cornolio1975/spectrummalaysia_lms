"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  ExternalLink, 
  Award, 
  BookOpen, 
  Layers, 
  Plus,
  Loader2
} from "lucide-react";
import { gradePracticalSubmission } from "@/app/actions/assessments";
import { toast } from "sonner";

interface Props {
  gradingQueue: any[];
  assessments: any[];
}

export function PracticalAssessmentsClient({ gradingQueue, assessments }: Props) {
  const [activeTab, setActiveTab] = useState<"queue" | "catalog">("queue");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const [score, setScore] = useState(85);
  const [isCompetent, setIsCompetent] = useState(true);
  const [trainerObservation, setTrainerObservation] = useState("");
  const [submittingGrade, setSubmittingGrade] = useState(false);

  const handleOpenGrading = (sub: any) => {
    setGradingSubmission(sub);
    setScore(sub.score || sub.practical_assessments?.pass_mark || 80);
    setIsCompetent(sub.is_competent ?? true);
    setTrainerObservation(sub.trainer_observation || "");
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    setSubmittingGrade(true);
    try {
      const res = await gradePracticalSubmission({
        submission_id: gradingSubmission.id,
        score: Number(score),
        is_competent: isCompetent,
        trainer_observation: trainerObservation,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Submission successfully graded and competency recorded!");
        setGradingSubmission(null);
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit grade");
    } finally {
      setSubmittingGrade(false);
    }
  };

  const filteredQueue = gradingQueue.filter((item) => {
    const matchesSearch =
      item.participants?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.practical_assessments?.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="h-7 w-7 text-indigo-600" />
            Practical Assessments & Rubrics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Performance rubric evaluations, capstone project grading, and accredited competency verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            <BookOpen className="h-4 w-4" />
            Manage Course Tasks
          </Link>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 block">Pending Grading</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">
            {gradingQueue.filter((q) => q.status === "submitted" || q.status === "under_review").length}
          </span>
          <span className="text-[11px] text-gray-400 mt-1 block">Awaiting trainer evaluation</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 block">Competent Awarded</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">
            {gradingQueue.filter((q) => q.status === "competent" || q.is_competent).length}
          </span>
          <span className="text-[11px] text-gray-400 mt-1 block">Mastery standard achieved</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 block">Total Active Tasks</span>
          <span className="text-2xl font-bold text-indigo-600 mt-1 block">{assessments.length}</span>
          <span className="text-[11px] text-gray-400 mt-1 block">Across course catalog</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("queue")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "queue"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Clock className="h-4 w-4" /> Trainer Grading Queue ({gradingQueue.length})
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "catalog"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Layers className="h-4 w-4" /> Assessment Tasks Catalog ({assessments.length})
          </button>
        </nav>
      </div>

      {/* TAB 1: GRADING QUEUE */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search participant or task title..."
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
                <option value="all">All Submissions</option>
                <option value="submitted">Pending Review</option>
                <option value="competent">Competent (Passed)</option>
                <option value="not_yet_competent">Not Yet Competent</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 text-xs">
                  <tr>
                    <th className="px-6 py-3">Learner Participant</th>
                    <th className="px-6 py-3">Assessment Task & Course</th>
                    <th className="px-6 py-3">Submitted Date</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Result</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No submissions currently match the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/75 transition">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{item.participants?.full_name}</p>
                          <span className="text-xs text-gray-400 font-mono">
                            {item.participants?.email || item.participants?.phone}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">
                            {item.practical_assessments?.title}
                          </p>
                          <span className="text-xs text-indigo-600 font-mono">
                            {item.practical_assessments?.courses?.course_code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(item.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-900">
                            {item.score != null ? `${item.score}%` : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              item.status === "competent" || item.is_competent
                                ? "bg-emerald-100 text-emerald-800"
                                : item.status === "not_yet_competent"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {item.status?.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenGrading(item)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition"
                          >
                            Grade Rubric
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TASKS CATALOG */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="font-mono text-indigo-600 font-bold">
                    {task.courses?.course_code || "GEN-TASK"}
                  </span>
                  <span>Pass: {task.pass_mark}%</span>
                </div>
                <h3 className="font-bold text-gray-900 text-base">{task.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-3 mt-1.5">{task.instructions}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  Submissions: <strong>{task.practical_submissions?.[0]?.count || 0}</strong>
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Max: {task.max_score} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grading Rubric Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Assessor Grading Rubric</h3>
                <p className="text-xs text-gray-500">
                  Learner: {gradingSubmission.participants?.full_name}
                </p>
              </div>
              <button
                onClick={() => setGradingSubmission(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
              <span className="font-bold text-gray-700 block">
                {gradingSubmission.practical_assessments?.title}
              </span>
              <p className="text-gray-500">
                Passing Benchmark: {gradingSubmission.practical_assessments?.pass_mark || 75}%
              </p>
              {gradingSubmission.evidence_urls?.length > 0 && (
                <div className="pt-2">
                  <span className="font-bold text-indigo-700 block mb-1">Submitted Evidence:</span>
                  {gradingSubmission.evidence_urls.map((url: string, idx: number) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 hover:underline block truncate"
                    >
                      <ExternalLink className="h-3 w-3" /> {url}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Rubric Assessment Score (0 - 100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={score}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setScore(val);
                    setIsCompetent(val >= (gradingSubmission.practical_assessments?.pass_mark || 75));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50">
                <input
                  type="checkbox"
                  id="competentCheck"
                  checked={isCompetent}
                  onChange={(e) => setIsCompetent(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="competentCheck" className="text-xs font-semibold text-gray-800 cursor-pointer">
                  Award Performance Competency (Satisfies standard criteria)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Trainer Feedback & Observations *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the learner's strengths, practical demonstration feedback, and recommendations..."
                  value={trainerObservation}
                  onChange={(e) => setTrainerObservation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGrade}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                >
                  {submittingGrade ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Save Evaluation
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
