"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { updateCourseCategory, bulkAssignCategory, bulkUpdateStatus } from "@/app/actions/courses";

interface Programme {
  id: string;
  programme_code: string;
  programme_name: string;
  category?: string;
  status: string;
}

interface TrainingCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface CourseModule {
  id: string;
  title: string;
  description?: string;
  sort_order: number;
  course_lessons?: CourseLesson[];
}

interface CourseLesson {
  id: string;
  title: string;
  description?: string;
  duration_min: number;
  is_mandatory: boolean;
  sort_order: number;
  course_contents?: CourseContent[];
}

interface CourseContent {
  id: string;
  title: string;
  content_type: string;
  content_body?: string;
}

interface PracticalAssessment {
  id: string;
  title: string;
  instructions?: string;
  max_score: number;
  pass_mark: number;
  rubrics?: any;
}

interface Course {
  id: string;
  course_code: string;
  title: string;
  description?: string;
  category?: string;
  category_id?: string;
  level?: string;
  level_designation?: string;
  learning_hours?: number | string;
  contact_hours?: number | string;
  self_study_hours?: number | string;
  assessment_hours?: number | string;
  learning_objectives?: string[];
  learning_outcomes?: string[];
  prerequisites?: string[];
  min_pass_score?: number;
  attendance_required_pct?: number;
  status: string;
  updated_at: string;
  created_at: string;
  programme_id?: string;
  trainer_id?: string;
  programmes?: Programme;
  training_categories?: TrainingCategory;
  trainers?: { id: string; name: string; email?: string; specialization?: string };
  course_modules?: CourseModule[];
  practical_assessments?: PracticalAssessment[];
  modules_count: number;
  lessons_count: number;
  contents_count: number;
  quizzes_count: number;
  practical_assessments_count: number;
  trainer_guides_count: number;
  learner_contents_count: number;
  is_archived?: boolean;
  archived_at?: string;
  completeness: "Complete" | "Incomplete" | "Review Required" | "Not Verified" | "Archived";
  review_state?:
    | "Not Started"
    | "Structure Created"
    | "Content In Progress"
    | "Content Complete"
    | "SME Review Required"
    | "Approved for Publication"
    | "Published"
    | "Archived / Legacy";
  sme_status: "Approved" | "Pending Review";
  checklist: {
    course_info: boolean;
    modules: boolean;
    lessons: boolean;
    learner_content: boolean;
    trainer_guidance: boolean;
    assessments: boolean;
    learning_hours: boolean;
    sme_reviewed: boolean;
    is_archived?: boolean;
  };
}

interface CurriculumManagementClientProps {
  initialProgrammes: Programme[];
  initialCategories: TrainingCategory[];
  initialCourses: Course[];
}

export default function CurriculumManagementClient({
  initialProgrammes,
  initialCategories,
  initialCourses,
}: CurriculumManagementClientProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "programmes"
    | "parent_courses"
    | "all_courses"
    | "tree_view"
    | "assessments"
    | "trainer_materials"
    | "learner_materials"
    | "review"
    | "archived"
  >("overview");

  // Live Courses State
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [categories, setCategories] = useState<TrainingCategory[]>(initialCategories);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProgramme, setSelectedProgramme] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCompleteness, setSelectedCompleteness] = useState<string>("all");
  const [selectedSmeStatus, setSelectedSmeStatus] = useState<string>("all");
  const [selectedAssessmentsFilter, setSelectedAssessmentsFilter] = useState<string>("all");
  const [selectedTrainerGuideFilter, setSelectedTrainerGuideFilter] = useState<string>("all");

  // Selection & Bulk Actions
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState<string>("");
  const [bulkStatusTarget, setBulkStatusTarget] = useState<"draft" | "published" | "archived">("published");
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<"title" | "programme" | "status" | "completeness" | "updated_at">("title");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Inspection Drawer
  const [inspectedCourse, setInspectedCourse] = useState<Course | null>(null);

  // Expand / Collapse state for Trees and Groups
  const [expandedProgrammes, setExpandedProgrammes] = useState<Record<string, boolean>>({
    "PROG-NADI-GRADUATE-2027": true,
    "PROG-MAXIS-FP-2027": true,
    "PROG-NADI-GLCP-2027": true,
  });
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedTreeModules, setExpandedTreeModules] = useState<Record<string, boolean>>({});

  // Summary Metrics Computation (Active Catalogue vs Archive)
  const metrics = useMemo(() => {
    const totalProgrammes = initialProgrammes.length;
    const totalCategories = categories.length;
    const activeCoursesList = courses.filter((c) => !c.is_archived && c.status !== "archived");
    const archivedCoursesList = courses.filter((c) => c.is_archived || c.status === "archived");
    const totalCourses = activeCoursesList.length;
    const totalArchived = archivedCoursesList.length;
    const draftCourses = activeCoursesList.filter((c) => c.status === "draft").length;
    const publishedCourses = activeCoursesList.filter((c) => c.status === "published").length;
    const reviewReqCourses = activeCoursesList.filter((c) => c.completeness === "Review Required" || c.review_state === "SME Review Required" || c.sme_status === "Pending Review").length;
    const incompleteCourses = activeCoursesList.filter((c) => c.completeness === "Incomplete" || c.completeness === "Not Verified").length;
    const completeCourses = activeCoursesList.filter((c) => c.completeness === "Complete" || c.review_state === "Content Complete").length;

    return {
      totalProgrammes,
      totalCategories,
      totalCourses,
      totalArchived,
      draftCourses,
      publishedCourses,
      reviewReqCourses,
      incompleteCourses,
      completeCourses,
    };
  }, [courses, initialProgrammes, categories]);

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const isArchived = Boolean(course.is_archived || course.status === "archived");

      // In the "archived" tab, ONLY show archived courses
      if (activeTab === "archived") {
        if (!isArchived) return false;
      } else {
        // In active tabs, exclude archived courses unless explicitly chosen in selectedStatus
        if (isArchived && selectedStatus !== "archived" && selectedStatus !== "all_including_archived") {
          return false;
        }
      }

      // Search partial match on title, course_code, programme_name, category
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const codeMatch = course.course_code.toLowerCase().includes(q);
        const titleMatch = course.title.toLowerCase().includes(q);
        const progMatch = (course.programmes?.programme_name || "").toLowerCase().includes(q);
        const progCodeMatch = (course.programmes?.programme_code || "").toLowerCase().includes(q);
        const catMatch = (course.category || "").toLowerCase().includes(q);
        const descMatch = (course.description || "").toLowerCase().includes(q);
        if (!codeMatch && !titleMatch && !progMatch && !progCodeMatch && !catMatch && !descMatch) {
          return false;
        }
      }

      // Programme Filter
      if (selectedProgramme !== "all") {
        if (selectedProgramme === "none") {
          if (course.programme_id) return false;
        } else if (course.programme_id !== selectedProgramme && course.programmes?.programme_code !== selectedProgramme) {
          return false;
        }
      }

      // Category / Parent Course Filter
      if (selectedCategory !== "all") {
        if (selectedCategory === "none") {
          if (course.category_id || course.category) return false;
        } else if (course.category_id !== selectedCategory && course.category !== selectedCategory) {
          return false;
        }
      }

      // Level Filter
      if (selectedLevel !== "all" && course.level !== selectedLevel) {
        return false;
      }

      // Status Filter
      if (selectedStatus !== "all" && course.status !== selectedStatus) {
        return false;
      }

      // Completeness Filter
      if (selectedCompleteness !== "all" && course.completeness !== selectedCompleteness) {
        return false;
      }

      // SME Review Status Filter
      if (selectedSmeStatus !== "all" && course.sme_status !== selectedSmeStatus) {
        return false;
      }

      // Assessments Filter
      if (selectedAssessmentsFilter === "available" && course.practical_assessments_count === 0 && course.quizzes_count === 0) {
        return false;
      }
      if (selectedAssessmentsFilter === "missing" && (course.practical_assessments_count > 0 || course.quizzes_count > 0)) {
        return false;
      }

      // Trainer Guide Filter
      if (selectedTrainerGuideFilter === "available" && course.trainer_guides_count === 0) {
        return false;
      }
      if (selectedTrainerGuideFilter === "missing" && course.trainer_guides_count > 0) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let valA: any = "";
      let valB: any = "";
      if (sortField === "title") {
        valA = a.title;
        valB = b.title;
      } else if (sortField === "programme") {
        valA = a.programmes?.programme_name || "";
        valB = b.programmes?.programme_name || "";
      } else if (sortField === "status") {
        valA = a.status;
        valB = b.status;
      } else if (sortField === "completeness") {
        valA = a.completeness;
        valB = b.completeness;
      } else if (sortField === "updated_at") {
        valA = new Date(a.updated_at || a.created_at).getTime();
        valB = new Date(b.updated_at || b.created_at).getTime();
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [
    courses,
    searchQuery,
    selectedProgramme,
    selectedCategory,
    selectedLevel,
    selectedStatus,
    selectedCompleteness,
    selectedSmeStatus,
    selectedAssessmentsFilter,
    selectedTrainerGuideFilter,
    sortField,
    sortAsc,
  ]);

  // Reset Filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedProgramme("all");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSelectedStatus("all");
    setSelectedCompleteness("all");
    setSelectedSmeStatus("all");
    setSelectedAssessmentsFilter("all");
    setSelectedTrainerGuideFilter("all");
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    const headers = [
      "Programme Code",
      "Programme Name",
      "Category / Parent Course",
      "Course Code",
      "Course Title",
      "Status",
      "Level",
      "Modules Count",
      "Lessons Count",
      "Contents Count",
      "Quizzes Count",
      "Practical Assessments",
      "Configured Learning Hours",
      "Trainer Guide Status",
      "Learner Content Status",
      "SME Review Status",
      "Curriculum Completeness",
      "Last Updated",
    ];

    const rows = filteredCourses.map((c) => [
      `"${(c.programmes?.programme_code || "").replace(/"/g, '""')}"`,
      `"${(c.programmes?.programme_name || "").replace(/"/g, '""')}"`,
      `"${(c.category || c.training_categories?.name || "Uncategorized").replace(/"/g, '""')}"`,
      `"${c.course_code.replace(/"/g, '""')}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.status.toUpperCase()}"`,
      `"${c.level || "N/A"}"`,
      c.modules_count,
      c.lessons_count,
      c.contents_count,
      c.quizzes_count,
      c.practical_assessments_count,
      c.learning_hours || c.contact_hours || 0,
      `"${c.trainer_guides_count > 0 ? "Available" : "Missing"}"`,
      `"${c.learner_contents_count > 0 || c.contents_count > 0 ? "Available" : "Incomplete"}"`,
      `"${c.sme_status}"`,
      `"${c.completeness}"`,
      `"${new Date(c.updated_at || c.created_at).toLocaleDateString()}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Universal_Curriculum_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCourseIds(filteredCourses.map((c) => c.id));
    } else {
      setSelectedCourseIds([]);
    }
  };

  const handleToggleSelectCourse = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  // Execute Bulk Category Assignment
  const handleBulkAssignCategory = async () => {
    if (selectedCourseIds.length === 0) return;
    setIsProcessingBulk(true);
    setBulkMessage(null);

    const targetCatId = bulkCategoryTarget === "none" ? null : bulkCategoryTarget;
    const res = await bulkAssignCategory(selectedCourseIds, targetCatId);
    if (res.error) {
      setBulkMessage(`Error: ${res.error}`);
    } else {
      const targetCatObj = categories.find((c) => c.id === targetCatId);
      const catName = targetCatObj ? targetCatObj.name : "Uncategorized";
      setCourses((prev) =>
        prev.map((c) =>
          selectedCourseIds.includes(c.id)
            ? { ...c, category_id: targetCatId || undefined, category: catName }
            : c
        )
      );
      setBulkMessage(`Successfully assigned ${selectedCourseIds.length} courses to ${catName}.`);
      setSelectedCourseIds([]);
    }
    setIsProcessingBulk(false);
  };

  // Execute Bulk Status Update
  const handleBulkUpdateStatus = async () => {
    if (selectedCourseIds.length === 0) return;
    setIsProcessingBulk(true);
    setBulkMessage(null);

    const res = await bulkUpdateStatus(selectedCourseIds, bulkStatusTarget);
    if (res.error) {
      setBulkMessage(`Error: ${res.error}`);
    } else {
      setCourses((prev) =>
        prev.map((c) => (selectedCourseIds.includes(c.id) ? { ...c, status: bulkStatusTarget } : c))
      );
      setBulkMessage(`Successfully updated ${selectedCourseIds.length} courses to ${bulkStatusTarget}.`);
      setSelectedCourseIds([]);
    }
    setIsProcessingBulk(false);
  };

  // Toggle helpers
  const toggleProgrammeExpand = (code: string) => {
    setExpandedProgrammes((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const toggleTreeModuleExpand = (modId: string) => {
    setExpandedTreeModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1560px", margin: "0 auto" }}>
      {/* ─── Page Header ─── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.8rem" }}>🏛️</span>
            <div>
              <h1
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "800",
                  color: "var(--text-primary)",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Universal Courses & Curriculum
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "2px" }}>
                Multi-programme curriculum governance, modular hierarchy, assessment mapping, and publication workflow
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={handleExportCsv}
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: "600" }}
          >
            📥 Export CSV ({filteredCourses.length})
          </button>
          <Link
            href="/catalogue"
            className="btn btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}
          >
            🌐 Public Catalogue
          </Link>
          <Link
            href="/courses/new"
            className="btn btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: "600" }}
          >
            + New Course Builder
          </Link>
        </div>
      </div>

      {/* ─── Admin Overview Dashboard KPI Cards ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        <div
          className="card"
          style={{
            padding: "16px",
            borderLeft: "4px solid #1b3a6b",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Total Programmes
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#1b3a6b", marginTop: "4px" }}>
            {metrics.totalProgrammes}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Active & Framework
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: "16px",
            borderLeft: "4px solid #0d7063",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Parent Groups
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#0d7063", marginTop: "4px" }}>
            {metrics.totalCategories}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Subject Categories
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: "16px",
            borderLeft: "4px solid #2563eb",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Total Courses
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#2563eb", marginTop: "4px" }}>
            {metrics.totalCourses}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Across all programmes
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: "16px",
            borderLeft: "4px solid #10b981",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Published Courses
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#10b981", marginTop: "4px" }}>
            {metrics.publishedCourses}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Live in LMS catalogue
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: "16px",
            borderLeft: "4px solid #f59e0b",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Courses in Draft
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#f59e0b", marginTop: "4px" }}>
            {metrics.draftCourses}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Curriculum drafting
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: "16px",
            borderLeft: "4px solid #06b6d4",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Curriculum Complete
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#06b6d4", marginTop: "4px" }}>
            {metrics.completeCourses}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            All content & rubrics
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: "16px",
            borderLeft: "4px solid #8b5cf6",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
            SME Review Required
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#8b5cf6", marginTop: "4px" }}>
            {metrics.reviewReqCourses}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Roadmap / sign-off
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: "16px",
            borderLeft: "4px solid #ef4444",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Incomplete Units
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#ef4444", marginTop: "4px" }}>
            {metrics.incompleteCourses}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Missing modules/rubrics
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: "16px",
            borderLeft: "4px solid #64748b",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("archived")}
          title="Click to view archived / legacy courses"
        >
          <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>
            Archived / Legacy
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#64748b", marginTop: "4px" }}>
            {metrics.totalArchived}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Isolated from catalogue
          </div>
        </div>
      </div>

      {/* ─── Fast Search and Multi-Facet Filter Toolbar ─── */}
      <div className="card" style={{ padding: "18px", marginBottom: "24px" }}>
        {/* Prominent Search Bar */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "1.1rem",
                color: "var(--text-muted)",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              className="form-input"
              style={{
                paddingLeft: "44px",
                paddingRight: "16px",
                height: "44px",
                fontSize: "0.95rem",
                width: "100%",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
              placeholder="Search course title, course code, programme, module, lesson or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>
              PROGRAMME
            </label>
            <select
              className="form-input"
              style={{ height: "36px", fontSize: "0.82rem", width: "100%" }}
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
            >
              <option value="all">All Programmes ({initialProgrammes.length})</option>
              {initialProgrammes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.programme_name} ({p.programme_code})
                </option>
              ))}
              <option value="none">Unassigned / Standalone</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>
              CATEGORY / PARENT GROUP
            </label>
            <select
              className="form-input"
              style={{ height: "36px", fontSize: "0.82rem", width: "100%" }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
              <option value="none">Unassigned Category</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>
              COURSE LEVEL
            </label>
            <select
              className="form-input"
              style={{ height: "36px", fontSize: "0.82rem", width: "100%" }}
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Foundation">Foundation (Level 1)</option>
              <option value="Applied">Applied (Level 2)</option>
              <option value="Specialist">Specialist / Exec (Level 3)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>
              STATUS
            </label>
            <select
              className="form-input"
              style={{ height: "36px", fontSize: "0.82rem", width: "100%" }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Active Statuses ({metrics.totalCourses})</option>
              <option value="draft">Draft ({metrics.draftCourses})</option>
              <option value="published">Published ({metrics.publishedCourses})</option>
              <option value="archived">Archived / Legacy ({metrics.totalArchived})</option>
              <option value="all_including_archived">All (Including Archived)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>
              COMPLETENESS
            </label>
            <select
              className="form-input"
              style={{ height: "36px", fontSize: "0.82rem", width: "100%" }}
              value={selectedCompleteness}
              onChange={(e) => setSelectedCompleteness(e.target.value)}
            >
              <option value="all">All Completeness</option>
              <option value="Complete">Complete ({metrics.completeCourses})</option>
              <option value="Review Required">Review Required ({metrics.reviewReqCourses})</option>
              <option value="Incomplete">Incomplete ({metrics.incompleteCourses})</option>
              <option value="Not Verified">Not Verified</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>
              SME REVIEW
            </label>
            <select
              className="form-input"
              style={{ height: "36px", fontSize: "0.82rem", width: "100%" }}
              value={selectedSmeStatus}
              onChange={(e) => setSelectedSmeStatus(e.target.value)}
            >
              <option value="all">All SME Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending Review">Pending Review ({metrics.reviewReqCourses})</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>
              ASSESSMENTS
            </label>
            <select
              className="form-input"
              style={{ height: "36px", fontSize: "0.82rem", width: "100%" }}
              value={selectedAssessmentsFilter}
              onChange={(e) => setSelectedAssessmentsFilter(e.target.value)}
            >
              <option value="all">All Assessments</option>
              <option value="available">Available (Quiz / Capstone)</option>
              <option value="missing">Missing Assessments</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "3px" }}>
              TRAINER GUIDE
            </label>
            <select
              className="form-input"
              style={{ height: "36px", fontSize: "0.82rem", width: "100%" }}
              value={selectedTrainerGuideFilter}
              onChange={(e) => setSelectedTrainerGuideFilter(e.target.value)}
            >
              <option value="all">All Guides</option>
              <option value="available">Available</option>
              <option value="missing">Missing Guide</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Clear Action */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "16px",
            paddingTop: "12px",
            borderTop: "1px solid var(--border-light)",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Showing <strong>{filteredCourses.length}</strong> of <strong>{courses.length}</strong> courses matching active filters
          </div>
          <button
            onClick={handleClearFilters}
            className="btn btn-secondary"
            style={{ fontSize: "0.8rem", padding: "4px 12px" }}
          >
            ✕ Clear All Filters
          </button>
        </div>
      </div>

      {/* ─── Top-Level 9 Navigation Tabs ─── */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid var(--border)",
          marginBottom: "24px",
          gap: "4px",
          overflowX: "auto",
          paddingBottom: "1px",
        }}
      >
        {[
          { key: "overview", label: "Overview", icon: "📊" },
          { key: "programmes", label: "Programmes", icon: "🎯" },
          { key: "parent_courses", label: "Parent Courses", icon: "📂" },
          { key: "all_courses", label: "All Courses", icon: "📚" },
          { key: "tree_view", label: "Curriculum Builder", icon: "🌳" },
          { key: "assessments", label: "Assessments", icon: "📝" },
          { key: "trainer_materials", label: "Trainer Materials", icon: "👨‍🏫" },
          { key: "learner_materials", label: "Learner Materials", icon: "📖" },
          { key: "review", label: "Review & Publication", icon: "✅" },
          { key: "archived", label: "Archived & Legacy", icon: "🏛️" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                border: "none",
                background: "transparent",
                borderBottom: isActive ? "3px solid #2563eb" : "3px solid transparent",
                color: isActive ? "#2563eb" : "var(--text-secondary)",
                fontWeight: isActive ? "700" : "500",
                fontSize: "0.88rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: OVERVIEW ─── */}
      {activeTab === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Quick Programme Breakdown Cards */}
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "14px", color: "var(--text-primary)" }}>
              Curriculum by Parent Programme
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
              {initialProgrammes.map((prog) => {
                const progCourses = courses.filter((c) => c.programme_id === prog.id);
                const completeProgCourses = progCourses.filter((c) => c.completeness === "Complete").length;
                const draftProgCourses = progCourses.filter((c) => c.status === "draft").length;
                const totalModules = progCourses.reduce((sum, c) => sum + (c.modules_count || 0), 0);

                return (
                  <div
                    key={prog.id}
                    className="card"
                    style={{
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      borderTop: "4px solid #1b3a6b",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "0.75rem", fontFamily: "monospace", background: "var(--surface-alt)", padding: "2px 8px", borderRadius: "4px" }}>
                          {prog.programme_code}
                        </span>
                        <span className="badge badge-primary">{progCourses.length} Courses</span>
                      </div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "6px" }}>
                        {prog.programme_name}
                      </h3>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                        Domain: {prog.category || "Universal Skills"} • Status: {prog.status.toUpperCase()}
                      </p>
                    </div>

                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", background: "var(--surface)", padding: "10px", borderRadius: "8px", fontSize: "0.78rem", marginBottom: "14px" }}>
                        <div>
                          <span style={{ color: "var(--text-muted)", display: "block" }}>Complete</span>
                          <strong>{completeProgCourses}</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-muted)", display: "block" }}>Draft</span>
                          <strong>{draftProgCourses}</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-muted)", display: "block" }}>Modules</span>
                          <strong>{totalModules}</strong>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => {
                            setSelectedProgramme(prog.id);
                            setActiveTab("all_courses");
                          }}
                          className="btn btn-secondary"
                          style={{ flex: 1, fontSize: "0.8rem", textAlign: "center" }}
                        >
                          View {progCourses.length} Courses
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProgramme(prog.id);
                            setActiveTab("tree_view");
                          }}
                          className="btn btn-primary"
                          style={{ flex: 1, fontSize: "0.8rem", textAlign: "center" }}
                        >
                          Curriculum Tree
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Standalone / Micro-credential Highlights */}
          {courses.some((c) => !c.programme_id) && (
            <div className="card" style={{ padding: "20px", borderLeft: "4px solid #10b981" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                    ⭐ Independent Micro-Credentials & Standalone Courses
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                    Includes <strong>SPM-LMS-MC-001 (Startup Launch Essentials)</strong> and specialized industry credentials.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedProgramme("none");
                    setActiveTab("all_courses");
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.82rem" }}
                >
                  View Standalone Courses ({courses.filter((c) => !c.programme_id).length})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: PROGRAMMES ─── */}
      {activeTab === "programmes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
              Programmes Hierarchy & Enrolled Course Lists
            </h2>
            <Link href="/programmes" className="btn btn-secondary" style={{ fontSize: "0.82rem" }}>
              ⚙️ Manage Programmes Configuration
            </Link>
          </div>

          {initialProgrammes.map((prog) => {
            const isExpanded = Boolean(expandedProgrammes[prog.programme_code]);
            const progCourses = filteredCourses.filter((c) => c.programme_id === prog.id);

            return (
              <div key={prog.id} className="card" style={{ padding: "0", overflow: "hidden" }}>
                <div
                  onClick={() => toggleProgrammeExpand(prog.programme_code)}
                  style={{
                    padding: "16px 20px",
                    background: "linear-gradient(90deg, #1e293b 0%, #0f172a 100%)",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "1.2rem", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}>
                      ▶
                    </span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.75rem", fontFamily: "monospace", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "4px" }}>
                          {prog.programme_code}
                        </span>
                        <span style={{ fontSize: "1.05rem", fontWeight: "700" }}>{prog.programme_name}</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "2px" }}>
                        Category: {prog.category} • Status: {prog.status}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="badge badge-primary">{progCourses.length} Courses</span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: "20px" }}>
                    {progCourses.length === 0 ? (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>
                        No courses match current search or filters for this programme.
                      </p>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table className="table" style={{ width: "100%", fontSize: "0.85rem" }}>
                          <thead>
                            <tr style={{ background: "var(--surface)", textAlign: "left" }}>
                              <th style={{ padding: "10px 14px" }}>Course Code</th>
                              <th style={{ padding: "10px 14px" }}>Course Title</th>
                              <th style={{ padding: "10px 14px" }}>Category / Parent</th>
                              <th style={{ padding: "10px 14px" }}>Level</th>
                              <th style={{ padding: "10px 14px" }}>Modules</th>
                              <th style={{ padding: "10px 14px" }}>Completeness</th>
                              <th style={{ padding: "10px 14px" }}>Status</th>
                              <th style={{ padding: "10px 14px", textAlign: "right" }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {progCourses.map((c) => (
                              <tr key={c.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                                <td style={{ padding: "10px 14px", fontFamily: "monospace", fontWeight: "600" }}>
                                  {c.course_code}
                                </td>
                                <td style={{ padding: "10px 14px", fontWeight: "600" }}>
                                  <button
                                    onClick={() => setInspectedCourse(c)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "var(--primary-light)",
                                      cursor: "pointer",
                                      textAlign: "left",
                                      fontWeight: "600",
                                      padding: 0,
                                    }}
                                  >
                                    {c.title}
                                  </button>
                                </td>
                                <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>
                                  {c.category || "Unassigned"}
                                </td>
                                <td style={{ padding: "10px 14px" }}>
                                  <span className="badge badge-neutral">{c.level || "Beginner"}</span>
                                </td>
                                <td style={{ padding: "10px 14px" }}>
                                  {c.modules_count} mod • {c.lessons_count} les
                                </td>
                                <td style={{ padding: "10px 14px" }}>
                                  <span
                                    className={`badge ${
                                      c.completeness === "Complete"
                                        ? "badge-success"
                                        : c.completeness === "Review Required"
                                        ? "badge-primary"
                                        : "badge-warning"
                                    }`}
                                  >
                                    {c.completeness}
                                  </span>
                                </td>
                                <td style={{ padding: "10px 14px" }}>
                                  <span className={`badge ${c.status === "published" ? "badge-success" : "badge-neutral"}`}>
                                    {c.status.toUpperCase()}
                                  </span>
                                </td>
                                <td style={{ padding: "10px 14px", textAlign: "right" }}>
                                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                                    <button
                                      onClick={() => setInspectedCourse(c)}
                                      className="btn btn-secondary"
                                      style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                                    >
                                      Inspect
                                    </button>
                                    <Link
                                      href={`/courses/${c.id}`}
                                      className="btn btn-primary"
                                      style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                                    >
                                      Edit
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── TAB 3: PARENT COURSES & CATEGORIES ─── */}
      {activeTab === "parent_courses" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
                Parent Course & Subject Category Groupings
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Organise and manage child courses under parent thematic umbrellas without affecting database programme identities.
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  const allExpanded: Record<string, boolean> = {};
                  categories.forEach((c) => (allExpanded[c.id] = true));
                  setExpandedCategories(allExpanded);
                }}
                className="btn btn-secondary"
                style={{ fontSize: "0.8rem" }}
              >
                Expand All
              </button>
              <button
                onClick={() => setExpandedCategories({})}
                className="btn btn-secondary"
                style={{ fontSize: "0.8rem" }}
              >
                Collapse All
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {categories.map((cat) => {
              const isExpanded = Boolean(expandedCategories[cat.id]);
              const groupCourses = filteredCourses.filter(
                (c) => c.category_id === cat.id || c.category === cat.name
              );

              return (
                <div key={cat.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                  <div
                    onClick={() => toggleCategoryExpand(cat.id)}
                    style={{
                      padding: "16px 20px",
                      background: "linear-gradient(90deg, #0d7063 0%, #115e59 100%)",
                      color: "#fff",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "1.1rem", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}>
                        ▶
                      </span>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "0.75rem", fontFamily: "monospace", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "4px" }}>
                            {cat.code}
                          </span>
                          <span style={{ fontSize: "1.05rem", fontWeight: "700" }}>{cat.name}</span>
                        </div>
                        {cat.description && (
                          <div style={{ fontSize: "0.78rem", color: "#ccfbf1", marginTop: "2px" }}>
                            {cat.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="badge" style={{ background: "rgba(255,255,255,0.25)", color: "#fff" }}>
                        {groupCourses.length} Child Courses
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: "20px" }}>
                      {groupCourses.length === 0 ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>
                          No child courses currently assigned to this category.
                        </p>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                          {groupCourses.map((c) => (
                            <div
                              key={c.id}
                              className="card"
                              style={{
                                padding: "16px",
                                border: "1px solid var(--border)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                              }}
                            >
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                  <span style={{ fontSize: "0.72rem", fontFamily: "monospace", background: "var(--surface)", padding: "2px 6px", borderRadius: "4px" }}>
                                    {c.course_code}
                                  </span>
                                  <span className={`badge ${c.completeness === "Complete" ? "badge-success" : "badge-neutral"}`} style={{ fontSize: "0.7rem" }}>
                                    {c.completeness}
                                  </span>
                                </div>
                                <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "4px" }}>
                                  {c.title}
                                </h4>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                                  Programme: {c.programmes?.programme_name || "Independent"}
                                </div>
                              </div>

                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "10px" }}>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                  {c.modules_count} mod • {c.learning_hours || 0} hrs
                                </span>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button
                                    onClick={() => setInspectedCourse(c)}
                                    className="btn btn-secondary"
                                    style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                                  >
                                    Inspect
                                  </button>
                                  <Link
                                    href={`/courses/${c.id}`}
                                    className="btn btn-primary"
                                    style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                                  >
                                    Workspace
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 4: ALL COURSES (Comprehensive Table & Bulk Actions) ─── */}
      {activeTab === "all_courses" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Bulk Action Controls Bar */}
          <div
            className="card"
            style={{
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              background: selectedCourseIds.length > 0 ? "#eff6ff" : "var(--card)",
              border: selectedCourseIds.length > 0 ? "1px solid #93c5fd" : "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                type="checkbox"
                checked={selectedCourseIds.length === filteredCourses.length && filteredCourses.length > 0}
                onChange={handleSelectAll}
                id="select-all-courses"
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label htmlFor="select-all-courses" style={{ fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}>
                {selectedCourseIds.length > 0
                  ? `${selectedCourseIds.length} courses selected`
                  : `Select all ${filteredCourses.length} filtered courses`}
              </label>
            </div>

            {selectedCourseIds.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Bulk Operations:</span>

                {/* Bulk Category Assign */}
                <select
                  className="form-input"
                  style={{ height: "32px", fontSize: "0.8rem" }}
                  value={bulkCategoryTarget}
                  onChange={(e) => setBulkCategoryTarget(e.target.value)}
                >
                  <option value="">Assign Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="none">Remove Category</option>
                </select>
                <button
                  onClick={handleBulkAssignCategory}
                  disabled={!bulkCategoryTarget || isProcessingBulk}
                  className="btn btn-secondary"
                  style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                >
                  Apply Category
                </button>

                {/* Bulk Status Update */}
                <select
                  className="form-input"
                  style={{ height: "32px", fontSize: "0.8rem" }}
                  value={bulkStatusTarget}
                  onChange={(e) => setBulkStatusTarget(e.target.value as any)}
                >
                  <option value="published">Publish Courses</option>
                  <option value="draft">Revert to Draft</option>
                  <option value="archived">Archive Courses</option>
                </select>
                <button
                  onClick={handleBulkUpdateStatus}
                  disabled={isProcessingBulk}
                  className="btn btn-primary"
                  style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                >
                  Update Status
                </button>
              </div>
            )}
          </div>

          {bulkMessage && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "6px",
                background: bulkMessage.startsWith("Error") ? "var(--danger-bg)" : "var(--success-bg)",
                color: bulkMessage.startsWith("Error") ? "var(--danger)" : "var(--success)",
                fontSize: "0.85rem",
                fontWeight: "500",
              }}
            >
              {bulkMessage}
            </div>
          )}

          {/* Master Table */}
          <div className="card" style={{ padding: "0", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="table" style={{ width: "100%", fontSize: "0.83rem", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                    <th style={{ padding: "12px 14px", width: "40px" }}></th>
                    <th
                      onClick={() => {
                        setSortField("title");
                        setSortAsc(!sortAsc);
                      }}
                      style={{ padding: "12px 14px", cursor: "pointer", userSelect: "none" }}
                    >
                      Course Title & Code {sortField === "title" && (sortAsc ? "▲" : "▼")}
                    </th>
                    <th
                      onClick={() => {
                        setSortField("programme");
                        setSortAsc(!sortAsc);
                      }}
                      style={{ padding: "12px 14px", cursor: "pointer", userSelect: "none" }}
                    >
                      Programme {sortField === "programme" && (sortAsc ? "▲" : "▼")}
                    </th>
                    <th style={{ padding: "12px 14px" }}>Category</th>
                    <th style={{ padding: "12px 14px" }}>Curriculum</th>
                    <th style={{ padding: "12px 14px" }}>Hours</th>
                    <th style={{ padding: "12px 14px" }}>Trainer Guide</th>
                    <th style={{ padding: "12px 14px" }}>Learner Mat.</th>
                    <th style={{ padding: "12px 14px" }}>Assessment</th>
                    <th style={{ padding: "12px 14px" }}>SME Review</th>
                    <th
                      onClick={() => {
                        setSortField("status");
                        setSortAsc(!sortAsc);
                      }}
                      style={{ padding: "12px 14px", cursor: "pointer", userSelect: "none" }}
                    >
                      Status {sortField === "status" && (sortAsc ? "▲" : "▼")}
                    </th>
                    <th
                      onClick={() => {
                        setSortField("completeness");
                        setSortAsc(!sortAsc);
                      }}
                      style={{ padding: "12px 14px", cursor: "pointer", userSelect: "none" }}
                    >
                      Completeness {sortField === "completeness" && (sortAsc ? "▲" : "▼")}
                    </th>
                    <th style={{ padding: "12px 14px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan={13} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                        No courses found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((c) => {
                      const isSelected = selectedCourseIds.includes(c.id);
                      return (
                        <tr
                          key={c.id}
                          style={{
                            borderBottom: "1px solid var(--border-light)",
                            background: isSelected ? "#f0f7ff" : "transparent",
                          }}
                        >
                          <td style={{ padding: "10px 14px" }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectCourse(c.id)}
                              style={{ cursor: "pointer" }}
                            />
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <button
                                onClick={() => setInspectedCourse(c)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  color: "var(--primary)",
                                  fontWeight: "700",
                                  textAlign: "left",
                                  cursor: "pointer",
                                  fontSize: "0.86rem",
                                }}
                              >
                                {c.title}
                              </button>
                              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                                {c.course_code}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>
                            {c.programmes?.programme_name || "Independent"}
                          </td>
                          <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>
                            {c.category || "Unassigned"}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ fontWeight: "600" }}>{c.modules_count}</span> mod •{" "}
                            <span style={{ fontWeight: "600" }}>{c.lessons_count}</span> les
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            {c.learning_hours || c.contact_hours || 0} hrs
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            {c.trainer_guides_count > 0 ? (
                              <span style={{ color: "#16a34a", fontWeight: "600" }}>✓ Available</span>
                            ) : (
                              <span style={{ color: "var(--text-muted)" }}>Missing</span>
                            )}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            {c.learner_contents_count > 0 || c.contents_count > 0 ? (
                              <span style={{ color: "#16a34a", fontWeight: "600" }}>✓ Available</span>
                            ) : (
                              <span style={{ color: "var(--text-muted)" }}>Incomplete</span>
                            )}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            {c.practical_assessments_count > 0 ? (
                              <span style={{ color: "#2563eb", fontWeight: "600" }}>Capstone ({c.practical_assessments_count})</span>
                            ) : c.quizzes_count > 0 ? (
                              <span style={{ color: "#0d7063", fontWeight: "600" }}>Quiz ({c.quizzes_count})</span>
                            ) : (
                              <span style={{ color: "var(--text-muted)" }}>Missing</span>
                            )}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <span
                              className={`badge ${c.sme_status === "Approved" ? "badge-success" : "badge-warning"}`}
                              style={{ fontSize: "0.72rem" }}
                            >
                              {c.sme_status}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <span
                              className={`badge ${c.status === "published" ? "badge-success" : "badge-neutral"}`}
                              style={{ fontSize: "0.72rem" }}
                            >
                              {c.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <span
                              className={`badge ${
                                c.completeness === "Complete"
                                  ? "badge-success"
                                  : c.completeness === "Review Required"
                                  ? "badge-primary"
                                  : "badge-warning"
                              }`}
                              style={{ fontSize: "0.72rem" }}
                            >
                              {c.completeness}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => setInspectedCourse(c)}
                                className="btn btn-secondary"
                                style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                              >
                                View
                              </button>
                              <Link
                                href={`/courses/${c.id}`}
                                className="btn btn-primary"
                                style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                              >
                                Edit
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: CURRICULUM TREE VIEW ─── */}
      {activeTab === "tree_view" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
                Curriculum Hierarchy Tree View
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Collapsible structure: Programme → Subject Category → Course → Module → Lesson → Content/Assessment
              </p>
            </div>
          </div>

          <div className="card" style={{ padding: "24px" }}>
            {initialProgrammes.map((prog) => {
              const progCourses = filteredCourses.filter((c) => c.programme_id === prog.id);
              if (progCourses.length === 0) return null;

              return (
                <div key={prog.id} style={{ marginBottom: "28px" }}>
                  {/* Root Programme Level */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 14px",
                      background: "#1e293b",
                      color: "#fff",
                      borderRadius: "6px",
                      fontWeight: "700",
                      fontSize: "0.95rem",
                    }}
                  >
                    <span>🏛️</span>
                    <span>{prog.programme_name}</span>
                    <span style={{ fontSize: "0.75rem", fontFamily: "monospace", opacity: 0.75 }}>
                      [{prog.programme_code}]
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: "0.75rem", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "10px" }}>
                      {progCourses.length} Courses
                    </span>
                  </div>

                  {/* Course Children */}
                  <div style={{ paddingLeft: "24px", borderLeft: "2px dashed #cbd5e1", marginLeft: "14px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    {progCourses.map((course) => {
                      const modules = course.course_modules || [];

                      return (
                        <div key={course.id} style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "1.1rem" }}>📘</span>
                              <button
                                onClick={() => setInspectedCourse(course)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  padding: 0,
                                  fontWeight: "700",
                                  fontSize: "0.92rem",
                                  color: "var(--primary)",
                                  cursor: "pointer",
                                  textAlign: "left",
                                }}
                              >
                                {course.title}
                              </button>
                              <span style={{ fontSize: "0.72rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                                ({course.course_code})
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <span className={`badge ${course.completeness === "Complete" ? "badge-success" : "badge-warning"}`} style={{ fontSize: "0.7rem" }}>
                                {course.completeness}
                              </span>
                              <Link
                                href={`/courses/${course.id}`}
                                className="btn btn-secondary"
                                style={{ padding: "2px 8px", fontSize: "0.72rem" }}
                              >
                                Workspace
                              </Link>
                            </div>
                          </div>

                          {/* Modules Level */}
                          {modules.length === 0 ? (
                            <div style={{ padding: "10px 14px", color: "var(--text-muted)", fontSize: "0.78rem", fontStyle: "italic" }}>
                              No modules configured yet.
                            </div>
                          ) : (
                            <div style={{ paddingLeft: "20px", borderLeft: "2px dashed #94a3b8", marginLeft: "8px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                              {modules.map((mod, modIdx) => {
                                const isModExpanded = Boolean(expandedTreeModules[mod.id]);
                                const lessons = mod.course_lessons || [];

                                return (
                                  <div key={mod.id} style={{ background: "#ffffff", borderRadius: "6px", border: "1px solid var(--border-light)", overflow: "hidden" }}>
                                    <div
                                      onClick={() => toggleTreeModuleExpand(mod.id)}
                                      style={{
                                        padding: "8px 12px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        background: "#f1f5f9",
                                        userSelect: "none",
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.84rem", fontWeight: "600" }}>
                                        <span style={{ transform: isModExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.1s ease", fontSize: "0.75rem" }}>
                                          ▶
                                        </span>
                                        <span>
                                          Module {modIdx + 1}: {mod.title}
                                        </span>
                                      </div>
                                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                        {lessons.length} lessons
                                      </span>
                                    </div>

                                    {isModExpanded && (
                                      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {lessons.length === 0 ? (
                                          <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                            No lessons inside this module.
                                          </div>
                                        ) : (
                                          lessons.map((lesson, lIdx) => (
                                            <div
                                              key={lesson.id}
                                              style={{
                                                padding: "6px 10px",
                                                background: "var(--surface)",
                                                borderRadius: "4px",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                fontSize: "0.78rem",
                                              }}
                                            >
                                              <div>
                                                <strong>Lesson {lIdx + 1}:</strong> {lesson.title}
                                              </div>
                                              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                                                  {lesson.duration_min} mins
                                                </span>
                                                <span style={{ color: "var(--text-secondary)", fontSize: "0.72rem" }}>
                                                  {(lesson.course_contents || []).length} content items
                                                </span>
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Practical Assessment Capstone */}
                          {(course.practical_assessments || []).length > 0 && (
                            <div style={{ marginTop: "10px", padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span>🎯</span>
                                <strong>Capstone Assessment:</strong>{" "}
                                <span>{course.practical_assessments![0].title}</span>
                              </div>
                              <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>
                                Pass: {course.practical_assessments![0].pass_mark}%
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 6: ASSESSMENTS ─── */}
      {activeTab === "assessments" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
                Course Assessments & Rubrics Overview
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Inspection of formative knowledge check quizzes and summative practical capstones.
              </p>
            </div>
            <Link href="/practical-assessments" className="btn btn-secondary" style={{ fontSize: "0.82rem" }}>
              📝 Practical Assessments Hub
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
            {filteredCourses
              .filter((c) => c.practical_assessments_count > 0 || c.quizzes_count > 0)
              .map((c) => (
                <div key={c.id} className="card" style={{ padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.72rem", fontFamily: "monospace", background: "var(--surface)", padding: "2px 6px", borderRadius: "4px" }}>
                      {c.course_code}
                    </span>
                    <span className="badge badge-primary">{c.programmes?.programme_name || "Independent"}</span>
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: "700", marginBottom: "10px" }}>
                    {c.title}
                  </h3>

                  <div style={{ background: "var(--surface)", padding: "12px", borderRadius: "6px", fontSize: "0.8rem", marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span>Practical Capstones:</span>
                      <strong>{c.practical_assessments_count}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span>Formative Quizzes:</span>
                      <strong>{c.quizzes_count}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Minimum Pass Mark:</span>
                      <strong>{c.min_pass_score || 60}%</strong>
                    </div>
                  </div>

                  {c.practical_assessments && c.practical_assessments.length > 0 && (
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                      <strong>Active Capstone:</strong> {c.practical_assessments[0].title}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setInspectedCourse(c)}
                      className="btn btn-secondary"
                      style={{ flex: 1, fontSize: "0.78rem" }}
                    >
                      View Details
                    </button>
                    <Link
                      href={`/courses/${c.id}`}
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: "0.78rem", textAlign: "center" }}
                    >
                      Manage Rubrics
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ─── TAB 7: TRAINER MATERIALS ─── */}
      {activeTab === "trainer_materials" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
              Trainer Delivery Manuals & Teaching Guidance
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Inspect pedagogical guides, presentation outlines, answer keys and facilitation notes.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", fontSize: "0.84rem" }}>
              <thead>
                <tr style={{ background: "var(--surface)", textAlign: "left" }}>
                  <th style={{ padding: "10px 14px" }}>Course Code</th>
                  <th style={{ padding: "10px 14px" }}>Course Title</th>
                  <th style={{ padding: "10px 14px" }}>Programme</th>
                  <th style={{ padding: "10px 14px" }}>Trainer Guide Items</th>
                  <th style={{ padding: "10px 14px" }}>Status</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "10px 14px", fontFamily: "monospace", fontWeight: "600" }}>
                      {c.course_code}
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: "600" }}>{c.title}</td>
                    <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>
                      {c.programmes?.programme_name || "Independent"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {c.trainer_guides_count > 0 ? (
                        <span style={{ color: "#16a34a", fontWeight: "600" }}>
                          ✓ {c.trainer_guides_count} Guides Configured
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>Missing Trainer Guide</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span className={`badge ${c.trainer_guides_count > 0 ? "badge-success" : "badge-warning"}`}>
                        {c.trainer_guides_count > 0 ? "AVAILABLE" : "INCOMPLETE"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <Link
                        href={`/courses/${c.id}`}
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                      >
                        Open Editor
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 8: LEARNER MATERIALS ─── */}
      {activeTab === "learner_materials" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
              Learner Materials & Course Workbooks
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Inspect syllabus, student readings, workbooks, video materials and interactive practice.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%", fontSize: "0.84rem" }}>
              <thead>
                <tr style={{ background: "var(--surface)", textAlign: "left" }}>
                  <th style={{ padding: "10px 14px" }}>Course Code</th>
                  <th style={{ padding: "10px 14px" }}>Course Title</th>
                  <th style={{ padding: "10px 14px" }}>Modules</th>
                  <th style={{ padding: "10px 14px" }}>Lessons</th>
                  <th style={{ padding: "10px 14px" }}>Total Content Items</th>
                  <th style={{ padding: "10px 14px" }}>Learner Experience</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "10px 14px", fontFamily: "monospace", fontWeight: "600" }}>
                      {c.course_code}
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: "600" }}>{c.title}</td>
                    <td style={{ padding: "10px 14px" }}>{c.modules_count}</td>
                    <td style={{ padding: "10px 14px" }}>{c.lessons_count}</td>
                    <td style={{ padding: "10px 14px" }}>{c.contents_count}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span className={`badge ${c.contents_count > 0 ? "badge-success" : "badge-warning"}`}>
                        {c.contents_count > 0 ? "CONTENT READY" : "EMPTY"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <Link
                          href={`/courses/${c.id}/learn`}
                          className="btn btn-primary"
                          style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                        >
                          ▶ Learner View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 9: REVIEW & PUBLICATION ─── */}
      {activeTab === "review" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
              Quality Assurance & Publication Approval Workflow
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Ensure syllabus, SME reviews, formative assessments and practical capstones meet accreditation standards before public release.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
            {filteredCourses.map((c) => {
              const chk = c.checklist;
              const allPassed =
                chk.course_info && chk.modules && chk.lessons && chk.assessments && chk.sme_reviewed;

              return (
                <div key={c.id} className="card" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <span style={{ fontSize: "0.72rem", fontFamily: "monospace", background: "var(--surface)", padding: "2px 6px", borderRadius: "4px" }}>
                        {c.course_code}
                      </span>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "700", marginTop: "4px" }}>{c.title}</h3>
                    </div>
                    <span className={`badge ${c.status === "published" ? "badge-success" : "badge-neutral"}`}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                    Programme: {c.programmes?.programme_name || "Independent"}
                  </div>

                  <div style={{ background: "var(--surface)", padding: "12px", borderRadius: "8px", fontSize: "0.78rem", marginBottom: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Course Info & Outcomes:</span>
                      <strong style={{ color: chk.course_info ? "#16a34a" : "#ef4444" }}>
                        {chk.course_info ? "✓ Pass" : "✕ Missing"}
                      </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Modules ({c.modules_count}) & Lessons ({c.lessons_count}):</span>
                      <strong style={{ color: chk.modules && chk.lessons ? "#16a34a" : "#ef4444" }}>
                        {chk.modules && chk.lessons ? "✓ Pass" : "✕ Missing"}
                      </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Assessments (Quiz / Practical):</span>
                      <strong style={{ color: chk.assessments ? "#16a34a" : "#ef4444" }}>
                        {chk.assessments ? "✓ Pass" : "✕ Missing"}
                      </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>SME Verification:</span>
                      <strong style={{ color: chk.sme_reviewed ? "#16a34a" : "#f59e0b" }}>
                        {chk.sme_reviewed ? "✓ Signed Off" : "⏳ Pending"}
                      </strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setInspectedCourse(c)}
                      className="btn btn-secondary"
                      style={{ flex: 1, fontSize: "0.78rem" }}
                    >
                      Audit Checklist
                    </button>
                    {c.status === "draft" ? (
                      <button
                        onClick={async () => {
                          await bulkUpdateStatus([c.id], "published");
                          setCourses((prev) =>
                            prev.map((item) => (item.id === c.id ? { ...item, status: "published" } : item))
                          );
                        }}
                        disabled={!allPassed}
                        className="btn btn-primary"
                        style={{ flex: 1, fontSize: "0.78rem", opacity: allPassed ? 1 : 0.6 }}
                      >
                        Publish Course
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          await bulkUpdateStatus([c.id], "draft");
                          setCourses((prev) =>
                            prev.map((item) => (item.id === c.id ? { ...item, status: "draft" } : item))
                          );
                        }}
                        className="btn btn-secondary"
                        style={{ flex: 1, fontSize: "0.78rem" }}
                      >
                        Revert to Draft
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 10: ARCHIVED & LEGACY COURSES ─── */}
      {activeTab === "archived" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Historical Vault Notice Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
              color: "#fff",
              padding: "24px 28px",
              borderRadius: "12px",
              border: "1px solid #475569",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span style={{ fontSize: "1.6rem" }}>🏛️</span>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
                  Archived & Legacy Curriculum Vault
                </h2>
                <div style={{ fontSize: "0.82rem", color: "#cbd5e1", marginTop: "2px" }}>
                  Isolated from active LMS catalogues, public student discovery, search indices, and new enrolment workflows
                </div>
              </div>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6, margin: "8px 0 0 0", maxWidth: "950px" }}>
              Courses listed here are preserved for historical auditability and credential verification. Under the zero-destructive policy,
              all underlying modules, lessons, practical assessments, and historically issued certificates remain permanently intact and verifiable in PostgreSQL.
            </p>
          </div>

          {/* Archived Courses Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "18px" }}>
            {courses
              .filter((c) => c.is_archived || c.status === "archived")
              .map((c) => (
                <div
                  key={c.id}
                  className="card"
                  style={{
                    padding: "24px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          fontFamily: "monospace",
                          background: "#e2e8f0",
                          color: "#334155",
                          padding: "3px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {c.course_code}
                      </span>
                      <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", marginTop: "6px" }}>
                        {c.title}
                      </h3>
                    </div>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        background: "#fee2e2",
                        color: "#991b1b",
                        border: "1px solid #fecaca",
                      }}
                    >
                      ARCHIVED / LEGACY
                    </span>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.5, marginBottom: "16px", flex: 1 }}>
                    {c.description}
                  </p>

                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "14px",
                      fontSize: "0.8rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Programme Association:</span>
                      <strong style={{ color: "#0f172a" }}>Independent / Unassigned (Excluded from GLCP)</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Modular Structure:</span>
                      <strong style={{ color: "#0f172a" }}>{c.modules_count} Modules • {c.lessons_count} Lessons</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Summative Capstone:</span>
                      <strong style={{ color: "#16a34a" }}>1 Practical Assessment (100-pt Rubric)</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Issued Credentials:</span>
                      <strong style={{ color: "#2563eb" }}>12 Certificates Intact & Protected</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Archival Status:</span>
                      <strong style={{ color: "#b91c1c" }}>Hidden from Public Catalogue</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => setInspectedCourse(c)}
                      className="btn btn-secondary"
                      style={{ flex: 1, fontSize: "0.85rem" }}
                    >
                      🔍 Inspect Curriculum Outline
                    </button>
                    <Link
                      href="/certificates"
                      className="btn btn-secondary"
                      style={{ flex: 1, fontSize: "0.85rem", textAlign: "center" }}
                    >
                      📜 View Issued Certs (12)
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ─── MODAL / DRAWER: Course Details Workspace ─── */}
      {inspectedCourse && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "880px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "0",
              borderRadius: "12px",
              background: "#ffffff",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "24px 28px",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.8rem", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "4px", fontFamily: "monospace" }}>
                    {inspectedCourse.course_code}
                  </span>
                  <span className={`badge ${inspectedCourse.status === "published" ? "badge-success" : "badge-warning"}`}>
                    {inspectedCourse.status.toUpperCase()}
                  </span>
                  <span className="badge badge-primary">{inspectedCourse.level || "Beginner"}</span>
                </div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#fff", margin: 0 }}>
                  {inspectedCourse.title}
                </h2>
                <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "4px" }}>
                  Programme: <strong>{inspectedCourse.programmes?.programme_name || "Independent Micro-Credential"}</strong> • Category: <strong>{inspectedCourse.category || "General"}</strong>
                </div>
              </div>

              <button
                onClick={() => setInspectedCourse(null)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "#fff",
                  fontSize: "1.2rem",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "28px" }}>
              {/* Metadata Highlights */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: "12px",
                  marginBottom: "20px",
                  background: "var(--surface)",
                  padding: "16px",
                  borderRadius: "8px",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Curriculum Completeness</span>
                  <strong style={{ color: inspectedCourse.completeness === "Complete" ? "#16a34a" : "#f59e0b" }}>
                    {inspectedCourse.completeness}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Configured Hours</span>
                  <strong>{inspectedCourse.learning_hours || inspectedCourse.contact_hours || 0} hrs</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Modules & Lessons</span>
                  <strong>{inspectedCourse.modules_count} mod • {inspectedCourse.lessons_count} les</strong>
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>SME Review Status</span>
                  <strong>{inspectedCourse.sme_status}</strong>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "6px" }}>Course Description</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {inspectedCourse.description || "No description provided."}
                </p>
              </div>

              {/* Completeness Checklist */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "8px" }}>Completeness Checklist</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{inspectedCourse.checklist.course_info ? "✅" : "❌"}</span>
                    <span>Course Information & Learning Outcomes</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{inspectedCourse.checklist.modules ? "✅" : "❌"}</span>
                    <span>Modular Structure Defined</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{inspectedCourse.checklist.lessons ? "✅" : "❌"}</span>
                    <span>Substantive Lessons Created</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{inspectedCourse.checklist.learner_content ? "✅" : "❌"}</span>
                    <span>Learner Workbooks & Reading Materials</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{inspectedCourse.checklist.trainer_guidance ? "✅" : "❌"}</span>
                    <span>Trainer Delivery Guide & Teaching Notes</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{inspectedCourse.checklist.assessments ? "✅" : "❌"}</span>
                    <span>Assessments & Rubrics Available</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{inspectedCourse.checklist.learning_hours ? "✅" : "❌"}</span>
                    <span>Configured Learning Hours</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{inspectedCourse.checklist.sme_reviewed ? "✅" : "❌"}</span>
                    <span>Subject-Matter Expert Approval</span>
                  </div>
                </div>
              </div>

              {/* Modules Outline */}
              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "8px" }}>
                  Modules & Curriculum Outline ({inspectedCourse.modules_count})
                </h4>
                {(inspectedCourse.course_modules || []).length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>No modules created yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {(inspectedCourse.course_modules || []).map((m, idx) => (
                      <div key={m.id} style={{ background: "var(--surface)", padding: "10px 14px", borderRadius: "6px", fontSize: "0.82rem" }}>
                        <div style={{ fontWeight: "700", color: "var(--text-primary)" }}>
                          Module {idx + 1}: {m.title}
                        </div>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "2px" }}>
                          {(m.course_lessons || []).length} lessons
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "18px" }}>
                <button
                  onClick={() => setInspectedCourse(null)}
                  className="btn btn-secondary"
                  style={{ fontSize: "0.85rem" }}
                >
                  ← Back to Results
                </button>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Link
                    href={`/courses/${inspectedCourse.id}/learn`}
                    className="btn btn-secondary"
                    style={{ fontSize: "0.85rem" }}
                  >
                    ▶ Launch Course
                  </Link>
                  <Link
                    href={`/courses/${inspectedCourse.id}`}
                    className="btn btn-primary"
                    style={{ fontSize: "0.85rem", fontWeight: "600" }}
                  >
                    Open Full Course Workspace ↗
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
