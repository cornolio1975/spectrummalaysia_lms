"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/app/actions/courses";
import { generateAICourseDraftAction } from "@/app/actions/ai";

interface CourseBuilderClientProps {
  categories: { id: string; name: string; code: string }[];
  trainers: { id: string; name: string }[];
}

export default function CourseBuilderClient({ categories, trainers }: CourseBuilderClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: categories[0]?.name || "Artificial Intelligence & GenAI",
    level: "Intermediate" as "Beginner" | "Intermediate" | "Advanced" | "Expert",
    learning_hours: 12,
    attendance_required_pct: 80,
    min_pass_score: 70,
    status: "published" as "draft" | "review" | "published" | "active",
    trainer_id: trainers[0]?.id || "",
    prerequisites: "Basic digital literacy and browser navigation skills.",
  });

  const [aiTopic, setAiTopic] = useState("");
  const [aiPromptOpen, setAiPromptOpen] = useState(false);

  const handleAiDraft = async () => {
    if (!aiTopic.trim()) return;
    setAiGenerating(true);
    try {
      const draft = await generateAICourseDraftAction({
        topic: aiTopic,
        category: formData.category,
        targetLevel: formData.level,
        targetHours: formData.learning_hours,
      });

      setFormData((prev) => ({
        ...prev,
        title: draft.title,
        description: draft.description,
        learning_hours: draft.learningHours,
      }));
      setAiPromptOpen(false);
    } catch (err) {
      console.error("AI Draft error:", err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await createCourse({
        ...formData,
        learning_hours: Number(formData.learning_hours),
        attendance_required_pct: Number(formData.attendance_required_pct),
        min_pass_score: Number(formData.min_pass_score),
        trainer_id: formData.trainer_id || undefined,
      });

      if (res.error) {
        alert(`Error: ${res.error}`);
      } else if (res.data?.id) {
        router.push(`/courses/${res.data.id}`);
      }
    } catch (err: any) {
      alert(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "700" }}>Universal Course Builder</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Configure course properties, learning hours, minimum pass criteria, and modular curriculum.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAiPromptOpen(!aiPromptOpen)}
          className="btn btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0fdf4", borderColor: "#86efac", color: "#166534" }}
        >
          ✨ AI Draft Generator
        </button>
      </div>

      {/* AI Generator Panel */}
      {aiPromptOpen && (
        <div className="card" style={{ padding: "20px", marginBottom: "24px", border: "2px solid #86efac", background: "#f0fdf4" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#166534", marginBottom: "8px" }}>
            AI Course Outline Generator (Draft Only)
          </h3>
          <p style={{ fontSize: "0.82rem", color: "#15803d", marginBottom: "12px" }}>
            Enter a subject or technical domain. AI will draft the course title, description, and learning hour estimates. All AI-generated curricula are flagged as draft for trainer verification.
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              placeholder="e.g. Industrial IoT Sensor Deployment, TVET Electrician Standards, Prompt Workflows..."
              className="form-input"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAiDraft}
              disabled={aiGenerating || !aiTopic.trim()}
              className="btn btn-primary"
              style={{ whiteSpace: "nowrap" }}
            >
              {aiGenerating ? "Generating..." : "Generate Draft"}
            </button>
          </div>
        </div>
      )}

      {/* Course Form */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: "28px" }}>
        <div style={{ display: "grid", gap: "20px" }}>
          <div>
            <label className="form-label" style={{ fontWeight: "600" }}>Course Title *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Applied Prompt Engineering for Malaysian SMEs"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label className="form-label" style={{ fontWeight: "600" }}>Training Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: "600" }}>Competency Level *</label>
              <select
                className="form-select"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: "600" }}>Course Description *</label>
            <textarea
              required
              rows={4}
              className="form-textarea"
              placeholder="Provide a detailed summary of course syllabus, intended learners, and industry applications..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div>
              <label className="form-label" style={{ fontWeight: "600" }}>Learning Hours *</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                className="form-input"
                value={formData.learning_hours}
                onChange={(e) => setFormData({ ...formData, learning_hours: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: "600" }}>Min Pass Mark (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                className="form-input"
                value={formData.min_pass_score}
                onChange={(e) => setFormData({ ...formData, min_pass_score: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: "600" }}>Min Attendance (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                className="form-input"
                value={formData.attendance_required_pct}
                onChange={(e) => setFormData({ ...formData, attendance_required_pct: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label className="form-label" style={{ fontWeight: "600" }}>Assigned Trainer</label>
              <select
                className="form-select"
                value={formData.trainer_id}
                onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}
              >
                <option value="">-- No Trainer Assigned --</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: "600" }}>Publication Status *</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="draft">Draft (Private)</option>
                <option value="review">Review Requested</option>
                <option value="published">Published & Active</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: "600" }}>Prerequisites</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Basic secondary education or SPM equivalent."
              value={formData.prerequisites || ""}
              onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <button type="button" onClick={() => router.back()} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: "160px" }}>
              {loading ? "Saving Course..." : "Create & Open Curriculum"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
