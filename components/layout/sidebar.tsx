"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavItem {
  icon: string;
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

const ADMIN_NAV_STRUCTURE: NavItem[] = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard" },
  {
    icon: "👥",
    label: "USER & ROLE MANAGEMENT",
    children: [
      { label: "All Users", href: "/admin/users" },
      { label: "Administrators", href: "/admin/users?role=admin" },
      { label: "Trainers", href: "/admin/users?role=trainer" },
      { label: "Learners", href: "/admin/users?role=learner" },
      { label: "Roles & Permissions", href: "/admin/settings" },
    ],
  },
  {
    icon: "📚",
    label: "Courses & Curriculum",
    children: [
      { label: "Course Management", href: "/courses" },
      { label: "Course Catalogue", href: "/catalogue" },
    ],
  },
  {
    icon: "🎯",
    label: "Programme Management",
    href: "/programmes",
  },
  {
    icon: "🎖",
    label: "Micro-credentials",
    children: [
      { label: "Credential Engine", href: "/credentials" },
      { label: "Digital Wallet", href: "/wallet" },
    ],
  },
  {
    icon: "📈",
    label: "Skills & Competencies",
    href: "/skills",
  },
  {
    icon: "📝",
    label: "Practical & RPL",
    children: [
      { label: "Practical Assessments", href: "/practical-assessments" },
      { label: "RPL Applications", href: "/rpl" },
    ],
  },
  {
    icon: "📍",
    label: "NADI SITE MANAGEMENT",
    children: [
      { label: "Dashboard", href: "/admin/analytics/nadi" },
      { label: "NADI Sites", href: "/nadi" },
      { label: "Participants", href: "/participants" },
      { label: "Classes & Sessions", href: "/events" },
      { label: "Analytics", href: "/admin/analytics" },
    ],
  },
  {
    icon: "👨‍🎓",
    label: "Learner Management",
    children: [
      { label: "Learner Profiles", href: "/participants" },
      { label: "Learner 360", href: "/learner-360" },
    ],
  },
  {
    icon: "👨‍🏫",
    label: "Trainer Management",
    children: [
      { label: "Dashboard", href: "/admin/trainers/dashboard" },
      { label: "Trainers Directory", href: "/admin/trainers" },
      { label: "Applications", href: "/admin/trainers/applications" },
      { label: "Assignments", href: "/admin/trainers/assignments" },
    ],
  },
  {
    icon: "📅",
    label: "Events & Sessions",
    href: "/events",
  },
  {
    icon: "🎥",
    label: "Live Training",
    children: [
      { label: "Live Classes", href: "/live-classes" },
      { label: "My Classes", href: "/my-classes" },
    ],
  },
  {
    icon: "🎓",
    label: "Certificates",
    href: "/certificates",
  },
  {
    icon: "📋",
    label: "Reports & KPIs",
    children: [
      { label: "KPI Performance", href: "/reports/kpis" },
      { label: "Live Training Analytics", href: "/reports/live-training" },
      { label: "Organisation Reporting", href: "/reports/organisation" },
      { label: "Analytics", href: "/admin/analytics" },
    ],
  },
  { icon: "🗂", label: "Media Repository", href: "/media" },
  {
    icon: "⚙",
    label: "Administration",
    children: [
      { label: "AI Provider Management", href: "/admin/ai/providers" },
      { label: "Audit Logs", href: "/admin/audit" },
      { label: "System Configuration", href: "/admin/settings" },
    ],
  },
];

const TRAINER_NAV_STRUCTURE: NavItem[] = [
  { icon: "🏠", label: "Trainer Workspace", href: "/trainer-workspace" },
  { icon: "📖", label: "My Courses", href: "/trainer-workspace/courses" },
  { icon: "🎨", label: "Content Studio", href: "/trainer-workspace/content" },
  { icon: "👥", label: "My Learners", href: "/trainer-workspace/learners" },
  { icon: "📅", label: "Classes & Sessions", href: "/trainer-workspace/sessions" },
  { icon: "📝", label: "Assessments", href: "/trainer-workspace/assessments" },
  { icon: "📋", label: "Assignments", href: "/trainer-workspace/assignments" },
  { icon: "✅", label: "Attendance", href: "/trainer-workspace/attendance" },
  { icon: "💬", label: "Communication", href: "/trainer-workspace/communication" },
  {
    icon: "📍",
    label: "NADI SITE MANAGEMENT",
    children: [
      { label: "My NADI Sites", href: "/trainer-workspace/nadi" },
      { label: "My Participants", href: "/trainer-workspace/learners" },
      { label: "Classes & Sessions", href: "/trainer-workspace/sessions" },
      { label: "Reports", href: "/trainer-workspace/reports" },
    ],
  },
  { icon: "🎓", label: "Certificates", href: "/trainer-workspace/certificates" },
  { icon: "🤖", label: "AI Assistant", href: "/trainer-workspace/ai" },
  { icon: "🔔", label: "Notifications", href: "/trainer-workspace/notifications" },
  { icon: "👤", label: "My Profile", href: "/trainer-workspace/profile" },
];

const LEARNER_NAV_STRUCTURE: NavItem[] = [
  { icon: "🏠", label: "Learner Workspace", href: "/learner-workspace" },
  { icon: "📖", label: "My Learning", href: "/learner-workspace/courses" },
  { icon: "📚", label: "Course Catalogue", href: "/learner-workspace/catalogue" },
  { icon: "📝", label: "My Assessments", href: "/learner-workspace/assessments" },
  { icon: "📋", label: "My Assignments", href: "/learner-workspace/assignments" },
  { icon: "📅", label: "My Attendance", href: "/learner-workspace/sessions" },
  { icon: "📈", label: "My Progress", href: "/learner-workspace/progress" },
  { icon: "🎓", label: "My Certificates", href: "/learner-workspace/certificates" },
  { icon: "🎖", label: "My Badges", href: "/learner-workspace/badges" },
  { icon: "💬", label: "Communication", href: "/learner-workspace/messages" },
  {
    icon: "📍",
    label: "NADI SITE MANAGEMENT",
    children: [
      { label: "My NADI Site", href: "/learner-workspace/nadi" },
      { label: "My Programme", href: "/learner-workspace/progress" },
      { label: "My Sessions", href: "/learner-workspace/sessions" },
    ],
  },
  { icon: "🤖", label: "AI Learning Assistant", href: "/learner-workspace/ai" },
  { icon: "🔔", label: "Notifications", href: "/learner-workspace/notifications" },
  { icon: "👤", label: "My Profile", href: "/learner-workspace/profile" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ isOpen, onClose, userRole, isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>([]);
  
  // Determine which nav structure to use based on role
  let NAV_STRUCTURE = ADMIN_NAV_STRUCTURE;
  const role = userRole?.toLowerCase() || "";
  
  if (role.includes("trainer")) {
    NAV_STRUCTURE = TRAINER_NAV_STRUCTURE;
  } else if (role.includes("learner") || role.includes("participant")) {
    NAV_STRUCTURE = LEARNER_NAV_STRUCTURE;
  }

  // Auto-expand the section containing current path
  useEffect(() => {
    const activeSection = NAV_STRUCTURE.find(
      (item) =>
        item.children?.some((child) =>
          pathname.startsWith(child.href)
        )
    );
    if (activeSection && !expanded.includes(activeSection.label)) {
      setExpanded((prev) => [...prev, activeSection.label]);
    }
  }, [pathname, NAV_STRUCTURE]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSection = (label: string) => {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 49,
          }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar${isOpen ? " open" : ""}${isCollapsed ? " collapsed" : ""}`}>
        {/* Logo / Brand */}
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className={`brand-info ${isCollapsed ? "hidden" : "flex"}`} style={{ display: isCollapsed ? "none" : "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: "800",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  flexShrink: 0,
                }}
              >
                N
              </div>
              <div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    color: "#fff",
                    letterSpacing: "-0.01em",
                  }}
                >
                  SpectrumMY LMS
                </div>
                <div
                  style={{
                    fontSize: "0.6rem",
                    color: "rgba(255,255,255,0.5)",
                    letterSpacing: "0.04em",
                    marginTop: "1px",
                  }}
                >
                  PROGRAMME & LEARNING
                </div>
              </div>
            </div>
            
            {/* Burger/Toggle Button */}
            <button
              onClick={() => {
                if (window.innerWidth <= 1024) {
                  onClose();
                } else if (onToggleCollapse) {
                  onToggleCollapse();
                }
              }}
              className="flex items-center justify-center p-1 hover:bg-white/10 rounded transition-colors text-white"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_STRUCTURE.map((item) => {
            if (!item.children) {
              // Single item
              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  className={`nav-item${isActive(item.href!) ? " active" : ""}`}
                  onClick={onClose}
                >
                  <span className="nav-icon" style={{ fontSize: "14px" }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            }

            // Section with children
            const isExpanded = expanded.includes(item.label);
            const hasActiveChild = item.children.some((child) =>
              isActive(child.href)
            );

            return (
              <div key={item.label} className="nav-section">
                <button
                  className={`nav-item${hasActiveChild ? " active" : ""}`}
                  style={{
                    width: "100%",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    background: hasActiveChild
                      ? isExpanded
                        ? "rgba(255,255,255,0.08)"
                        : undefined
                      : undefined,
                  }}
                  onClick={() => toggleSection(item.label)}
                  aria-expanded={isExpanded}
                >
                  <span className="nav-icon" style={{ fontSize: "14px" }}>
                    {item.icon}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <span
                    style={{
                      fontSize: "10px",
                      opacity: 0.6,
                      transition: "transform 0.2s",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      display: "inline-block",
                    }}
                  >
                    ▼
                  </span>
                </button>

                {isExpanded && (
                  <div style={{ marginTop: "2px", marginBottom: "4px" }}>
                    {item.children.map((child) => (
                      <Link
                        key={`${child.href}-${child.label}`}
                        href={child.href}
                        className={`nav-sub-item${isActive(child.href) ? " active" : ""}`}
                        onClick={onClose}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div
            style={{
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.35)",
              textAlign: "center",
            }}
          >
            SpectrumMY LMS © {new Date().getFullYear()}
          </div>
        </div>
      </aside>
    </>
  );
}
