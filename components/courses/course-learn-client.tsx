"use client";

import { useState } from "react";
import Link from "next/link";
import { completeCourseLesson } from "@/app/actions/courses";
import { queryAILearnerAssistantAction } from "@/app/actions/ai";
import { InteractiveQuizBlock } from "./interactive-quiz-block";
import { InteractiveAssignmentBlock } from "./interactive-assignment-block";

interface CourseLearnClientProps {
  course: any;
  participantId: string;
  initialLessonId?: string;
  initialProgressPct?: number;
}

export default function CourseLearnClient({
  course,
  participantId,
  initialLessonId,
  initialProgressPct = 0,
}: CourseLearnClientProps) {
  const allModules = course.course_modules || [];
  const allLessons = allModules.flatMap((m: any) => m.course_lessons || []);

  const [activeLessonId, setActiveLessonId] = useState<string>(
    initialLessonId || allLessons[0]?.id || ""
  );
  const [progressPct, setProgressPct] = useState(initialProgressPct);
  const [completing, setCompleting] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // AI Assistant Drawer
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const activeLesson = allLessons.find((l: any) => l.id === activeLessonId);

  const handleCompleteLesson = async () => {
    if (!activeLessonId) return;
    setCompleting(true);
    try {
      const res = await completeCourseLesson(course.id, activeLessonId, participantId);
      if (res.progressPct !== undefined) {
        setProgressPct(res.progressPct);
        setCompletedLessons(new Set([...completedLessons, activeLessonId]));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    const userQ = aiQuestion;
    setAiQuestion("");
    setAiMessages((prev) => [...prev, { role: "user", text: userQ }]);
    setAiLoading(true);

    try {
      const res = await queryAILearnerAssistantAction({
        userQuestion: userQ,
        courseContext: `${course.title} - ${activeLesson?.title || ""}`,
      });
      setAiMessages((prev) => [...prev, { role: "ai", text: res.answer }]);
    } catch (err: any) {
      setAiMessages((prev) => [...prev, { role: "ai", text: "Error fetching response. Please try again." }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 65px)", background: "var(--background)", overflow: "hidden" }}>
      {/* Left Sidebar: Syllabus */}
      <div
        style={{
          width: "320px",
          borderRight: "1px solid var(--border)",
          background: "var(--card)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
          <Link href={`/courses/${course.id}`} className="text-primary-600 hover:underline" style={{ fontSize: "0.8rem", display: "block", marginBottom: "6px" }}>
            ← Exit to Course Overview
          </Link>
          <h2 style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)", lineHeight: 1.2 }}>
            {course.title}
          </h2>
          <div style={{ marginTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
              <span>Course Progress</span>
              <strong>{progressPct}%</strong>
            </div>
            <div style={{ width: "100%", height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${progressPct}%`, height: "100%", background: "#10b981", transition: "width 0.3s" }} />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {allModules.map((mod: any, mIdx: number) => (
            <div key={mod.id} style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", padding: "4px 8px" }}>
                Module {mIdx + 1}: {mod.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                {(mod.course_lessons || []).map((l: any, lIdx: number) => {
                  const isActive = l.id === activeLessonId;
                  const isDone = completedLessons.has(l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => setActiveLessonId(l.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        borderRadius: "var(--radius)",
                        background: isActive ? "rgba(14, 165, 233, 0.12)" : "transparent",
                        border: isActive ? "1px solid #0ea5e9" : "1px solid transparent",
                        textAlign: "left",
                        cursor: "pointer",
                        color: isActive ? "#0284c7" : "var(--text-primary)",
                      }}
                    >
                      <span style={{ fontSize: "0.8rem" }}>{isDone ? "✅" : isActive ? "▶" : "○"}</span>
                      <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: isActive ? "600" : "normal" }}>
                        {mIdx + 1}.{lIdx + 1} {l.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Main Stage */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", padding: "32px", position: "relative" }}>
        {activeLesson ? (
          <div style={{ maxWidth: "840px", margin: "0 auto", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: "6px" }}>Current Topic</span>
                <h1 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-primary)" }}>
                  {activeLesson.title}
                </h1>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Estimated Duration: {activeLesson.duration_min} minutes
                </span>
              </div>
              <button
                onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
                className="btn btn-secondary"
                style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}
              >
                🤖 Ask AI Assistant
              </button>
            </div>

            {/* Content Blocks */}
            {(activeLesson.course_contents || []).length === 0 ? (
              <div className="card" style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                <p>This lesson does not have any attached text or media content blocks yet.</p>
              </div>
            ) : (
              (activeLesson.course_contents || []).map((content: any) => {
                if (content.content_type === "quiz") {
                  return (
                    <div key={content.id} style={{ marginBottom: "24px" }}>
                      <InteractiveQuizBlock
                        content={content}
                        onPass={handleCompleteLesson}
                      />
                    </div>
                  );
                }

                if (content.content_type === "assignment") {
                  return (
                    <div key={content.id} style={{ marginBottom: "24px" }}>
                      <InteractiveAssignmentBlock
                        content={content}
                        onComplete={handleCompleteLesson}
                      />
                    </div>
                  );
                }

                return (
                  <div key={content.id} className="card" style={{ padding: "28px", marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px", color: "var(--text-primary)" }}>
                      {content.title}
                    </h3>

                    {content.content_type === "video" ? (
                      <div style={{ background: "#000", borderRadius: "8px", overflow: "hidden", aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <video
                          controls
                          src={content.file_url}
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>
                    ) : content.content_type === "pdf" ? (
                      <div style={{ padding: "16px", background: "var(--surface)", borderRadius: "8px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span>📄 Reading Document: {content.file_name || content.title}</span>
                        <a href={content.file_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                          Open Document
                        </a>
                      </div>
                    ) : (
                      <div
                        style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "var(--text-primary)" }}
                        dangerouslySetInnerHTML={{ __html: content.content_body || "<p>No text provided.</p>" }}
                      />
                    )}
                  </div>
                );
              })
            )}

            {/* Bottom Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
              <button
                onClick={handleCompleteLesson}
                disabled={completing}
                className="btn btn-primary"
                style={{ minWidth: "180px" }}
              >
                {completing ? "Updating..." : "✔ Mark Lesson Complete"}
              </button>

              {progressPct >= 100 && (
                <Link href="/wallet" className="badge badge-success" style={{ fontSize: "0.9rem", padding: "8px 14px" }}>
                  🎉 100% Completed — View Credential in Wallet
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", marginTop: "60px" }}>
            <p>Select a lesson from the syllabus on the left to begin learning.</p>
          </div>
        )}
      </div>

      {/* AI Assistant Drawer */}
      {aiDrawerOpen && (
        <div
          style={{
            width: "360px",
            borderLeft: "1px solid var(--border)",
            background: "var(--card)",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "1.2rem" }}>🤖</span>
              <div>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "700", margin: 0 }}>AI Learner Assistant</h4>
                <span style={{ fontSize: "0.65rem", color: "#16a34a", fontWeight: "600" }}>● Assessment Protected</span>
              </div>
            </div>
            <button onClick={() => setAiDrawerOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1rem" }}>
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ background: "var(--surface)", padding: "12px", borderRadius: "8px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Ask questions about course concepts, request explanations, or clarify instructions. Note: AI is restricted from answering protected assessment questions.
            </div>

            {aiMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  background: msg.role === "user" ? "var(--primary)" : "var(--surface)",
                  color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  maxWidth: "85%",
                  lineHeight: 1.4,
                  whiteSpace: "pre-wrap",
                }}
              >
                {msg.text}
              </div>
            ))}
            {aiLoading && (
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                AI is thinking...
              </div>
            )}
          </div>

          <form onSubmit={handleAskAI} style={{ padding: "12px", borderTop: "1px solid var(--border)", display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Ask a question..."
              className="form-input"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              style={{ fontSize: "0.82rem" }}
            />
            <button type="submit" disabled={aiLoading || !aiQuestion.trim()} className="btn btn-primary btn-sm">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
