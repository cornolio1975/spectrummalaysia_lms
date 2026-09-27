"use client";

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Shield, Users, BookOpen, Settings } from 'lucide-react';

export default function CommercialSidebar({ userRole }: { userRole: string }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (menu: string) => {
    setExpanded(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isPrivileged = ['admin', 'superadmin', 'security_compliance'].includes(userRole);

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8 font-bold text-xl">Spectrum LMS Pro</div>
      
      <nav className="flex-1 space-y-2">
        {/* DASHBOARD */}
        <div>
          <button className="flex items-center justify-between w-full p-2 rounded hover:bg-slate-800" onClick={() => toggle('dashboard')}>
            <span className="flex items-center"><Shield className="w-4 h-4 mr-2" /> Dashboard</span>
            {expanded.dashboard ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {expanded.dashboard && (
            <div className="pl-8 flex flex-col space-y-1 mt-1 text-sm text-slate-300">
              <Link href="/dashboard" className="hover:text-white">Overview</Link>
              <Link href="/dashboard/tasks" className="hover:text-white">My Tasks</Link>
            </div>
          )}
        </div>

        {/* LEARNING */}
        <div>
          <button className="flex items-center justify-between w-full p-2 rounded hover:bg-slate-800" onClick={() => toggle('learning')}>
            <span className="flex items-center"><BookOpen className="w-4 h-4 mr-2" /> Learning</span>
            {expanded.learning ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {expanded.learning && (
            <div className="pl-8 flex flex-col space-y-1 mt-1 text-sm text-slate-300">
              <Link href="/courses" className="hover:text-white">Course Catalogue</Link>
              <Link href="/enrolments" className="hover:text-white">My Enrolments</Link>
            </div>
          )}
        </div>

        {/* ADMIN (Only privileged) */}
        {isPrivileged && (
          <div>
            <button className="flex items-center justify-between w-full p-2 rounded hover:bg-slate-800" onClick={() => toggle('admin')}>
              <span className="flex items-center"><Users className="w-4 h-4 mr-2" /> Admin & NADI</span>
              {expanded.admin ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expanded.admin && (
              <div className="pl-8 flex flex-col space-y-1 mt-1 text-sm text-slate-300">
                <Link href="/admin/organisations" className="hover:text-white">Organisations</Link>
                <Link href="/admin/users" className="hover:text-white">People Management</Link>
                <Link href="/admin/security" className="hover:text-white">Security Command</Link>
              </div>
            )}
          </div>
        )}
      </nav>
      
      <div className="mt-auto border-t border-slate-700 pt-4">
        <Link href="/settings/privacy" className="flex items-center p-2 text-sm text-slate-300 hover:text-white">
          <Settings className="w-4 h-4 mr-2" /> Cookie & Privacy Settings
        </Link>
      </div>
    </aside>
  );
}
