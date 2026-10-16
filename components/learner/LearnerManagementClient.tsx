"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  UserPlus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  Building2, 
  MapPin, 
  MoreVertical, 
  Eye, 
  Edit3, 
  BookOpen, 
  ExternalLink, 
  X, 
  ChevronRight, 
  LayoutGrid, 
  List,
  Sparkles,
  ArrowUpDown
} from "lucide-react";

interface Participant {
  id: string;
  full_name: string;
  ic_number?: string;
  email?: string;
  phone?: string;
  gender?: string;
  status?: string;
  created_at: string;
  states?: { state_name: string } | null;
  nadi_sites?: { site_name: string } | null;
  course_enrolments?: Array<{
    id: string;
    status: string;
    progress_pct: number;
    enrolled_at?: string;
    courses?: { id: string; title: string; course_code: string } | null;
  }>;
}

interface Props {
  participants: Participant[];
  openInterventions?: any[];
  courses?: any[];
  nadiSites?: any[];
}

type TabType = "all" | "active" | "at_risk" | "completed" | "pending";

export function LearnerManagementClient({ 
  participants = [], 
  openInterventions = [],
  courses = [],
  nadiSites = []
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedLearner, setSelectedLearner] = useState<Participant | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const atRiskParticipantIds = useMemo(() => {
    return new Set(openInterventions.map((i) => i.participant_id));
  }, [openInterventions]);

  // Extract unique states and sites for filters
  const uniqueStates = useMemo(() => {
    const states = participants
      .map((p) => p.states?.state_name)
      .filter((s): s is string => Boolean(s));
    return Array.from(new Set(states)).sort();
  }, [participants]);

  const uniqueSites = useMemo(() => {
    const sites = participants
      .map((p) => p.nadi_sites?.site_name)
      .filter((s): s is string => Boolean(s));
    return Array.from(new Set(sites)).sort();
  }, [participants]);

  // Tab categorization helpers
  const categorized = useMemo(() => {
    const all = participants;
    const active = participants.filter((p) => {
      const hasActiveEnrolment = p.course_enrolments?.some(e => e.status === "active" || e.status === "in_progress");
      return (p.status?.toLowerCase() === "active" || hasActiveEnrolment) && !atRiskParticipantIds.has(p.id);
    });
    const at_risk = participants.filter((p) => {
      const isFlagged = atRiskParticipantIds.has(p.id);
      const isStatusAtRisk = p.status?.toLowerCase() === "at_risk" || p.status?.toLowerCase() === "lagging";
      const hasLaggingEnrolment = p.course_enrolments?.some(e => (e.progress_pct || 0) < 25 && e.status !== "completed");
      return isFlagged || isStatusAtRisk || hasLaggingEnrolment;
    });
    const completed = participants.filter((p) => {
      const hasCompletedCourse = p.course_enrolments?.some(e => e.status === "completed" || (e.progress_pct || 0) >= 100);
      return p.status?.toLowerCase() === "completed" || hasCompletedCourse;
    });
    const pending = participants.filter((p) => {
      const hasNoEnrolment = !p.course_enrolments || p.course_enrolments.length === 0;
      return p.status?.toLowerCase() === "pending" || p.status?.toLowerCase() === "registered" || hasNoEnrolment;
    });

    return { all, active, at_risk, completed, pending };
  }, [participants, atRiskParticipantIds]);

  // Filtered participants according to active tab and search/dropdown filters
  const filteredParticipants = useMemo(() => {
    let list = categorized[activeTab];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        return (
          p.full_name?.toLowerCase().includes(query) ||
          p.ic_number?.toLowerCase().includes(query) ||
          p.email?.toLowerCase().includes(query) ||
          p.phone?.toLowerCase().includes(query) ||
          p.nadi_sites?.site_name?.toLowerCase().includes(query) ||
          p.states?.state_name?.toLowerCase().includes(query)
        );
      });
    }

    if (selectedState !== "all") {
      list = list.filter((p) => p.states?.state_name === selectedState);
    }

    if (selectedSite !== "all") {
      list = list.filter((p) => p.nadi_sites?.site_name === selectedSite);
    }

    if (selectedCourse !== "all") {
      list = list.filter((p) => 
        p.course_enrolments?.some(e => e.courses?.id === selectedCourse || e.courses?.title === selectedCourse)
      );
    }

    return list;
  }, [categorized, activeTab, searchQuery, selectedState, selectedSite, selectedCourse]);

  // Pagination slice
  const paginatedParticipants = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredParticipants.slice(start, start + pageSize);
  }, [filteredParticipants, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredParticipants.length / pageSize) || 1;

  // Export current view as CSV
  const handleExportCSV = () => {
    const headers = ["Full Name", "IC / Passport", "Email", "Phone", "Gender", "NADI Site", "State", "Status", "Enrolled Courses", "Average Progress %", "Registered Date"];
    
    const rows = filteredParticipants.map((p) => {
      const courseTitles = p.course_enrolments?.map(e => e.courses?.title).filter(Boolean).join(" | ") || "None";
      const avgProgress = p.course_enrolments && p.course_enrolments.length > 0
        ? Math.round(p.course_enrolments.reduce((acc, curr) => acc + (curr.progress_pct || 0), 0) / p.course_enrolments.length)
        : 0;
      
      return [
        `"${p.full_name || ''}"`,
        `"${p.ic_number || ''}"`,
        `"${p.email || ''}"`,
        `"${p.phone || ''}"`,
        `"${p.gender || ''}"`,
        `"${p.nadi_sites?.site_name || ''}"`,
        `"${p.states?.state_name || ''}"`,
        `"${p.status || ''}"`,
        `"${courseTitles}"`,
        `${avgProgress}%`,
        `"${new Date(p.created_at).toLocaleDateString()}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `spectrum_learners_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitials = (name?: string) => {
    if (!name) return "L";
    const parts = name.trim().split(" ");
    return parts.length >= 2 
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const getStatusBadge = (p: Participant) => {
    const isAtRisk = atRiskParticipantIds.has(p.id) || p.status?.toLowerCase() === "at_risk";
    if (isAtRisk) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> At-Risk
        </span>
      );
    }
    if (p.status?.toLowerCase() === "completed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Completed
        </span>
      );
    }
    if (p.status?.toLowerCase() === "active") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <Clock className="w-3 h-3 text-slate-500" /> {p.status || "Pending"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-indigo-600 mb-1">
            <Building2 className="w-4 h-4" /> Spectrum Malaysia &bull; Learner Management System
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            Learner Management Hub
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Centralized directory for cohort participants, NADI center enrolments, progress telemetry, and retention interventions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            Import CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
          <Link
            href="/participants/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" />
            + New Learner
          </Link>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Registered</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{categorized.all.length.toLocaleString()}</span>
            <span className="text-xs font-medium text-emerald-600">Nationwide</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Across 1,099 NADI Centers</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-200 transition">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
            <span>Active Enrolled</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-800">{categorized.active.length.toLocaleString()}</span>
            <span className="text-xs font-medium text-emerald-600">
              {categorized.all.length > 0 ? Math.round((categorized.active.length / categorized.all.length) * 100) : 0}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Actively learning this month</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-rose-200 transition">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-700">
            <span>At-Risk / Lagging</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-800">{categorized.at_risk.length.toLocaleString()}</span>
            <span className="text-xs font-medium text-rose-600">Needs Attention</span>
          </div>
          <Link href="/learner-360" className="text-xs font-medium text-indigo-600 hover:underline mt-1 inline-block">
            Open Dropout Radar &rarr;
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-700">
            <span>Completed / Certified</span>
            <GraduationCap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-800">{categorized.completed.length.toLocaleString()}</span>
            <span className="text-xs font-medium text-indigo-600">Graduated</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Micro-credentials issued</p>
        </div>
      </div>

      {/* Neat Tab System Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 px-4 pt-3 pb-0 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
                activeTab === "all"
                  ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <span>🎓 All Learners</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "all" ? "bg-indigo-100 text-indigo-700" : "bg-slate-200/70 text-slate-600"
              }`}>
                {categorized.all.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("active"); setCurrentPage(1); }}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
                activeTab === "active"
                  ? "border-emerald-600 text-emerald-700 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <span>🟢 Active & Enrolled</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200/70 text-slate-600"
              }`}>
                {categorized.active.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("at_risk"); setCurrentPage(1); }}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
                activeTab === "at_risk"
                  ? "border-rose-600 text-rose-700 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <span>⚠️ At-Risk / Lagging</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "at_risk" ? "bg-rose-100 text-rose-800" : "bg-slate-200/70 text-slate-600"
              }`}>
                {categorized.at_risk.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("completed"); setCurrentPage(1); }}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
                activeTab === "completed"
                  ? "border-indigo-600 text-indigo-700 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <span>🏆 Certified / Completed</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "completed" ? "bg-indigo-100 text-indigo-800" : "bg-slate-200/70 text-slate-600"
              }`}>
                {categorized.completed.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("pending"); setCurrentPage(1); }}
              className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2 ${
                activeTab === "pending"
                  ? "border-amber-600 text-amber-700 bg-white rounded-t-lg shadow-2xs"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <span>⏳ Pending Onboarding</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === "pending" ? "bg-amber-100 text-amber-800" : "bg-slate-200/70 text-slate-600"
              }`}>
                {categorized.pending.length}
              </span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 pb-2">
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`p-1.5 rounded-md border text-xs font-medium transition ${
                viewMode === "table"
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid Card View"
              className={`p-1.5 rounded-md border text-xs font-medium transition ${
                viewMode === "grid"
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by learner name, IC number, email, or NADI center..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => { setSelectedState(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-xs sm:text-sm font-medium border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All States</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* NADI Site Filter */}
            <select
              value={selectedSite}
              onChange={(e) => { setSelectedSite(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-xs sm:text-sm font-medium border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[200px] truncate"
            >
              <option value="all">All NADI Sites</option>
              {uniqueSites.map((site) => (
                <option key={site} value={site}>{site}</option>
              ))}
            </select>

            {/* Course Filter */}
            {courses.length > 0 && (
              <select
                value={selectedCourse}
                onChange={(e) => { setSelectedCourse(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 text-xs sm:text-sm font-medium border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[200px] truncate"
              >
                <option value="all">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title || c.course_code}</option>
                ))}
              </select>
            )}

            {(selectedState !== "all" || selectedSite !== "all" || selectedCourse !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedState("all");
                  setSelectedSite("all");
                  setSelectedCourse("all");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Content View: Table or Grid */}
        {filteredParticipants.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No learners match this tab or filter</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              Try adjusting your search criteria or switch to the "All Learners" tab to see all cohort members.
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Learner Profile</th>
                  <th className="py-3 px-4">Malaysian IC / ID</th>
                  <th className="py-3 px-4">NADI Center & State</th>
                  <th className="py-3 px-4">Enrolment & Progress</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedParticipants.map((p) => {
                  const enrolments = p.course_enrolments || [];
                  const activeEnrolment = enrolments[0];
                  const avgProgress = enrolments.length > 0 
                    ? Math.round(enrolments.reduce((acc, curr) => acc + (curr.progress_pct || 0), 0) / enrolments.length)
                    : 0;

                  return (
                    <tr 
                      key={p.id} 
                      className="hover:bg-indigo-50/30 transition group cursor-pointer"
                      onClick={() => setSelectedLearner(p)}
                    >
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {getInitials(p.full_name)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                              {p.full_name}
                              {atRiskParticipantIds.has(p.id) && (
                                <span title="Intervention Alert Active">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              {p.email && <span>{p.email}</span>}
                              {p.phone && <span>&bull; {p.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* IC Number */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                        {p.ic_number || <span className="text-slate-400 italic">Not recorded</span>}
                      </td>

                      {/* NADI Site & State */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                              {p.nadi_sites?.site_name || "Unassigned Site"}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {p.states?.state_name || "Malaysia"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Enrolment & Progress */}
                      <td className="py-3.5 px-4">
                        {enrolments.length > 0 ? (
                          <div className="space-y-1.5 min-w-[150px]">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800 truncate max-w-[120px]" title={activeEnrolment?.courses?.title}>
                                {activeEnrolment?.courses?.title || `${enrolments.length} Course(s)`}
                              </span>
                              <span className="font-bold text-indigo-600">{avgProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  avgProgress >= 80 ? "bg-emerald-500" : avgProgress >= 40 ? "bg-indigo-600" : "bg-amber-500"
                                }`}
                                style={{ width: `${avgProgress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No enrolled courses</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(p)}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedLearner(p)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                            title="Quick Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/learner-360/${p.id}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                            title="Full 360° Intelligence"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/participants/${p.id}/edit`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition"
                            title="Edit Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid Card View */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedParticipants.map((p) => {
              const enrolments = p.course_enrolments || [];
              const avgProgress = enrolments.length > 0 
                ? Math.round(enrolments.reduce((acc, curr) => acc + (curr.progress_pct || 0), 0) / enrolments.length)
                : 0;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedLearner(p)}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-indigo-300 transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {getInitials(p.full_name)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 line-clamp-1">{p.full_name}</h4>
                          <span className="font-mono text-xs text-slate-500 block">{p.ic_number || "No IC"}</span>
                        </div>
                      </div>
                      {getStatusBadge(p)}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{p.nadi_sites?.site_name || "Unassigned NADI"}, {p.states?.state_name || "Malaysia"}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Enrolments:</span>
                        <span className="font-semibold text-slate-800">{enrolments.length} Course(s)</span>
                      </div>
                    </div>

                    {enrolments.length > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-600">Average Progress</span>
                          <span className="text-indigo-600">{avgProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              avgProgress >= 80 ? "bg-emerald-500" : avgProgress >= 40 ? "bg-indigo-600" : "bg-amber-500"
                            }`}
                            style={{ width: `${avgProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/learner-360/${p.id}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      360° Profile &rarr;
                    </Link>
                    <div className="flex gap-1">
                      <Link
                        href={`/admin/learner-assignments?userId=${p.id}`}
                        className="px-2 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        Assign
                      </Link>
                      <Link
                        href={`/participants/${p.id}/edit`}
                        className="px-2 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {filteredParticipants.length > 0 && (
          <div className="p-4 bg-slate-50/75 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, filteredParticipants.length)}</span> of{" "}
              <span className="font-bold text-slate-900">{filteredParticipants.length}</span> learners
            </div>

            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2 py-1 border border-slate-200 rounded bg-white text-slate-700 text-xs font-medium"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 border border-slate-200 rounded bg-white disabled:opacity-40 hover:bg-slate-50 font-medium"
                >
                  Previous
                </button>
                <span className="px-2 font-bold text-slate-800">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 border border-slate-200 rounded bg-white disabled:opacity-40 hover:bg-slate-50 font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Quick Preview Drawer */}
      {selectedLearner && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedLearner(null)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-md">
                  {getInitials(selectedLearner.full_name)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{selectedLearner.full_name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusBadge(selectedLearner)}
                    <span className="text-xs font-mono text-slate-500">{selectedLearner.ic_number || "No IC"}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLearner(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Contact & Location Info */}
              <div className="bg-slate-50/75 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact & Center</div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-slate-400 font-medium w-16">Email:</span>
                  <span className="font-semibold text-slate-900">{selectedLearner.email || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-slate-400 font-medium w-16">Phone:</span>
                  <span className="font-semibold text-slate-900">{selectedLearner.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-slate-400 font-medium w-16">NADI Site:</span>
                  <span className="font-semibold text-indigo-700">{selectedLearner.nadi_sites?.site_name || "Unassigned"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-slate-400 font-medium w-16">State:</span>
                  <span className="font-semibold text-slate-900">{selectedLearner.states?.state_name || "Malaysia"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="text-slate-400 font-medium w-16">Gender:</span>
                  <span className="capitalize font-semibold text-slate-900">{selectedLearner.gender || "-"}</span>
                </div>
              </div>

              {/* Enrolled Courses Progress */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" /> Enrolled Courses
                  </h4>
                  <Link
                    href={`/admin/learner-assignments?userId=${selectedLearner.id}`}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    + Assign Course
                  </Link>
                </div>

                {selectedLearner.course_enrolments && selectedLearner.course_enrolments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedLearner.course_enrolments.map((enrol) => (
                      <div key={enrol.id} className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {enrol.courses?.course_code || "CRS"}
                          </span>
                          <span className="text-xs font-semibold capitalize text-slate-500">
                            {enrol.status}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm mt-1">{enrol.courses?.title || "Enrolled Course"}</h5>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${enrol.progress_pct || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{enrol.progress_pct || 0}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-dashed rounded-lg text-center text-slate-500 text-xs">
                    No active course enrolments. Click "+ Assign Course" to enroll this learner.
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
              <Link
                href={`/learner-360/${selectedLearner.id}`}
                className="flex-1 py-2.5 px-4 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 text-center shadow-xs transition"
              >
                Open Full 360° Profile
              </Link>
              <Link
                href={`/participants/${selectedLearner.id}/edit`}
                className="py-2.5 px-4 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-100 text-center transition"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsImportModalOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" /> Import Learner CSV
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <p className="text-sm text-slate-600">
              Upload a standard CSV roster of participants with headers: <br />
              <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono">full_name, ic_number, email, phone, gender, state, site_name</code>
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-indigo-50/20 hover:border-indigo-300 transition cursor-pointer">
              <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <span className="block text-sm font-semibold text-slate-800">Drag & drop CSV roster file here</span>
              <span className="block text-xs text-slate-500 mt-1">or browse from your computer (.csv)</span>
              <input type="file" accept=".csv" className="hidden" id="csv-upload" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Please choose a CSV file with valid Malaysian participant records.");
                  setIsImportModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Upload & Process
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
