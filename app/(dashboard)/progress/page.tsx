import type { Metadata } from "next";

export const metadata: Metadata = { title: "Progress | SpectrumMY LMS" };

export default function ProgressPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Learner Progress</h1>
        <p className="text-[var(--text-muted)]">Track and monitor learner progression across programmes.</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-[var(--border)] p-12 text-center text-gray-500">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Progress Module</h3>
        <p>This module is currently being connected to the new data architecture.</p>
      </div>
    </div>
  );
}
