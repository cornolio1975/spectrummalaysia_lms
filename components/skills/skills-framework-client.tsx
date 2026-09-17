"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Search, 
  CheckCircle2, 
  UserCheck, 
  Plus, 
  Award, 
  Layers, 
  ShieldCheck, 
  ChevronRight,
  Loader2
} from "lucide-react";
import { endorseLearnerSkill, getLearnerSkills } from "@/app/actions/skills";
import { toast } from "sonner";

interface Props {
  skills: any[];
  participants: any[];
}

export function SkillsFrameworkClient({ skills, participants }: Props) {
  const [activeTab, setActiveTab] = useState<"catalog" | "learner_profile">("catalog");
  const [search, setSearch] = useState("");

  // Learner profile inspection & endorsement state
  const [selectedParticipantId, setSelectedParticipantId] = useState(participants[0]?.id || "");
  const [learnerData, setLearnerData] = useState<{ skills: any[]; competencies: any[] } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Endorse Modal State
  const [isEndorsing, setIsEndorsing] = useState(false);
  const [endorseSkillId, setEndorseSkillId] = useState(skills[0]?.id || "");
  const [achievedLevel, setAchievedLevel] = useState("intermediate");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submittingEndorse, setSubmittingEndorse] = useState(false);

  const fetchProfile = async (id: string) => {
    if (!id) return;
    setLoadingProfile(true);
    try {
      const res = await getLearnerSkills(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        setLearnerData(res.data || null);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load learner skill profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSelectParticipant = (id: string) => {
    setSelectedParticipantId(id);
    fetchProfile(id);
  };

  const handleEndorseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipantId || !endorseSkillId) return;

    setSubmittingEndorse(true);
    try {
      const res = await endorseLearnerSkill({
        participantId: selectedParticipantId,
        skillId: endorseSkillId,
        achievedLevel,
        evidenceUrl: evidenceUrl || undefined,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Skill proficiency endorsed successfully!");
        setIsEndorsing(false);
        fetchProfile(selectedParticipantId);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to endorse skill");
    } finally {
      setSubmittingEndorse(false);
    }
  };

  const filteredSkills = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.skill_code?.toLowerCase().includes(search.toLowerCase()) ||
      s.skill_categories?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-indigo-600" />
            Skills & Competency Framework
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enterprise taxonomy mapping course outcomes to recognized industry skill standards and learner competency audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("learner_profile");
              if (!learnerData && selectedParticipantId) fetchProfile(selectedParticipantId);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
          >
            <UserCheck className="h-4 w-4" />
            Audit Learner Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "catalog"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Layers className="h-4 w-4" /> Framework Taxonomy ({skills.length} skills)
          </button>
          <button
            onClick={() => {
              setActiveTab("learner_profile");
              if (!learnerData && selectedParticipantId) fetchProfile(selectedParticipantId);
            }}
            className={`pb-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
              activeTab === "learner_profile"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Award className="h-4 w-4" /> Learner Competency Profile & Endorsements
          </button>
        </nav>
      </div>

      {/* TAB 1: FRAMEWORK TAXONOMY */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills, categories, or codes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <span className="text-xs text-gray-500">
              Showing {filteredSkills.length} of {skills.length} skills
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {skill.skill_code}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase">
                      {skill.skill_categories?.name || "General"}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base">{skill.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {skill.description || "Core professional skill standard."}
                  </p>

                  {/* Competencies linked */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1.5">
                      Sub-Competencies ({skill.competencies?.length || 0})
                    </span>
                    <ul className="space-y-1 text-xs text-gray-700">
                      {skill.competencies?.slice(0, 3).map((c: any) => (
                        <li key={c.id} className="flex items-center gap-1.5 truncate">
                          <ChevronRight className="h-3 w-3 text-indigo-500 shrink-0" />
                          <span className="truncate">{c.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Benchmark:</span>
                  <span className="font-semibold text-indigo-700 capitalize">
                    {skill.level_standard || "Practitioner"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LEARNER COMPETENCY PROFILE */}
      {activeTab === "learner_profile" && (
        <div className="space-y-6">
          {/* Participant Selector Bar */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-end justify-between gap-4">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Select Participant Profile to Audit
              </label>
              <select
                value={selectedParticipantId}
                onChange={(e) => handleSelectParticipant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.ic_number || p.email || p.id.slice(0, 8)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fetchProfile(selectedParticipantId)}
                disabled={loadingProfile}
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                {loadingProfile ? "Refreshing..." : "Refresh Audit"}
              </button>
              <button
                type="button"
                onClick={() => setIsEndorsing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm transition"
              >
                <Plus className="h-4 w-4" />
                Endorse Skill
              </button>
            </div>
          </div>

          {/* Profile Breakdown */}
          {loadingProfile ? (
            <div className="p-12 text-center text-gray-400">Loading skill profile audit...</div>
          ) : !learnerData ? (
            <div className="bg-white p-12 rounded-xl border border-gray-200 text-center text-gray-500">
              Select a participant and click Refresh Audit to inspect their verified competency profile.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Acquired Skills */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    Verified Skills ({learnerData.skills.length})
                  </h3>
                  <span className="text-xs text-gray-400">Validated by Trainer / Engine</span>
                </div>

                {learnerData.skills.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4">No verified skills recorded yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {learnerData.skills.map((item: any) => (
                      <div
                        key={item.id}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-gray-900">{item.skills?.name}</p>
                          <span className="text-gray-400 font-mono text-[10px]">
                            {item.skills?.skill_code} • {item.skills?.skill_categories?.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded capitalize">
                            {item.achieved_level}
                          </span>
                          <span className="block text-[10px] text-gray-400 mt-0.5">
                            {new Date(item.date_achieved).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Acquired Competencies */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                    Achieved Performance Competencies ({learnerData.competencies.length})
                  </h3>
                  <span className="text-xs text-gray-400">Practical Assessment Mastery</span>
                </div>

                {learnerData.competencies.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4">
                    No rubric competencies awarded yet.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {learnerData.competencies.map((comp: any) => (
                      <div
                        key={comp.id}
                        className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-gray-900">{comp.competencies?.title}</p>
                          <span className="text-indigo-600 font-mono text-[10px]">
                            {comp.competencies?.competency_code}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Competent
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Endorse Modal */}
          {isEndorsing && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-indigo-600" /> Endorse Skill for Learner
                </h3>
                <p className="text-xs text-gray-500">
                  Record an official trainer or institutional endorsement for this participant.
                </p>

                <form onSubmit={handleEndorseSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Select Skill *
                    </label>
                    <select
                      value={endorseSkillId}
                      onChange={(e) => setEndorseSkillId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {skills.map((s) => (
                        <option key={s.id} value={s.id}>
                          [{s.skill_code}] {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Assessed Proficiency Level
                    </label>
                    <select
                      value={achievedLevel}
                      onChange={(e) => setAchievedLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="awareness">Awareness (Basic Knowledge)</option>
                      <option value="foundation">Foundation (Assisted Application)</option>
                      <option value="intermediate">Intermediate (Autonomous Application)</option>
                      <option value="advanced">Advanced (Complex Problem Solving)</option>
                      <option value="mastery">Mastery (Subject Matter Authority)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Evidence / Portfolio URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/... or cloud storage link"
                      value={evidenceUrl}
                      onChange={(e) => setEvidenceUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsEndorsing(false)}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingEndorse}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {submittingEndorse ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Recording...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Endorse Skill
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
