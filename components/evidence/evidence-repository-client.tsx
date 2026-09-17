"use client";

import { useState } from "react";
import { 
  FolderArchive, 
  Search, 
  Plus, 
  FileText, 
  Video, 
  Award, 
  ExternalLink, 
  Lock, 
  CheckCircle2, 
  Filter,
  Loader2
} from "lucide-react";
import { storeEvidenceItem } from "@/app/actions/evidence";
import { toast } from "sonner";

interface Props {
  evidenceList: any[];
  participants: any[];
  courses: any[];
}

export function EvidenceRepositoryClient({ evidenceList, participants, courses }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // New Evidence Modal
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [evidenceType, setEvidenceType] = useState("project_report");
  const [fileUrl, setFileUrl] = useState("");
  const [participantId, setParticipantId] = useState(participants[0]?.id || "");
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) {
      toast.error("Please provide both title and file/resource URL");
      return;
    }

    setSubmitting(true);
    try {
      const res = await storeEvidenceItem({
        title,
        evidenceType,
        fileUrl,
        participantId: participantId || undefined,
        courseId: courseId || undefined,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Evidence item securely cataloged!");
        setIsUploading(false);
        setTitle("");
        setFileUrl("");
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to store evidence item");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = evidenceList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.participants?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.courses?.title?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.evidence_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FolderArchive className="h-7 w-7 text-indigo-600" />
            Evidence Repository Vault
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Centralized institutional storage for capstone projects, rubrics proof, external certs, and RPL artifacts.
          </p>
        </div>

        <button
          onClick={() => setIsUploading(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          Deposit Evidence
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search evidence title, candidate, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Evidence Types</option>
            <option value="project_report">Project Report / Document</option>
            <option value="video_demo">Video Demonstration</option>
            <option value="external_cert">Prior External Certificate</option>
            <option value="code_repository">Source Code Repository</option>
            <option value="work_portfolio">Work Portfolio</option>
          </select>
        </div>
      </div>

      {/* Evidence Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">
          <FolderArchive className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="font-semibold text-gray-700">No Evidence Records Found</p>
          <p className="text-xs text-gray-400 mt-1">
            Deposit assessment artifacts, student portfolios, or RPL documents above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {item.evidence_type?.replace("_", " ")}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-500">
                    <Lock className="h-3 w-3" /> {item.access_level || "internal"}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>

                {item.participants && (
                  <p className="text-xs text-gray-600 mt-1">
                    Learner: <strong>{item.participants.full_name}</strong>
                  </p>
                )}

                {item.courses && (
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    Course: [{item.courses.course_code}] {item.courses.title}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">
                  {new Date(item.uploaded_at).toLocaleDateString()}
                </span>
                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                >
                  Open Resource <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Deposit Evidence Artifact</h3>
              <button
                onClick={() => setIsUploading(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Evidence Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Capstone AI Chatbot System Architecture & Codebase"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Evidence Type
                </label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="project_report">Project Report / Technical Document</option>
                  <option value="video_demo">Video Demonstration</option>
                  <option value="external_cert">Prior External Certificate</option>
                  <option value="code_repository">Source Code Repository</option>
                  <option value="work_portfolio">Work Portfolio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  File or Cloud Storage URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://storage.googleapis.com/... or https://github.com/..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Related Participant
                  </label>
                  <select
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">(None / General)</option>
                    {participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Related Course
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">(None / Cross-disciplinary)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.course_code}] {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Deposit Item
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
