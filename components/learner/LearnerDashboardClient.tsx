"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Play,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Video,
  FileText,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Flame,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Send,
  MessageSquare
} from "lucide-react";

interface Props {
  userProfile: { full_name?: string; avatar_url?: string } | null;
  enrolments: any[];
  upcomingSessions: any[];
  assessments: any[];
  assignments: any[];
  achievements: { certificates: number; badges: number };
}

type DashboardTab = "overview" | "courses" | "sessions" | "assignments" | "credentials" | "ai_tutor";

export function LearnerDashboardClient({
  userProfile,
  enrolments = [],
  upcomingSessions = [],
  assessments = [],
  assignments = [],
  achievements = { certificates: 0, badges: 0 }
}: Props) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiConversation, setAiConversation] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: `Hello ${userProfile?.full_name?.split(" ")[0] || "there"}! I'm your Spectrum AI Study Coach. How can I help you with your courses today? You can ask me to explain a concept, quiz you on a module, or summarize key takeaways!`
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const activeEnrolments = enrolments.filter(e => e.status !== "completed");
  const completedEnrolments = enrolments.filter(e => e.status === "completed" || (e.progress_pct || 0) >= 100);
  const lastActiveCourse = activeEnrolments.length > 0 ? activeEnrolments[0] : null;

  // Average progress across all active enrolments
  const overallProgress = enrolments.length > 0
    ? Math.round(enrolments.reduce((acc, curr) => acc + (curr.progress_pct || 0), 0) / enrolments.length)
    : 0;

  const handleSendAiPrompt = () => {
    if (!aiPrompt.trim()) return;
    const userText = aiPrompt.trim();
    setAiConversation(prev => [...prev, { sender: "user", text: userText }]);
    setAiPrompt("");
    setIsAiLoading(true);

    setTimeout(() => {
      let reply = "That's a fantastic question! In this module, the fundamental principle focuses on identifying target stakeholder needs through iterative feedback loops. Would you like me to generate a 3-question mini-quiz to test your mastery?";
      if (userText.toLowerCase().includes("quiz") || userText.toLowerCase().includes("test")) {
        reply = "Here is Question 1: What is the primary purpose of a Value Proposition Canvas? A) Budgeting, B) Mapping customer profile to product features, C) Regulatory compliance. What is your choice?";
      } else if (userText.toLowerCase().includes("summar")) {
        reply = "Summary of Key Points:\n1. Customer Validation: Verify real demand before scaling.\n2. Iterative Milestones: Track progress with micro-assessments.\n3. Digital Tools: Leverage NADI center infrastructure for live collaboration.";
      }
      setAiConversation(prev => [...prev, { sender: "ai", text: reply }]);
      setIsAiLoading(false);
    }, 800);
  };

  const getFirstName = () => {
    if (!userProfile?.full_name) return "Learner";
    return userProfile.full_name.trim().split(" ")[0];
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Executive Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-800/40">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 -mb-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-400 p-0.5 shadow-lg">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl font-black text-white">
                  {userProfile?.full_name?.charAt(0) || "L"}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  🇲🇾 Malaysian National Programme
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 5-Day Streak
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mt-2 text-white">
                Selamat Datang, {getFirstName()}!
              </h1>
              <p className="text-indigo-200/90 text-sm sm:text-base mt-1 max-w-xl">
                You're making steady headway toward your accredited micro-credentials. Ready for today's session?
              </p>
            </div>
          </div>

          {/* Overall Progress Indicator */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/15 flex items-center gap-5 shrink-0">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${overallProgress}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-black text-sm text-white">{overallProgress}%</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-indigo-200 uppercase tracking-wider">Programme Completion</span>
              <span className="block text-lg font-bold text-white mt-0.5">
                {completedEnrolments.length} of {enrolments.length} Courses
              </span>
              <span className="block text-xs text-emerald-400 font-medium mt-0.5">On Schedule &bull; Active Cohort</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-200 transition">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>In-Progress</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{activeEnrolments.length}</span>
            <span className="text-xs font-semibold text-indigo-600">Active</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Modules currently open</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-200 transition">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-800">{completedEnrolments.length}</span>
            <span className="text-xs font-semibold text-emerald-600">Passed</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Course requirements met</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-200 transition">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 uppercase tracking-wider">
            <span>Credentials</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-800">{achievements.certificates + achievements.badges}</span>
            <span className="text-xs font-semibold text-amber-600">Issued</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{achievements.certificates} Certs &bull; {achievements.badges} Badges</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-200 transition">
          <div className="flex items-center justify-between text-xs font-bold text-blue-700 uppercase tracking-wider">
            <span>Attendance</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-800">92%</span>
            <span className="text-xs font-semibold text-blue-600">Verified</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">NADI live sessions</p>
        </div>
      </div>

      {/* Interactive Tabs Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 px-4 pt-3 bg-slate-50/60 flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <span>🌟 Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "courses"
                ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <span>📚 My Enrolled Courses</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-200/70 text-slate-700">
              {enrolments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "sessions"
                ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <span>📅 Live Classes & NADI</span>
            {upcomingSessions.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800">
                {upcomingSessions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "assignments"
                ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <span>📝 Tasks & Quizzes</span>
          </button>

          <button
            onClick={() => setActiveTab("credentials")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "credentials"
                ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <span>🎖 Wallet & Certificates</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">
              {achievements.certificates + achievements.badges}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ai_tutor")}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === "ai_tutor"
                ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-2xs"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Study Coach</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="p-6 space-y-8">
            {/* Continue Learning Hero Card */}
            {lastActiveCourse ? (
              <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50/30 rounded-2xl border border-indigo-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-100 text-indigo-700">
                      {lastActiveCourse.courses?.course_code || "IN PROGRESS"}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Ready to Resume
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {lastActiveCourse.courses?.title || "Active Course Module"}
                  </h3>
                  <p className="text-sm text-slate-600 max-w-xl">
                    Pick up right where you left off. Continue the interactive lesson and submit your module checkpoint.
                  </p>

                  <div className="pt-2 max-w-md">
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Module Progress</span>
                      <span className="text-indigo-600">{lastActiveCourse.progress_pct || 0}% Completed</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${lastActiveCourse.progress_pct || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col gap-2">
                  <Link
                    href={`/learner-workspace/courses/${lastActiveCourse.course_id}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 shadow-md transition"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Resume Learning
                  </Link>
                  <Link
                    href={`/learner-workspace/courses`}
                    className="text-xs font-semibold text-slate-500 text-center hover:text-indigo-600 transition"
                  >
                    View Course Syllabus &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-800">You are not currently enrolled in any active course</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Browse our Malaysian national curriculum catalogue to discover digital and entrepreneurship programmes.
                </p>
                <Link
                  href="/learner-workspace/catalogue"
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition"
                >
                  Explore Course Catalogue
                </Link>
              </div>
            )}

            {/* Two-Column Grid: Active Courses & Upcoming Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: Active Courses */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    My Current Courses
                  </h3>
                  <button
                    onClick={() => setActiveTab("courses")}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    View All ({enrolments.length})
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {enrolments.slice(0, 4).map((enrol) => (
                    <div
                      key={enrol.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-300 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {enrol.courses?.course_code || "CRS"}
                          </span>
                          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full capitalize">
                            {enrol.status?.replace("_", " ")}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 mt-2.5 line-clamp-2 text-sm leading-snug">
                          {enrol.courses?.title || "Enrolled Course Title"}
                        </h4>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
                          <span>Progress</span>
                          <span className="font-bold text-indigo-600">{enrol.progress_pct || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{ width: `${enrol.progress_pct || 0}%` }}
                          />
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Link
                            href={`/learner-workspace/courses/${enrol.course_id}`}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            Open Course <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Col: Live Sessions & Schedule */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Upcoming Live Sessions
                  </h3>
                  <button
                    onClick={() => setActiveTab("sessions")}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Calendar &rarr;
                  </button>
                </div>

                <div className="bg-slate-50/75 rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Live Tomorrow
                      </span>
                      <span className="text-xs font-medium text-slate-500">2:00 PM - 4:00 PM</span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm">Interactive Workshop: Micro-Enterprise Scaling</h5>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-indigo-500" /> Live Stream via NADI Community Lab
                    </p>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); alert("Live class link will be active 15 minutes before session time."); }}
                      className="block text-center w-full py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-lg transition mt-2"
                    >
                      Join Room & Register Attendance
                    </a>
                  </div>

                  <div className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        Friday, Oct 20
                      </span>
                      <span className="text-xs font-medium text-slate-500">10:00 AM</span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm">Q&A Mentor Clinic: Practical Assessment Review</h5>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-emerald-500" /> Online Webinar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Enrolled Courses */}
        {activeTab === "courses" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">All Enrolled Courses</h3>
                <p className="text-xs text-slate-500 mt-0.5">Explore your programme syllabus, modules, and completion certificates.</p>
              </div>
              <Link
                href="/learner-workspace/catalogue"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                + Browse More Courses
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrolments.map((enrol) => (
                <div
                  key={enrol.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {enrol.courses?.course_code || "CRS"}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        enrol.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-indigo-50 text-indigo-700"
                      }`}>
                        {enrol.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-base mt-3 leading-snug">
                      {enrol.courses?.title || "Course Title"}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {enrol.courses?.description || "Curated digital learning curriculum for Malaysian participants."}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Progress</span>
                        <span className="text-indigo-600">{enrol.progress_pct || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            (enrol.progress_pct || 0) >= 100 ? "bg-emerald-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${enrol.progress_pct || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Enrolled: {enrol.enrolled_at ? new Date(enrol.enrolled_at).toLocaleDateString() : "Active"}
                    </span>
                    <Link
                      href={`/learner-workspace/courses/${enrol.course_id}`}
                      className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition"
                    >
                      {enrol.status === "completed" ? "Review Content" : "Continue Lesson"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Live Classes & Sessions */}
        {activeTab === "sessions" && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Live Classes & NADI Centre Attendance</h3>
                <p className="text-xs text-slate-500 mt-0.5">Check schedule for online classes and community center workshops.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col items-center justify-center text-indigo-700 font-bold shrink-0">
                    <span className="text-[10px] uppercase">OCT</span>
                    <span className="text-lg leading-tight">16</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Scheduled Live
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base mt-1">E-Commerce & Digital Payments Onboarding</h4>
                    <p className="text-xs text-slate-500 mt-0.5">2:00 PM - 4:00 PM &bull; Trainer: Dr. Hazman &bull; NADI Hub Sync</p>
                  </div>
                </div>

                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert("Class link active 15 mins before time."); }}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition"
                >
                  Join Live Stream
                </a>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-700 font-bold shrink-0">
                    <span className="text-[10px] uppercase">OCT</span>
                    <span className="text-lg leading-tight">22</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      Upcoming Workshop
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base mt-1">NADI Centre Practical Lab: Hands-on Point of Sale</h4>
                    <p className="text-xs text-slate-500 mt-0.5">10:00 AM - 1:00 PM &bull; Local NADI Centre Physical Session</p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                  Registered Attendance
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Tasks & Assignments */}
        {activeTab === "assignments" && (
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900">Assignments & Practical Assessments</h3>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden">
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Business Model Canvas Draft Submission</h5>
                    <p className="text-xs text-slate-500 mt-0.5">Course: Entrepreneurship Foundations &bull; Due: Oct 20, 11:59 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                    Pending Submission
                  </span>
                  <Link
                    href="/learner-workspace/assignments"
                    className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                  >
                    Submit Work
                  </Link>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">Module 1 Knowledge Check Quiz</h5>
                    <p className="text-xs text-slate-500 mt-0.5">Course: Digital Marketing Literacy &bull; Score: 95%</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Graded: Passed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Wallet & Certificates */}
        {activeTab === "credentials" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Digital Wallet & Verifiable Micro-Credentials</h3>
                <p className="text-xs text-slate-500 mt-0.5">Accredited certifications linked to your Malaysian IC.</p>
              </div>
              <Link
                href="/wallet"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Full Digital Wallet
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 rounded-2xl border border-amber-200/80 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-2xl">🎓</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Micro-Credential
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-lg mt-3">Certificate of Digital Competency</h4>
                  <p className="text-xs text-slate-500 mt-1">Spectrum Malaysia Programme in partnership with MDEC & NADI Centers</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">ID: SPX-2026-9812</span>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert("Downloading official credential certificate PDF..."); }}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Download Certificate (PDF)
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500/10 via-white to-indigo-500/5 rounded-2xl border border-indigo-200/80 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-2xl">🎖</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      Earned Badge
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-lg mt-3">E-Commerce Trailblazer Badge</h4>
                  <p className="text-xs text-slate-500 mt-1">Awarded for 100% module completion & live assessment excellence.</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">Level 2 Specialist</span>
                  <button
                    onClick={() => alert("Badge added to your public digital wallet profile!")}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Share to LinkedIn
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: AI Study Coach */}
        {activeTab === "ai_tutor" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Spectrum AI Study Assistant</h4>
                  <p className="text-xs text-slate-500">24/7 personalized tutor for your modules & syllabus</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Online &bull; Context Aware
              </span>
            </div>

            <div className="h-72 overflow-y-auto space-y-3 p-3 bg-slate-50/70 rounded-xl border border-slate-200">
              {aiConversation.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white font-medium"
                        : "bg-white text-slate-800 border border-slate-200 shadow-2xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-500 border border-slate-200 rounded-xl p-3 text-xs italic">
                    AI Tutor is thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-slate-500">Suggested:</span>
              <button
                onClick={() => setAiPrompt("Can you give me a 3-question quiz on my active module?")}
                className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-full text-slate-700 transition"
              >
                📝 Quiz me on current lesson
              </button>
              <button
                onClick={() => setAiPrompt("Summarize key customer discovery principles")}
                className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-full text-slate-700 transition"
              >
                ⚡ Summarize key principles
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask your AI tutor anything about your enrolled modules..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendAiPrompt()}
                className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                onClick={handleSendAiPrompt}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Ask
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
