import Link from "next/link";
import { getCourses } from "@/app/actions/courses";

export default async function PublicCataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const res = await getCourses({ ...params, status: "published" });
  const courses = res.data || [];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Navbar / Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#0284c7", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "1.2rem" }}>
              N
            </div>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f172a" }}>Spectrum Malaysia LMS</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Public Training & Micro-Credential Catalogue</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/login" className="btn btn-primary" style={{ padding: "8px 20px" }}>
              Learner Login →
            </Link>
          </div>
        </div>

        {/* Hero Banner */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          borderRadius: "16px",
          padding: "48px 40px",
          color: "#fff",
          marginBottom: "40px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
        }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "12px", color: "#fff" }}>
            Universal Training & Micro-Credentials
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#cbd5e1", maxWidth: "700px", lineHeight: 1.6 }}>
            Explore certified academic, corporate, TVET, GenAI, and digital programs. Earn verifiable digital badges and accredited certificates recognized across Malaysia.
          </p>
        </div>

        {/* Catalogue Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" }}>
          {courses.map((course: any) => (
            <div
              key={course.id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              }}
            >
              <div style={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", padding: "20px", color: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "10px" }}>
                    {course.category}
                  </span>
                  <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "10px" }}>
                    {course.level}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#fff", margin: 0, lineHeight: 1.3 }}>
                  {course.title}
                </h3>
              </div>

              <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                <p style={{ fontSize: "0.875rem", color: "#475569", flex: 1, lineHeight: 1.5, marginBottom: "20px" }}>
                  {course.description}
                </p>

                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px", marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.85rem" }}>
                  <div>
                    <span style={{ color: "#64748b" }}>Duration:</span>{" "}
                    <strong>{course.learning_hours} Hours</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Credential:</span>{" "}
                    <strong style={{ color: "#0284c7" }}>Micro-Credential</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <Link
                    href={`/courses/${course.id}`}
                    className="btn btn-secondary"
                    style={{ flex: 1, textAlign: "center", fontSize: "0.875rem" }}
                  >
                    View Curriculum
                  </Link>
                  <Link
                    href={`/login?redirectTo=/courses/${course.id}`}
                    className="btn btn-primary"
                    style={{ flex: 1, textAlign: "center", fontSize: "0.875rem" }}
                  >
                    Enrol Now →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
