"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getUserNotifications, markNotificationAsRead } from "@/app/actions/notifications";
import { universalGlobalSearch, GlobalSearchResult } from "@/app/actions/search";
import Link from "next/link";
import { Home, Maximize } from "lucide-react";

// The official public landing page
const LANDING_PAGE_URL = process.env.NEXT_PUBLIC_LANDING_PAGE_URL || "https://hotpink-alligator-894872.hostingersite.com/";

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Universal Global Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    getUserNotifications().then((res) => {
      if (res.data) setNotifications(res.data);
    });

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
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

      {/* Universal Global Search */}
      <div className="search-input-wrap" style={{ maxWidth: "380px", position: "relative" }}>
        <span className="search-icon" style={{ fontSize: "13px" }}>🔍</span>
        <input
          type="search"
          className="form-input"
          value={searchQuery}
          onChange={async (e) => {
            const q = e.target.value;
            setSearchQuery(q);
            if (q.trim().length >= 2) {
              setIsSearching(true);
              setShowSearchDropdown(true);
              const res = await universalGlobalSearch(q);
              setSearchResults(res.data || []);
              setIsSearching(false);
            } else {
              setSearchResults([]);
              setShowSearchDropdown(false);
            }
          }}
          onFocus={() => {
            if (searchResults.length > 0) setShowSearchDropdown(true);
          }}
          placeholder="Global Search (courses, learners, certs...)"
          style={{ fontSize: "0.82rem", padding: "7px 12px 7px 32px" }}
        />

        {showSearchDropdown && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              background: "var(--surface, #fff)",
              border: "1px solid var(--border, #e5e7eb)",
              borderRadius: "8px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
              zIndex: 100,
              maxHeight: "320px",
              overflowY: "auto",
            }}
          >
            {isSearching ? (
              <div style={{ padding: "12px", fontSize: "0.75rem", color: "var(--text-muted, #6b7280)", textAlign: "center" }}>
                Searching LMS registry...
              </div>
            ) : searchResults.length === 0 ? (
              <div style={{ padding: "12px", fontSize: "0.75rem", color: "var(--text-muted, #6b7280)", textAlign: "center" }}>
                No results found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              searchResults.map((item) => (
                <Link
                  key={`${item.category}-${item.id}`}
                  href={item.href}
                  onClick={() => setShowSearchDropdown(false)}
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    borderBottom: "1px solid var(--border, #f3f4f6)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover, #f9fafb)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--text-main, #111827)" }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted, #6b7280)" }}>
                    {item.subtitle}
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right side */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="btn btn-ghost btn-icon"
          aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          <Maximize size={18} />
        </button>

        {/* Home Button linking to Landing Page */}
        <a
          href={LANDING_PAGE_URL}
          className="btn btn-ghost"
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 500 }}
          aria-label="Home"
          title="Return to Landing Page"
        >
          <Home size={18} />
          <span className="hidden sm:inline">Home</span>
        </a>

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
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="btn btn-ghost btn-icon"
            aria-label="Notifications"
            style={{ position: "relative" }}
          >
            <span style={{ fontSize: "16px" }}>🔔</span>
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  minWidth: "14px",
                  height: "14px",
                  padding: "0 3px",
                  background: "var(--danger)",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: "bold",
                  borderRadius: "7px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: "320px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>In-App Notifications</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  {unreadCount} unread
                </span>
              </div>

              <div style={{ maxHeight: "280px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: "10px 14px",
                        borderBottom: "1px solid var(--border)",
                        background: n.is_read ? "transparent" : "rgba(79, 70, 229, 0.04)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: n.is_read ? "normal" : "bold" }}>
                          {n.title}
                        </span>
                        {!n.is_read && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            style={{
                              border: "none",
                              background: "none",
                              color: "var(--primary)",
                              fontSize: "0.65rem",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0 }}>
                        {n.message}
                      </p>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
                  { 
                    label: "My Profile", 
                    href: userRole?.toLowerCase().includes("learner") 
                      ? "/learner-workspace/profile" 
                      : userRole?.toLowerCase().includes("trainer") 
                        ? "/trainer-workspace/profile" 
                        : "/admin/profile",
                    show: true 
                  },
                  { 
                    label: "System Settings", 
                    href: "/admin/settings",
                    show: userRole?.toLowerCase().includes("admin")
                  },
                  { 
                    label: "User Management", 
                    href: "/admin/users",
                    show: userRole?.toLowerCase().includes("admin")
                  },
                ].filter(item => item.show).map((item) => (
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
