"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  ArrowLeft, 
  BookOpen, 
  Award, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldAlert,
  Loader2
} from "lucide-react";
import { createIntervention, resolveIntervention } from "@/app/actions/interventions";
import { toast } from "sonner";

interface Props {
  participant: any;
  enrolments: any[];
  skillsData: { skills: any[]; competencies: any[] };
  credentials: any[];
  interventions: any[];
  courses: any[];
}

export function LearnerProfile360Client({
  participant,
  enrolments,
  skillsData,
  credentials,
  interventions,
  courses,
}: Props) {
  const [activeTab, setActiveTab] = useState<"courses" | "skills" | "credentials" | "interventions">("courses");

  // Trigger Intervention Modal
  const [isTriggering, setIsTriggering] = useState(false);
  const [reason, setReason] = useState("low_progress");
  const [interventionType, setInterventionType] = useState("reminder");
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [notes, setNotes] = useState("");
  const [submittingIntervention, setSubmittingIntervention] = useState(false);

  const openInterventions = interventions.filter((i) => i.status === "open");

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingIntervention(true);
    try {
      const res = await createIntervention({
        participantId: participant.id,
        courseId: courseId || undefined,
        reason: reason as any,
        interventionType: interventionType as any,
        notes,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Intervention alert recorded successfully!");
        setIsTriggering(false);
        setNotes("");
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create intervention alert");
    } finally {
      setSubmittingIntervention(false);
    }
  };

  const handleResolve = async (interventionId: string) => {
    try {
      const res = await resolveIntervention(interventionId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Intervention resolved!");
        window.location.reload();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve intervention");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link href="/learner-360" className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Learner Intelligence Hub
        </Link>
        <div className="flex items-center gap-2">
          {openInterventions.length > 0 ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
              <AlertTriangle className="h-3.5 w-3.5" /> At-Risk ({openInterventions.length} Alerts)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" /> High Engagement / On Track
            </span>
          )}
        </div>
      </div>

      {/* Hero 360 Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-md">
              {participant.full_name?.charAt(0) || "L"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  IC: {participant.ic_number || "N/A"}
                </span>
                <span className="text-xs text-indigo-600 font-semibold">
                  ID: {participant.id.slice(0, 8)}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{participant.full_name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                {participant.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-gray-400" /> {participant.email}
                  </span>
                )}
                {participant.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-gray-400" /> {participant.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  {participant.nadi_sites?.site_name || "NADI Site"} ({participant.states?.state_name || "State"})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTriggering(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition"
            >
              <ShieldAlert className="h-4 w-4 text-red-600" />
              Flag Intervention Alert
            </button>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 text-xs">
          <div>
            <span className="text-gray-400 block">Enrolled Courses</span>
            <span className="text-xl font-bold text-gray-900 mt-0.5 block">{enrolments.length}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Verified Skills</span>
            <span className="text-xl font-bold text-indigo-600 mt-0.5 block">
              {skillsData.skills.length}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block">Credentials Issued</span>
            <span className="text-xl font-bold text-emerald-600 mt-0.5 block">
              {credentials.length}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block">Open Interventions</span>
            <span className={`text-xl font-bold mt-0.5 block ${openInterventions.length > 0 ? "text-red-600" : "text-gray-400"}`}>
              {openInterventions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("courses")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "courses"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <BookOpen className="h-4 w-4" /> Course Progression ({enrolments.length})
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "skills"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Sparkles className="h-4 w-4" /> Skills & Competencies ({skillsData.skills.length})
          </button>
          <button
            onClick={() => setActiveTab("credentials")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "credentials"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Award className="h-4 w-4" /> Accreditations & Badges ({credentials.length})
          </button>
          <button
            onClick={() => setActiveTab("interventions")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "interventions"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <AlertTriangle className="h-4 w-4" /> Retention & Interventions ({interventions.length})
          </button>
        </nav>
      </div>

      {/* TAB 1: COURSES */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          {enrolments.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-400 text-sm">
              Participant is not yet enrolled in any courses.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolments.map((enr) => (
                <div key={enr.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span className="font-mono text-indigo-600 font-bold">{enr.courses?.course_code}</span>
                    <span className="capitalize">{enr.status}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{enr.courses?.title}</h3>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Curriculum Progress</span>
                      <span className="font-bold text-indigo-600">{enr.progress_pct || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${enr.progress_pct || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SKILLS */}
      {activeTab === "skills" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillsData.skills.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-gray-900 text-sm">{s.skills?.name}</p>
                <span className="text-gray-400 font-mono text-[10px]">{s.skills?.skill_code}</span>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded capitalize">
                {s.achieved_level}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: CREDENTIALS */}
      {activeTab === "credentials" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {credentials.map((issuance) => (
            <div key={issuance.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono font-bold text-indigo-600">{issuance.credential_id_code}</span>
                <span className="capitalize text-emerald-600 font-semibold">{issuance.status}</span>
              </div>
              <h4 className="font-bold text-gray-900">{issuance.credentials?.name}</h4>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400">Awarded: {new Date(issuance.issue_date).toLocaleDateString()}</span>
                <Link
                  href={`/verify/${issuance.credential_id_code}`}
                  target="_blank"
                  className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  Verify <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: RETENTION & INTERVENTIONS */}
      {activeTab === "interventions" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm">Proactive Intervention History</h3>
              <button
                onClick={() => setIsTriggering(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="h-3.5 w-3.5" /> New Alert
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {interventions.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No risk alerts or interventions recorded for this learner.
                </div>
              ) : (
                interventions.map((inv) => (
                  <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            inv.status === "open" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {inv.status}
                        </span>
                        <span className="font-semibold text-gray-900 text-sm capitalize">
                          {inv.reason?.replace("_", " ")} ({inv.intervention_type})
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{inv.notes}</p>
                      <span className="text-[10px] text-gray-400 block mt-1">
                        Triggered on {new Date(inv.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {inv.status === "open" && (
                      <button
                        onClick={() => handleResolve(inv.id)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition shrink-0"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trigger Modal */}
      {isTriggering && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Flag Proactive Learner Intervention
            </h3>
            <p className="text-xs text-gray-500">
              Record a learning intervention to schedule a coaching session or follow-up.
            </p>

            <form onSubmit={handleCreateIntervention} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Trigger Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="low_progress">Low Curriculum Progress (&lt;25%)</option>
                  <option value="low_attendance">Low Attendance Rate</option>
                  <option value="failing_quiz">Multiple Failed Quiz Attempts</option>
                  <option value="inactive">Prolonged Inactivity</option>
                  <option value="trainer_flag">Trainer Observation Flag</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Intervention Action Type
                </label>
                <select
                  value={interventionType}
                  onChange={(e) => setInterventionType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="reminder">Automated Follow-up Reminder</option>
                  <option value="tutor_call">Tutor / Trainer Check-in Call</option>
                  <option value="counseling">Academic Counseling Session</option>
                  <option value="deadline_extension">Course Deadline Extension</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Intervention Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the specific circumstance, observed difficulty, and action plan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsTriggering(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingIntervention}
                  className="px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {submittingIntervention ? "Saving..." : "Record Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
