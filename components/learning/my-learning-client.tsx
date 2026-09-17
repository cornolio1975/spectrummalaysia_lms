"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Award, 
  ArrowRight, 
  FileCheck2, 
  PlayCircle,
  TrendingUp,
  Sparkles
} from "lucide-react";

interface Props {
  enrolments: any[];
  submissions: any[];
  credentialsEarned: any[];
  availableCredentials: any[];
}

export function MyLearningClient({
  enrolments,
  submissions,
  credentialsEarned,
  availableCredentials,
}: Props) {
  const [activeTab, setActiveTab] = useState<"in_progress" | "completed" | "assessments" | "pathways">("in_progress");

  const inProgressEnrolments = enrolments.filter((e) => e.status !== "completed");
  const completedEnrolments = enrolments.filter((e) => e.status === "completed");

  return (
    <div className="space-y-6">
      {/* Hero Welcome */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Learner Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
              My Learning Journey & Progress
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track course completions, practical competency submissions, and pathway credentials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/catalogue"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm transition"
            >
              <BookOpen className="h-4 w-4" />
              Explore Catalogue
            </Link>
          </div>
        </div>

        {/* 4 Core KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-xs text-gray-500 block">Courses In Progress</span>
            <span className="text-2xl font-bold text-indigo-600 mt-1 block">
              {inProgressEnrolments.length}
            </span>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-xs text-gray-500 block">Courses Completed</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">
              {completedEnrolments.length}
            </span>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-xs text-gray-500 block">Assessments Passed</span>
            <span className="text-2xl font-bold text-purple-600 mt-1 block">
              {submissions.filter((s) => s.status === "passed").length}
            </span>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-xs text-gray-500 block">Credentials Earned</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">
              {credentialsEarned.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("in_progress")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
              activeTab === "in_progress"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <PlayCircle className="h-4 w-4" /> In Progress ({inProgressEnrolments.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
              activeTab === "completed"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <CheckCircle className="h-4 w-4" /> Completed Courses ({completedEnrolments.length})
          </button>
          <button
            onClick={() => setActiveTab("assessments")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
              activeTab === "assessments"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileCheck2 className="h-4 w-4" /> Practical Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab("pathways")}
            className={`pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
              activeTab === "pathways"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Next Micro-Credentials ({availableCredentials.length})
          </button>
        </nav>
      </div>

      {/* TAB 1: IN PROGRESS */}
      {activeTab === "in_progress" && (
        <div className="space-y-4">
          {inProgressEnrolments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No Active Courses in Progress</p>
              <p className="text-xs text-gray-400 mt-1">Enroll in a course from the catalogue to begin learning.</p>
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
              >
                Browse Training Catalogue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressEnrolments.map((enr) => {
                const course = enr.courses;
                const progressPct = enr.progress_pct || 0;
                return (
                  <div
                    key={enr.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span className="font-mono text-indigo-600 font-bold">{course?.course_code}</span>
                        <span className="capitalize text-gray-600">{course?.level}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base">{course?.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{course?.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-gray-600">Curriculum Progress</span>
                        <span className="font-bold text-indigo-600">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-4">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <Link
                        href={`/courses/${course?.id}/learn`}
                        className="w-full inline-flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition"
                      >
                        <PlayCircle className="h-4 w-4" /> Continue Learning
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMPLETED */}
      {activeTab === "completed" && (
        <div className="space-y-4">
          {completedEnrolments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              <CheckCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700">No Completed Courses Yet</p>
              <p className="text-xs text-gray-400 mt-1">Keep completing lessons and modules to finish your courses.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedEnrolments.map((enr) => (
                <div
                  key={enr.id}
                  className="bg-white rounded-xl border border-emerald-200 p-5 shadow-xs flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      {enr.courses?.course_code}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base mt-1">{enr.courses?.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Completed on: {new Date(enr.completed_at || enr.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <CheckCircle className="h-4 w-4" /> 100% Passed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ASSESSMENTS */}
      {activeTab === "assessments" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 text-sm">Practical Assessment Rubric Scores</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 text-xs">
                <tr>
                  <th className="px-6 py-3">Task Title</th>
                  <th className="px-6 py-3">Submitted Date</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Result</th>
                  <th className="px-6 py-3">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No practical assessment submissions found.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50/75">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {sub.practical_assessments?.title || "Practical Assessment"}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600">
                        {sub.score_pct != null ? `${sub.score_pct}%` : "Pending Grading"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${
                            sub.status === "passed"
                              ? "bg-emerald-100 text-emerald-800"
                              : sub.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate">
                        {sub.feedback || "Awaiting assessor review"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: WHAT I CAN EARN NEXT */}
      {activeTab === "pathways" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCredentials.map((cred) => (
            <div
              key={cred.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {cred.credential_code}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    {cred.credential_type.replace("_", " ")}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base">{cred.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-3 mt-1.5">{cred.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">
                  {cred.learning_hours} learning hours
                </span>
                <Link
                  href={`/credentials/${cred.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  View Requirements <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
