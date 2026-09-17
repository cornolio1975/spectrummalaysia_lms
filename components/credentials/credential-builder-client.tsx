"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Award, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Layers, 
  Clock, 
  BookOpen,
  Loader2
} from "lucide-react";
import { createCredential, addCredentialRequirement } from "@/app/actions/credentials";
import { toast } from "sonner";

interface CourseItem {
  id: string;
  title: string;
  course_code: string;
}

interface Props {
  courses: CourseItem[];
}

export function CredentialBuilderClient({ courses }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [credentialCode, setCredentialCode] = useState("");
  const [credentialType, setCredentialType] = useState("micro_credential");
  const [level, setLevel] = useState("intermediate");
  const [learningHours, setLearningHours] = useState(20);
  const [validityMonths, setValidityMonths] = useState<number | undefined>(24);
  const [description, setDescription] = useState("");

  // Dynamic Requirements
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || "");
  const [minScore, setMinScore] = useState(80);
  const [minAttendance, setMinAttendance] = useState(80);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a credential title");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createCredential({
        name,
        credential_code: credentialCode.trim() || undefined,
        credential_type: credentialType as any,
        level: level as any,
        learning_hours: Number(learningHours) || 12,
        expiry_months: validityMonths ? Number(validityMonths) : 24,
        description: description.trim() || `Accredited micro-credential in ${name}`,
        is_active: true,
      });

      if (res.error) {
        toast.error(res.error);
        setSubmitting(false);
        return;
      }

      const createdCred = res.data;

      // Add course completion requirement if selected
      if (selectedCourseId && createdCred?.id) {
        await addCredentialRequirement({
          credentialId: createdCred.id,
          requirementType: "course_completion",
          courseId: selectedCourseId,
          minScore: Number(minScore) || 75,
          minAttendancePct: Number(minAttendance) || 80,
          description: `Complete course with >=${minScore}% assessment score and >=${minAttendance}% attendance`,
        });
      }

      toast.success("Micro-credential created successfully!");
      router.push(`/credentials/${createdCred.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create credential");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top breadcrumb navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/credentials" className="hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Registry
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Define New Micro-Credential</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure credential classification, learning outcomes, and automated verification rules.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              1. Credential Metadata
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Credential Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Micro-Credential in Prompt Engineering & Generative AI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Credential Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MC-AI-GENAI-02 (leave blank to auto-generate)"
                  value={credentialCode}
                  onChange={(e) => setCredentialCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Credential Type
                </label>
                <select
                  value={credentialType}
                  onChange={(e) => setCredentialType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="micro_credential">Micro-Credential</option>
                  <option value="nano_degree">Nano-Degree</option>
                  <option value="professional_cert">Professional Certificate</option>
                  <option value="stackable_degree">Stackable Degree</option>
                  <option value="attendance_cert">Certificate of Attendance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Competency Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="foundation">Foundation (Entry Level)</option>
                  <option value="intermediate">Intermediate (Practitioner)</option>
                  <option value="advanced">Advanced (Senior Specialist)</option>
                  <option value="mastery">Mastery (Expert / Leadership)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Total Learning Hours
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={learningHours}
                    onChange={(e) => setLearningHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-gray-400">hours</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Validity Period (Months)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0 or empty for lifetime"
                  value={validityMonths || ""}
                  onChange={(e) => setValidityMonths(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Description & Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide a comprehensive summary of what competencies and real-world outcomes this credential validates..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Eligibility Rules */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              2. Eligibility Criteria & Course Requirement
            </h2>

            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Required Prerequisite Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      [{course.course_code}] {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Minimum Assessment Score (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Minimum Attendance Requirement (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={minAttendance}
                    onChange={(e) => setMinAttendance(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <Link
              href="/credentials"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" /> Save Credential
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
