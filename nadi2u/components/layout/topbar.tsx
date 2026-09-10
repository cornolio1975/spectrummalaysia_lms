"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface TopbarProps {
  onMenuClick: () => void;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

export default function Topbar({
  onMenuClick,
  userName = "Administrator",
  userEmail = "",
  userRole = "Super Admin",
}: TopbarProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="topbar">
      {/* Hamburger for mobile */}
      <button
        onClick={onMenuClick}
        className="btn btn-ghost btn-icon"
        aria-label="Toggle navigation"
        style={{ display: "none" }}
        id="mobile-menu-btn"
      >
        <span style={{ fontSize: "18px" }}>☰</span>
      </button>

      {/* Search bar */}
      <div className="search-input-wrap" style={{ maxWidth: "380px" }}>
        <span className="search-icon" style={{ fontSize: "13px" }}>🔍</span>
        <input
          type="search"
          className="form-input"
          placeholder="Search participants, programmes, events…"
          style={{ fontSize: "0.82rem", padding: "7px 12px 7px 32px" }}
        />
      </div>

      {/* Right side */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Breadcrumb / context - hidden on small */}
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            padding: "4px 10px",
            background: "var(--surface)",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border)",
          }}
          className="topbar-badge"
        >
          {userRole}
        </div>

        {/* Notifications */}
        <button
          className="btn btn-ghost btn-icon"
          aria-label="Notifications"
          style={{ position: "relative" }}
        >
          <span style={{ fontSize: "16px" }}>🔔</span>
          <span
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "7px",
              height: "7px",
              background: "var(--danger)",
              borderRadius: "50%",
              border: "1.5px solid #fff",
            }}
          />
        </button>

        {/* User menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "var(--radius)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--surface)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "none")
            }
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "700",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  lineHeight: 1.2,
                }}
              >
                {userName}
              </div>
              {userEmail && (
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {userEmail}
                </div>
              )}
            </div>
            <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "2px" }}>
              ▼
            </span>
          </button>

          {showUserMenu && (
            <>
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 98,
                }}
                onClick={() => setShowUserMenu(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "220px",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    {userName}
                  </div>
                  <div
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    {userEmail}
                  </div>
                </div>
                {[
                  { label: "My Profile", href: "/admin/profile" },
                  { label: "System Settings", href: "/admin/settings" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "block",
                      padding: "9px 16px",
                      fontSize: "0.85rem",
                      color: "var(--text-primary)",
                      textDecoration: "none",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--surface)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    {item.label}
                  </a>
                ))}
                <div
                  style={{ borderTop: "1px solid var(--border)", padding: "4px" }}
                >
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "none",
                      border: "none",
                      borderRadius: "var(--radius)",
                      fontSize: "0.85rem",
                      color: "var(--danger)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--danger-bg)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #mobile-menu-btn { display: flex !important; }
          .topbar-badge { display: none; }
        }
      `}</style>
    </header>
  );
}
