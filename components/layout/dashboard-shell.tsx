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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleMenuClick = () => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen((v) => !v);
    } else {
      setSidebarCollapsed((v) => !v);
    }
  };

  return (
    <div className={sidebarCollapsed ? "layout-collapsed" : ""}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />
      <Topbar
        onMenuClick={handleMenuClick}
        userName={userName}
        userEmail={userEmail}
        userRole={userRole}
      />
      <main className="main-content fade-in">{children}</main>
    </div>
  );
}
