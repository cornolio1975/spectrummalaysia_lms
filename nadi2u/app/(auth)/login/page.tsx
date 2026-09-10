"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "linear-gradient(135deg, #1b3a6b 0%, #0d7063 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background pattern */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.04) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 50%)`,
        pointerEvents: "none",
      }} />

      {/* Left panel — branding */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px",
        color: "#fff",
      }} className="login-brand-panel">
        <div style={{ maxWidth: "440px" }}>
          {/* Logo / Brand mark */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "48px",
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: "800",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>N</div>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: "700", letterSpacing: "-0.01em" }}>
                NADI2U LMS
              </div>
              <div style={{ fontSize: "0.72rem", opacity: 0.7, letterSpacing: "0.05em" }}>
                PROGRAMME & LEARNING MANAGEMENT
              </div>
            </div>
          </div>

          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            lineHeight: "1.2",
            marginBottom: "16px",
            letterSpacing: "-0.02em",
          }}>
            Learn.<br />
            Participate.<br />
            Perform.<br />
            <span style={{ opacity: 0.7 }}>Measure.</span>
          </h1>
          <p style={{ fontSize: "1rem", opacity: 0.75, lineHeight: "1.7", maxWidth: "360px" }}>
            A comprehensive programme and learning management platform for
            NADI sites nationwide.
          </p>

          {/* Stats row */}
          <div style={{
            display: "flex",
            gap: "32px",
            marginTop: "48px",
          }}>
            {[
              { value: "73+", label: "NADI Sites" },
              { value: "3", label: "Programmes" },
              { value: "16", label: "States" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>{value}</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.65, marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={{
        width: "480px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(20px)",
      }} className="login-form-panel">
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
              Sign In
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
              Enter your credentials to access the system
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="admin@nadi2u.gov.my"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <a
                  href="/forgot-password"
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--primary-light)",
                    textDecoration: "none",
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{
                padding: "10px 14px",
                background: "var(--danger-bg)",
                border: "1px solid var(--danger-border)",
                borderRadius: "var(--radius)",
                color: "var(--danger)",
                fontSize: "0.825rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "11px",
                fontSize: "0.9rem",
                marginTop: "4px",
                background: "var(--primary)",
                borderColor: "var(--primary)",
              }}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" style={{ borderTopColor: "#fff", borderColor: "rgba(255,255,255,0.3)" }} />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div style={{
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid var(--border)",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            textAlign: "center",
          }}>
            <div>NADI2U Programme & Learning Management System</div>
            <div style={{ marginTop: "4px" }}>
              <a href="/verify" style={{ color: "var(--primary-light)" }}>
                Verify a Certificate
              </a>
              {" · "}
              <a href="/about" style={{ color: "var(--primary-light)" }}>
                About NADI2U
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive: hide left panel on small screens */}
      <style>{`
        @media (max-width: 900px) {
          .login-brand-panel { display: none; }
          .login-form-panel { width: 100%; }
        }
      `}</style>
    </div>
  );
}
