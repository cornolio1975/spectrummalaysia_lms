"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  userRole: string;
}

export default function DashboardShell({
  children,
  userName,
  userEmail,
  userRole,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Topbar
        onMenuClick={() => setSidebarOpen((v) => !v)}
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
      />
      <main className="main-content fade-in">{children}</main>
    </>
  );
}
