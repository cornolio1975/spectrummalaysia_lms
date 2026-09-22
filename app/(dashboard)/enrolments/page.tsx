import type { Metadata } from "next";

export const metadata: Metadata = { title: "Enrolments | SpectrumMY LMS" };

export default function EnrolmentsPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Enrolments</h1>
        <p className="text-[var(--text-muted)]">View and manage course enrolments across the system.</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-[var(--border)] p-12 text-center text-gray-500">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Enrolments Module</h3>
        <p>This module is currently being connected to the new data architecture.</p>
      </div>
    </div>
  );
}
