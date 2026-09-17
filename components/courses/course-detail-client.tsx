"use client";

import { useState } from "react";
import Link from "next/link";
import { addCourseModule, addCourseLesson, addLessonContent } from "@/app/actions/courses";

interface CourseDetailClientProps {
  course: any;
}

export default function CourseDetailClient({ course }: CourseDetailClientProps) {
  const [modules, setModules] = useState(course.course_modules || []);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState<string | null>(null);
  const [showContentModal, setShowContentModal] = useState<string | null>(null);

  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDesc, setNewModuleDesc] = useState("");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState(30);

  const [contentTitle, setContentTitle] = useState("");
  const [contentType, setContentType] = useState("text");
  const [contentBody, setContentBody] = useState("");
  const [contentUrl, setContentUrl] = useState("");

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    const res = await addCourseModule(course.id, newModuleTitle, newModuleDesc);
    if (res.data) {
      setModules([...modules, { ...res.data, course_lessons: [] }]);
      setNewModuleTitle("");
      setNewModuleDesc("");
      setShowModuleModal(false);
    }
  };

  const handleCreateLesson = async (moduleId: string) => {
    if (!newLessonTitle.trim()) return;

    const res = await addCourseLesson(moduleId, course.id, newLessonTitle, newLessonDuration);
    if (res.data) {
      setModules(
        modules.map((m: any) =>
          m.id === moduleId
            ? { ...m, course_lessons: [...(m.course_lessons || []), { ...res.data, course_contents: [] }] }
            : m
        )
      );
      setNewLessonTitle("");
      setShowLessonModal(null);
    }
  };

  const handleCreateContent = async (lessonId: string) => {
    if (!contentTitle.trim()) return;

    const res = await addLessonContent(lessonId, course.id, {
      title: contentTitle,
      contentType,
      contentBody,
      fileUrl: contentUrl || undefined,
    });

    if (res.data) {
      setModules(
        modules.map((m: any) => ({
          ...m,
          course_lessons: (m.course_lessons || []).map((l: any) =>
            l.id === lessonId ? { ...l, course_contents: [...(l.course_contents || []), res.data] } : l
          ),
        }))
      );
      setContentTitle("");
      setContentBody("");
      setContentUrl("");
      setShowContentModal(null);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      {/* Back link */}
      <div style={{ marginBottom: "16px" }}>
        <Link href="/courses" className="text-primary-600 hover:underline" style={{ fontSize: "0.875rem" }}>
          ← Back to All Courses
        </Link>
      </div>

      {/* Hero Header */}
      <div className="card" style={{ padding: "32px", marginBottom: "24px", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.8rem", background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: "12px", fontFamily: "monospace" }}>
                {course.course_code}
              </span>
              <span className="badge badge-primary">{course.category}</span>
              <span className="badge badge-neutral">{course.level}</span>
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", margin: "8px 0 12px", color: "#fff" }}>
              {course.title}
            </h1>
            <p style={{ fontSize: "0.95rem", color: "#cbd5e1", maxWidth: "720px", lineHeight: 1.5 }}>
              {course.description}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "200px" }}>
            <Link href={`/courses/${course.id}/learn`} className="btn btn-primary" style={{ textAlign: "center", fontSize: "1rem", padding: "12px 20px" }}>
              ▶ Start Learning Course
            </Link>
            <div style={{ fontSize: "0.8rem", color: "#94a3b8", textAlign: "center" }}>
              {course.learning_hours} Learning Hours • {course.min_pass_score}% Pass Mark
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "24px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px", marginTop: "24px", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Assigned Trainer</div>
            <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{course.trainers?.name || "Unassigned"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Attendance Threshold</div>
            <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{course.attendance_required_pct}% Required</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Course Status</div>
            <div style={{ fontSize: "0.9rem", fontWeight: "600", textTransform: "capitalize", color: "#38bdf8" }}>{course.status}</div>
          </div>
        </div>
      </div>

      {/* Curriculum & Modules Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: "700" }}>Curriculum Outline</h2>
        <button
          onClick={() => setShowModuleModal(true)}
          className="btn btn-secondary"
          style={{ fontSize: "0.85rem" }}
        >
          + Add Module
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="card" style={{ padding: "40px", textAlign: "center", marginBottom: "32px" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>No modules created yet for this course.</p>
          <button onClick={() => setShowModuleModal(true)} className="btn btn-primary">
            Create First Module
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
          {modules.map((mod: any, modIdx: number) => (
            <div key={mod.id} className="card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                    Module {modIdx + 1}: {mod.title}
                  </h3>
                  {mod.description && (
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      {mod.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowLessonModal(mod.id)}
                  className="btn btn-ghost"
                  style={{ fontSize: "0.8rem", color: "var(--primary)" }}
                >
                  + Add Lesson
                </button>
              </div>

              {/* Lessons List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                {(mod.course_lessons || []).map((lesson: any, lesIdx: number) => (
                  <div
                    key={lesson.id}
                    style={{
                      padding: "12px 16px",
                      background: "var(--surface)",
                      borderRadius: "var(--radius)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                          {modIdx + 1}.{lesIdx + 1} {lesson.title}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "8px" }}>
                          ⏱ {lesson.duration_min} min
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => setShowContentModal(lesson.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: "0.75rem" }}
                        >
                          + Content
                        </button>
                        <Link href={`/courses/${course.id}/learn?lessonId=${lesson.id}`} className="btn btn-secondary btn-sm" style={{ fontSize: "0.75rem" }}>
                          Preview
                        </Link>
                      </div>
                    </div>

                    {/* Content Blocks */}
                    {lesson.course_contents && lesson.course_contents.length > 0 && (
                      <div style={{ marginTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {lesson.course_contents.map((content: any) => (
                          <span
                            key={content.id}
                            style={{
                              fontSize: "0.7rem",
                              background: "#e0f2fe",
                              color: "#0369a1",
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            📄 {content.title} ({content.content_type})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Practical Assessment Section */}
      {course.practical_assessments && course.practical_assessments.length > 0 && (
        <div className="card" style={{ padding: "24px", border: "1px solid #38bdf8", background: "#f0f9ff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0369a1" }}>
              🛠️ Capstone Practical Assessment
            </h3>
            <span className="badge badge-primary">
              Pass Mark: {course.practical_assessments[0].pass_mark}%
            </span>
          </div>
          <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#0f172a", marginBottom: "6px" }}>
            {course.practical_assessments[0].title}
          </h4>
          <p style={{ fontSize: "0.85rem", color: "#334155", marginBottom: "16px", lineHeight: 1.4 }}>
            {course.practical_assessments[0].instructions}
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/practical-assessments" className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
              View Submission Queue & Rubrics
            </Link>
          </div>
        </div>
      )}

      {/* Module Modal */}
      {showModuleModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ width: "450px", padding: "24px", background: "var(--card)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px" }}>Add New Module</h3>
            <form onSubmit={handleCreateModule}>
              <div style={{ marginBottom: "12px" }}>
                <label className="form-label">Module Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Module 1: Core Fundamentals"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={newModuleDesc}
                  onChange={(e) => setNewModuleDesc(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" onClick={() => setShowModuleModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ width: "450px", padding: "24px", background: "var(--card)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px" }}>Add New Lesson</h3>
            <div style={{ marginBottom: "12px" }}>
              <label className="form-label">Lesson Title</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Lesson 1: Introduction to Framework"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label className="form-label">Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                step="5"
                className="form-input"
                value={newLessonDuration}
                onChange={(e) => setNewLessonDuration(parseInt(e.target.value) || 30)}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button type="button" onClick={() => setShowLessonModal(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={() => handleCreateLesson(showLessonModal)} className="btn btn-primary">
                Add Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Modal */}
      {showContentModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ width: "500px", padding: "24px", background: "var(--card)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px" }}>Add Learning Content Block</h3>
            <div style={{ marginBottom: "12px" }}>
              <label className="form-label">Content Title</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Video Lecture or Reading Material"
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label className="form-label">Content Type</label>
              <select
                className="form-select"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
              >
                <option value="text">Text Lesson</option>
                <option value="video">Video Lecture (MP4 / Stream)</option>
                <option value="pdf">Document / PDF Guide</option>
                <option value="practical">Practical Task</option>
              </select>
            </div>
            {contentType === "text" ? (
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">HTML / Text Content Body</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Enter lesson notes, guidelines, or instructions..."
                  value={contentBody}
                  onChange={(e) => setContentBody(e.target.value)}
                />
              </div>
            ) : (
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Media / Document URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Storage URL or video URL..."
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                />
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button type="button" onClick={() => setShowContentModal(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={() => handleCreateContent(showContentModal)} className="btn btn-primary">
                Save Content Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
