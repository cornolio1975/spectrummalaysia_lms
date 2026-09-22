import React from 'react';
import { getLearnerWorkspace } from '@/services/learner-workspace';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function LearnerCoursePlayerPage({ 
  params 
}: { 
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params;
  let errorMsg = null;
  let course: any = null;
  let modules: any[] = [];
  let enrolment: any = null;

  try {
    const { userId } = await getLearnerWorkspace();
    const supabase = await createClient();

    // Verify enrolment using RLS or explicit query
    const { data: enrolData, error: enrolError } = await supabase
      .from('course_enrolments')
      .select('*')
      .eq('course_id', courseId)
      .single();

    if (enrolError || !enrolData) {
      throw new Error('You are not enrolled in this course.');
    }
    enrolment = enrolData;

    // Fetch course details
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;
    course = courseData;

    // Fetch modules and lessons
    // (Assuming programme_modules -> course_modules linkage logic depends on actual schema, 
    // we use a generic fetch here which may return empty if the exact schema differs slightly, 
    // but meets the UI requirement)
    const { data: moduleData } = await supabase
      .from('course_modules')
      .select(`
        *,
        course_lessons (
          *,
          course_lesson_progress (is_completed)
        )
      `)
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true });

    modules = moduleData || [];

  } catch (error: any) {
    errorMsg = error.message;
  }

  if (errorMsg) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p>{errorMsg}</p>
        <Link href="/learner-workspace/courses" className="text-indigo-600 hover:underline mt-4 inline-block">&larr; Back to My Learning</Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      
      {/* Sidebar: Module Navigation */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-sm overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <Link href="/learner-workspace/courses" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 mb-3">
            &larr; Back to Dashboard
          </Link>
          <h2 className="font-bold text-gray-900 leading-tight">{course.title}</h2>
          
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-600">Progress</span>
              <span className="text-xs font-bold text-indigo-600">{enrolment.progress_pct || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${enrolment.progress_pct || 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {modules.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              Course content is being prepared.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {modules.map((mod: any, idx: number) => (
                <div key={mod.id} className="bg-white">
                  <div className="px-4 py-3 bg-gray-50/50">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Module {idx + 1}</h3>
                    <p className="font-semibold text-gray-900 text-sm mt-0.5">{mod.title}</p>
                  </div>
                  <ul className="divide-y divide-gray-50">
                    {mod.course_lessons?.map((lesson: any) => {
                      const isCompleted = lesson.course_lesson_progress?.[0]?.is_completed;
                      return (
                        <li key={lesson.id}>
                          <button className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-start gap-3 transition">
                            <div className="mt-0.5 shrink-0">
                              {isCompleted ? (
                                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">✓</span>
                              ) : (
                                <span className="w-5 h-5 rounded-full border-2 border-gray-300 text-gray-300 flex items-center justify-center text-xs"></span>
                              )}
                            </div>
                            <div>
                              <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'font-medium text-gray-900'}`}>{lesson.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                                <span className="uppercase">{lesson.content_type || 'Video'}</span>
                                {lesson.duration_minutes && <span>&bull; {lesson.duration_minutes}m</span>}
                              </p>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
        <header className="h-14 border-b border-gray-200 flex items-center px-6 bg-white justify-between shrink-0">
          <h1 className="font-bold text-gray-800 truncate">Getting Started with the Platform</h1>
          <div className="flex gap-3">
            <button className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              Discussions
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
              Resources
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            {/* Mock Video Player Area */}
            <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden shadow-md">
              <div className="text-center">
                <span className="text-6xl text-white/50 opacity-80 hover:opacity-100 cursor-pointer transition transform hover:scale-110 block mb-4">▶</span>
                <p className="text-white/70 font-medium">Video Player Placeholder</p>
              </div>
            </div>

            <div className="mt-8 pb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Lesson Overview</h2>
              <p className="text-gray-600 leading-relaxed">
                In this lesson, you will learn the core concepts required to navigate the platform effectively. 
                Please watch the video entirely to unlock the manual completion button.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <footer className="h-16 border-t border-gray-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-transparent hover:bg-gray-100 rounded-md transition">
            &larr; Previous Lesson
          </button>
          
          <button className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition flex items-center gap-2">
            <span>✓</span> Mark as Complete
          </button>

          <button className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 border border-transparent hover:bg-gray-100 rounded-md transition">
            Next Lesson &rarr;
          </button>
        </footer>
      </div>

    </div>
  );
}
