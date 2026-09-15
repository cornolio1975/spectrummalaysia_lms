import React from 'react';
import { getTrainerWorkspace, verifyTrainerOwnership } from '@/services/trainer-workspace';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function TrainerCourseManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let errorMsg = null;
  let course: any = null;
  let modules: any[] = [];

  try {
    const isOwner = await verifyTrainerOwnership('programmes', id);
    if (!isOwner) {
      throw new Error('Course not found or access denied.');
    }

    const supabase = await createClient();
    
    // Fetch course details
    const { data: courseData, error: courseError } = await supabase
      .from('programmes')
      .select('*')
      .eq('id', id)
      .single();

    if (courseError) throw courseError;
    course = courseData;

    // Fetch modules and lessons
    const { data: moduleData, error: moduleError } = await supabase
      .from('programme_modules')
      .select(`
        *,
        lessons (
          *,
          lesson_contents (*)
        )
      `)
      .eq('programme_id', id)
      .order('sort_order', { ascending: true });

    if (moduleError) throw moduleError;
    modules = moduleData || [];

  } catch (error: any) {
    errorMsg = error.message;
  }

  if (errorMsg) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p>{errorMsg}</p>
        <Link href="/trainer-workspace/courses" className="text-blue-600 hover:underline mt-4 inline-block">&larr; Back to Courses</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-4">
        <Link href="/trainer-workspace/courses" className="text-sm text-gray-500 hover:text-blue-600">&larr; Back to Courses</Link>
      </div>
      
      <header className="flex justify-between items-start pb-4 border-b">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{course.programme_name}</h1>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              course.review_status === 'approved' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {course.review_status}
            </span>
          </div>
          <p className="text-gray-500 mt-2">{course.description || 'No description provided.'}</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium">
            Edit Details
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
            Submit for Review
          </button>
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Course Curriculum</h2>
          <button className="text-sm px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
            + Add Module
          </button>
        </div>

        {modules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No modules yet. Start building your course.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((mod: any) => (
              <div key={mod.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center rounded-t-lg">
                  <h3 className="text-lg font-semibold text-gray-800">{mod.title}</h3>
                  <div className="flex gap-2">
                    <button className="text-sm text-blue-600 hover:underline">+ Add Lesson</button>
                  </div>
                </div>
                <div className="p-0">
                  {mod.lessons && mod.lessons.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                      {mod.lessons.map((lesson: any) => (
                        <li key={lesson.id} className="p-4 pl-8 hover:bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-800">{lesson.title}</p>
                              <div className="flex gap-2 mt-2">
                                {lesson.lesson_contents && lesson.lesson_contents.map((content: any) => (
                                  <span key={content.id} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                    {content.title || content.content_type}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <button className="text-sm text-gray-500 hover:text-blue-600">Edit</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-400">
                      No lessons in this module.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
