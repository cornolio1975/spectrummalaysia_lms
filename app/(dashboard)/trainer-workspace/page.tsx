import React from 'react';
import { getTrainerWorkspace, getTrainerCourses } from '@/services/trainer-workspace';
import Link from 'next/link';

export default async function TrainerDashboardPage() {
  let workspaceInfo;
  let courses = [];
  let errorMsg = null;

  try {
    workspaceInfo = await getTrainerWorkspace();
    courses = await getTrainerCourses();
  } catch (error: any) {
    errorMsg = error.message;
  }

  if (errorMsg) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p>{errorMsg}</p>
      </div>
    );
  }

  const publishedCourses = courses.filter(c => c.status === 'published').length;
  const draftCourses = courses.filter(c => c.status === 'draft').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trainer Workspace</h1>
          <p className="text-gray-500 mt-2">Manage your exclusive courses, modules, and learning materials.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/trainer-workspace/courses/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
            Create Course
          </Link>
          <Link href="/trainer-workspace/storage" className="px-4 py-2 bg-gray-100 text-gray-800 border rounded-md hover:bg-gray-200 font-medium">
            Manage Files
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Courses</h3>
          <p className="text-3xl font-bold mt-2">{courses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Published</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{publishedCourses}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Drafts</h3>
          <p className="text-3xl font-bold mt-2 text-amber-600">{draftCourses}</p>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">My Recent Courses</h2>
          <Link href="/trainer-workspace/courses" className="text-blue-600 hover:underline">View All</Link>
        </div>
        
        {courses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first course.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course: any) => (
              <Link key={course.id} href={`/trainer-workspace/courses/${course.id}`} className="block group">
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-200 w-full relative">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.programme_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded text-xs font-semibold uppercase">
                      {course.status}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 line-clamp-1">{course.programme_name}</h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description || 'No description provided.'}</p>
                    <div className="mt-4 text-xs text-gray-400 flex justify-between">
                      <span>Updated: {new Date(course.updated_at).toLocaleDateString()}</span>
                      <span>{course.review_status}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
