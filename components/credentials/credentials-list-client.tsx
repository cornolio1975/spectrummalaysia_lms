"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Award, 
  Plus, 
  Search, 
  Layers, 
  Palette, 
  CheckCircle2, 
  Users, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  Filter
} from "lucide-react";

interface CredentialItem {
  id: string;
  name: string;
  credential_code: string;
  credential_type: string;
  level: string;
  learning_hours: number;
  validity_months: number | null;
  status: string;
  created_at: string;
  requirementsCount: number;
  issuancesCount: number;
}

interface Props {
  credentials: CredentialItem[];
}

export function CredentialsListClient({ credentials }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const filtered = credentials.filter((cred) => {
    const matchesSearch =
      cred.name.toLowerCase().includes(search.toLowerCase()) ||
      cred.credential_code.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || cred.credential_type === typeFilter;
    const matchesLevel = levelFilter === "all" || cred.level === levelFilter;
    return matchesSearch && matchesType && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header with quick stats & action buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Award className="h-7 w-7 text-indigo-600" />
            Micro-Credentials & Badges Registry
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Enterprise micro-credentials, stackable qualifications, learning outcomes & automated issuance engine.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/credentials/designer"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Palette className="h-4 w-4 text-gray-500" />
            Certificate Designer
          </Link>
          <Link
            href="/credentials/stacking"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
          >
            <Layers className="h-4 w-4 text-indigo-600" />
            Stack Builder
          </Link>
          <Link
            href="/credentials/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Create Credential
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-sm">
            <span>Total Credentials</span>
            <Award className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{credentials.length}</div>
          <div className="text-xs text-gray-400 mt-1">Active in registry</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-sm">
            <span>Total Issuances</span>
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {credentials.reduce((acc, c) => acc + (c.issuancesCount || 0), 0)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Verified recipients</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-sm">
            <span>Modular Stacks</span>
            <Layers className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-2">
            {credentials.filter((c) => c.credential_type === "stackable_degree").length}
          </div>
          <div className="text-xs text-gray-400 mt-1">Pathway programs</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-sm">
            <span>Avg. Learning Hours</span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {credentials.length > 0
              ? Math.round(
                  credentials.reduce((acc, c) => acc + (Number(c.learning_hours) || 0), 0) /
                    credentials.length
                )
              : 0}
            h
          </div>
          <div className="text-xs text-gray-400 mt-1">Per credential</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search credential title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>Type:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="micro_credential">Micro-Credential</option>
            <option value="nano_degree">Nano-Degree</option>
            <option value="professional_cert">Professional Certificate</option>
            <option value="stackable_degree">Stackable Degree</option>
            <option value="attendance_cert">Certificate of Attendance</option>
          </select>

          <div className="flex items-center gap-2 text-sm text-gray-500 ml-2">
            <span>Level:</span>
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Levels</option>
            <option value="foundation">Foundation</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="mastery">Mastery</option>
          </select>
        </div>
      </div>

      {/* Credentials Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Credential Title & Code</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Level</th>
                <th className="px-6 py-3">Hours</th>
                <th className="px-6 py-3">Reqs</th>
                <th className="px-6 py-3">Issuances</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No credentials match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((cred) => (
                  <tr key={cred.id} className="hover:bg-gray-50/75 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{cred.name}</div>
                      <div className="text-xs font-mono text-indigo-600 mt-0.5">
                        {cred.credential_code}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
                        {cred.credential_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {cred.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{cred.learning_hours} hrs</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">{cred.requirementsCount}</span>
                      <span className="text-gray-400 text-xs ml-1">rules</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                        <Users className="h-3.5 w-3.5" />
                        {cred.issuancesCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          cred.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {cred.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/credentials/${cred.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                      >
                        Manage <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
