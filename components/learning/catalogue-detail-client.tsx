"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { enrollParticipantInCourse } from "@/app/actions/courses";

interface CatalogueDetailClientProps {
  course: any;
  participantId?: string;
  isEnrolled: boolean;
}

export default function CatalogueDetailClient({ course, participantId, isEnrolled }: CatalogueDetailClientProps) {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    if (!participantId) {
      setError("You must be logged in as a learner to enroll in courses.");
      return;
    }

    setIsEnrolling(true);
    setError(null);

    try {
      const res = await enrollParticipantInCourse(course.id, participantId);
      if (res.error) {
        setError(res.error);
      } else {
        router.push(`/learner-workspace/courses/${course.id}`);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during enrollment.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const modules = course.course_modules || [];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Back link */}
      <div>
        <Link href="/learner-workspace/catalogue" className="text-indigo-600 hover:underline text-sm font-semibold">
          &larr; Back to Catalogue
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 3.8l7.2 14.2H4.8L12 5.8z"/></svg>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider">
                {course.course_code}
              </span>
              <span className="px-3 py-1 bg-indigo-500/80 backdrop-blur-sm rounded-full text-xs font-bold tracking-wider">
                {course.category}
              </span>
              <span className="px-3 py-1 bg-emerald-500/80 backdrop-blur-sm rounded-full text-xs font-bold tracking-wider">
                {course.level}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              {course.title}
            </h1>
            
            <p className="text-slate-300 text-lg max-w-2xl leading-relaxed mb-8">
              {course.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏱</span>
                <span>{course.learning_hours} Learning Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <span>{course.min_pass_score}% Pass Mark</span>
              </div>
              {course.trainers?.name && (
                <div className="flex items-center gap-2">
                  <span className="text-xl">👨‍🏫</span>
                  <span>Led by {course.trainers.name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full md:w-80 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shrink-0">
            {isEnrolled ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-white mb-2">You are enrolled!</h3>
                <p className="text-slate-300 text-sm mb-6">You already have access to this course.</p>
                <Link 
                  href={`/learner-workspace/courses/${course.id}`}
                  className="block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition text-center"
                >
                  Go to Course Player
                </Link>
              </div>
            ) : (
              <div>
                <div className="text-3xl font-extrabold text-white mb-6 text-center">
                  Free
                </div>
                <button 
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition flex items-center justify-center gap-2 ${
                    isEnrolling 
                      ? 'bg-slate-600 text-slate-300 cursor-not-allowed' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-white hover:scale-[1.02]'
                  }`}
                >
                  {isEnrolling ? (
                    <>
                      <span className="animate-spin text-xl">↻</span> Enrolling...
                    </>
                  ) : (
                    <>Start Learning Now &rarr;</>
                  )}
                </button>
                <p className="text-center text-slate-400 text-xs mt-4">
                  Full lifetime access to course materials.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Outline */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Curriculum</h2>
        
        {modules.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
            The curriculum is currently being prepared for this course.
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((mod: any, idx: number) => (
              <div key={mod.id} className="border border-gray-200 rounded-xl overflow-hidden transition hover:border-indigo-200">
                <div className="bg-gray-50 p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Module {idx + 1}: {mod.title}
                    </h3>
                    {mod.description && (
                      <p className="text-sm text-gray-500 mt-1">{mod.description}</p>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full whitespace-nowrap self-start md:self-auto">
                    {mod.course_lessons?.length || 0} Lessons
                  </div>
                </div>
                
                {mod.course_lessons && mod.course_lessons.length > 0 && (
                  <div className="border-t border-gray-200 bg-white p-4">
                    <ul className="space-y-3">
                      {mod.course_lessons.map((lesson: any, lessonIdx: number) => (
                        <li key={lesson.id} className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded-lg transition">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                              {lessonIdx + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-700">{lesson.title}</span>
                          </div>
                          <span className="text-xs text-gray-400 shrink-0">
                            {lesson.duration_min} min
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Practical Assessment preview if any */}
      {course.practical_assessments && course.practical_assessments.length > 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 bg-sky-500 text-white rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-sm">
              🛠️
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-sky-900">Capstone Project Included</h2>
                <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs font-bold rounded">Required for completion</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{course.practical_assessments[0].title}</h3>
              <p className="text-sm text-sky-800 leading-relaxed max-w-3xl">
                This course includes a hands-on capstone project to apply what you've learned. You will submit your work for evaluation by the trainers upon completing all modules.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
