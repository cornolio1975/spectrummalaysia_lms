import Link from "next/link";
import { getCourses } from "@/app/actions/courses";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const res = await getCourses(params);
  const courses = res.data || [];

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
            Universal Courses & Curriculum
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: "4px" }}>
            Create and manage universal modular training courses across academic, TVET, corporate, and digital sectors.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/catalogue" className="btn btn-secondary">
            🌐 Public Catalogue
          </Link>
          <Link href="/courses/new" className="btn btn-primary">
            + New Course Builder
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: "16px", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 240px" }}>
          <input
            type="search"
            placeholder="Search by course title..."
            className="form-input"
            defaultValue={params.search || ""}
          />
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Level:</span>
          <span className="badge badge-neutral">All</span>
          <span className="badge badge-primary">Published ({courses.filter(c => c.status === "published").length})</span>
          <span className="badge badge-warning">Draft ({courses.filter(c => c.status === "draft").length})</span>
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📖</div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "8px" }}>No Courses Found</h3>
          <p style={{ color: "var(--text-muted)", maxWidth: "460px", margin: "0 auto 24px" }}>
            Get started by launching the Course Builder to define modules, interactive lessons, video learning, and practical rubrics.
          </p>
          <Link href="/courses/new" className="btn btn-primary">
            Build Your First Course
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {courses.map((course: any) => (
            <div key={course.id} className="card" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
              <div style={{
                height: "120px",
                background: "linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)",
                padding: "16px",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "12px", letterSpacing: "0.05em" }}>
                    {course.course_code}
                  </span>
                  <span style={{
                    fontSize: "0.7rem",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    background: course.status === "published" ? "#10b981" : "#f59e0b",
                    fontWeight: "600",
                    textTransform: "uppercase"
                  }}>
                    {course.status}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                  {course.category} • {course.level}
                </div>
              </div>

              <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px", color: "var(--text-primary)", lineHeight: 1.3 }}>
                  {course.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", flex: 1, marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {course.description}
                </p>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginBottom: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.8rem" }}>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Learning Hours:</span>{" "}
                    <strong>{course.learning_hours} hrs</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Pass Mark:</span>{" "}
                    <strong>{course.min_pass_score}%</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                  <Link href={`/courses/${course.id}`} className="btn btn-secondary" style={{ flex: 1, textAlign: "center", fontSize: "0.82rem" }}>
                    View Curriculum
                  </Link>
                  <Link href={`/courses/${course.id}/learn`} className="btn btn-primary" style={{ flex: 1, textAlign: "center", fontSize: "0.82rem" }}>
                    ▶ Launch Course
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
