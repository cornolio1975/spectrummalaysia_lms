import React from 'react';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function LearnerCataloguePage() {
  let courses = [];
  let errorMsg = null;

  try {
    const supabase = await createClient();
    
    // Fetch all active courses
    const { data, error } = await supabase
      .from('courses')
      .select('*, training_categories(name)')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    courses = data || [];

  } catch (error: any) {
    errorMsg = error.message;
  }

  if (errorMsg) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error loading catalogue</h1>
        <p>{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Catalogue</h1>
          <p className="text-gray-500 mt-2">Discover new courses and pathways to expand your skills.</p>
        </div>
      </header>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-500 shadow-sm">
          No published courses found in the catalogue.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div key={course.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col transition hover:shadow-md hover:border-indigo-300">
              <div className="h-32 bg-gray-100 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-teal-600/20"></div>
                <div className="absolute top-4 left-4">
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-bold rounded-md shadow-sm uppercase tracking-wider">
                    {course.course_code}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-xs text-indigo-600 font-bold mb-2 uppercase tracking-wider">
                  {course.training_categories?.name || 'General Training'}
                </div>
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-3 flex-1">{course.description}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {course.duration_hours} Hours
                  </span>
                  <Link 
                    href={`/learner-workspace/catalogue/${course.id}`}
                    className="text-indigo-600 font-semibold text-sm hover:text-indigo-800"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
