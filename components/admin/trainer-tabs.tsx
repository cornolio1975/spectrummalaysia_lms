"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TrainerTabs() {
  const pathname = usePathname();

  const tabs = [
    { label: "Dashboard", href: "/admin/trainers/dashboard" },
    { label: "Directory", href: "/admin/trainers" },
    { label: "Profiles", href: "/admin/trainers/profiles" },
    { label: "Credentials", href: "/admin/trainers/credentials" },
    { label: "Documents", href: "/admin/trainers/documents" },
    { label: "Assignments", href: "/admin/trainers/assignments" },
    { label: "Performance", href: "/admin/trainers/performance" },
    { label: "Attendance", href: "/admin/trainers/attendance" },
    { label: "Reports", href: "/admin/trainers/reports" },
    { label: "Audit Logs", href: "/admin/trainers/audit" },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-2 mb-6 shadow-sm sticky top-0 z-10">
      <div className="flex flex-wrap gap-1 max-w-[1400px] mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
