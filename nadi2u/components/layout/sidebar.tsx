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

const NAV_STRUCTURE: NavItem[] = [
  {
    icon: "▦",
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: "📚",
    label: "Programme Management",
    href: "/programmes",
  },
  {
    icon: "🏛",
    label: "NADI Management",
    href: "/nadi",
  },
  {
    icon: "👥",
    label: "Participants",
    href: "/participants",
  },
  {
    icon: "📅",
    label: "Events",
    children: [
      { label: "Events", href: "/events" },
      { label: "Trainers", href: "/events/trainers" },
    ],
  },
  {
    icon: "🗂",
    label: "Media Repository",
    href: "/media",
  },
  {
    icon: "🎓",
    label: "Certificates",
    href: "/certificates",
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
    icon: "📋",
    label: "Reports",
    children: [
      { label: "KPIs", href: "/reports/kpis" },
      { label: "Live Training", href: "/reports/live-training" },
    ],
  },
  {
    icon: "⚙",
    label: "Administration",
    children: [
      { label: "Audit Logs", href: "/admin/audit" },
      { label: "System Settings", href: "/admin/settings" },
      { label: "Google Integration", href: "/admin/google" },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>([]);

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
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

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

      <aside className={`sidebar${isOpen ? " open" : ""}`}>
        {/* Logo / Brand */}
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
                NADI2U LMS
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
                        key={child.href}
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
            NADI2U LMS © {new Date().getFullYear()}
          </div>
        </div>
      </aside>
    </>
  );
}
