'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LearnersClient({ learners, courses = [] }: { learners: any[], courses?: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  // Use the actual trainer courses for the dropdown, falling back to unique enrolled courses
  const courseList = courses.length > 0 
    ? courses.map(c => c.programme_name || c.title).filter(Boolean)
    : Array.from(new Set(learners.map(l => l.courses?.title).filter(Boolean)));
  const uniqueCourses = Array.from(new Set(courseList));

  const filteredLearners = learners.filter(learner => {
    const matchesSearch = 
      learner.participants?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      learner.participants?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = selectedCourse === 'All Courses' || learner.courses?.title === selectedCourse;
    
    // Simple status matching based on how it's formatted
    let matchesStatus = true;
    if (selectedStatus !== 'All Statuses') {
      const dbStatus = learner.status === 'at_risk' ? 'At Risk' : 
                       learner.status ? learner.status.charAt(0).toUpperCase() + learner.status.slice(1) : '';
      matchesStatus = dbStatus === selectedStatus;
    }

    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex gap-4">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Search learners by name or email..." 
            className="px-4 py-2 border rounded-md w-full"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
          />
          {isDropdownOpen && searchTerm.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredLearners.length > 0 ? (
                filteredLearners.map((learner: any) => (
                  <div 
                    key={learner.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex flex-col"
                    onClick={() => {
                      setSearchTerm(learner.participants?.full_name || '');
                      setIsDropdownOpen(false);
                    }}
                  >
                    <span className="text-sm font-medium text-gray-900">{learner.participants?.full_name || 'Unknown Learner'}</span>
                    <span className="text-xs text-gray-500">{learner.participants?.email || ''} &bull; {learner.courses?.title}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">No learners found</div>
              )}
            </div>
          )}
        </div>
        <select 
          className="px-4 py-2 border rounded-md bg-white text-gray-700" 
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="All Courses">All Courses</option>
          {uniqueCourses.map((course: any) => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
        <select 
          className="px-4 py-2 border rounded-md bg-white text-gray-700" 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="All Statuses">All Statuses</option>
          <option value="Active">Active</option>
          <option value="At Risk">At Risk</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {filteredLearners.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No learners match your current filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLearners.map((enrolment: any) => (
                <tr key={enrolment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                        {enrolment.participants?.full_name?.charAt(0) || '?'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{enrolment.participants?.full_name || 'Unknown Learner'}</div>
                        <div className="text-sm text-gray-500">{enrolment.participants?.email || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{enrolment.courses?.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      enrolment.status === 'active' ? 'bg-green-100 text-green-800' :
                      enrolment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      enrolment.status === 'at_risk' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {enrolment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">0%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/trainer-workspace/learners/${enrolment.participant_id}?courseId=${enrolment.courses?.id}`} className="text-blue-600 hover:text-blue-900">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
