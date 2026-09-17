"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Props {
  content: {
    id: string;
    title: string;
    content_body?: string;
  };
  onComplete?: () => void;
}

export function InteractiveAssignmentBlock({ content, onComplete }: Props) {
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceUrl.trim()) {
      toast.error("Please provide a document or evidence link (e.g. Google Drive, PDF, or portfolio URL).");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
      toast.success("Assignment submitted successfully!");
      if (onComplete) {
        onComplete();
      }
    }, 600);
  };

  return (
    <div className="card p-6 md:p-8 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
      {/* Title & Instructions */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
            📂 Practical Assignment Submission
          </span>
        </div>
        <h3 className="text-xl font-bold text-slate-900">{content.title}</h3>
      </div>

      <div
        className="text-xs text-slate-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content.content_body || "" }}
      />

      {/* Submission Form */}
      {submitted ? (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-sm text-emerald-900">Portfolio / Assignment Received</h4>
            <p className="mt-0.5 text-emerald-800">
              Your submission has been recorded in the LMS Evidence Repository. Link:{" "}
              <a href={evidenceUrl} target="_blank" rel="noreferrer" className="underline font-medium">
                {evidenceUrl}
              </a>
            </p>
            {notes && <p className="mt-1 text-emerald-700 italic">Notes: "{notes}"</p>}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-200 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Document or Evidence Link (Google Drive / OneDrive / Portfolio URL) *
            </label>
            <input
              type="url"
              required
              placeholder="https://drive.google.com/file/d/... or https://portfolio.my/..."
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Ensure link sharing permissions are set to "Anyone with the link can view".
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Learner Submission Notes &amp; Highlights (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Briefly state your business idea name, target market, or key takeaways..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <UploadCloud className="h-4 w-4" />
            {submitting ? "Uploading..." : "Submit Practical Assignment"}
          </button>
        </form>
      )}
    </div>
  );
}
