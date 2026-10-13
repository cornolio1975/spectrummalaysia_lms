import { createClient } from "@/utils/supabase/server";
import { getProgrammeModules } from "@/app/actions/modules";
import { getQuizzes } from "@/app/actions/quizzes";
import { CurriculumBuilder } from "@/components/dashboard/curriculum-builder";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProgrammeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [progRes, modulesRes, quizzesRes] = await Promise.all([
    supabase.from("programmes").select("*").eq("id", id).single(),
    getProgrammeModules(id),
    getQuizzes(id)
  ]);

  if (progRes.error || !progRes.data) {
    notFound();
  }

  const programme = progRes.data;
  const modules = modulesRes.data || [];
  const quizzes = quizzesRes.data || [];

  const { data: linkedCourses } = await supabase
    .from("courses")
    .select("id, course_code, title, level, learning_hours, status")
    .eq("programme_id", id)
    .is("deleted_at", null)
    .order("course_code");

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/programmes" className="text-sm text-primary-500 hover:underline mb-2 inline-block">← Back to Programmes</Link>
          <div className="flex items-center gap-3">
            <h1>{programme.programme_name}</h1>
            <span className={`badge ${programme.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
              {programme.status}
            </span>
            <span className="badge badge-warning">
              Proposal / Draft
            </span>
          </div>
          <p className="mt-1 font-medium text-gray-700">Code: <code className="bg-gray-100 px-2 py-1 rounded">{programme.programme_code}</code></p>
        </div>
      </div>

      <div className="page-body">
        {/* Programme Overview Card */}
        {programme.description && (
          <div className="card p-6 mb-6 bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Programme Overview & Strategic Framework</h3>
            <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
              {programme.description}
            </div>
          </div>
        )}

        {/* Programme Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category</h3>
            <div className="text-base font-medium">{programme.category || "-"}</div>
          </div>
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Age</h3>
            <div className="text-base font-medium">{programme.target_age_group || "-"}</div>
          </div>
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Modules</h3>
            <div className="text-base font-medium">{modules.length}</div>
          </div>
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Lessons</h3>
            <div className="text-base font-medium">
              {modules.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0)}
            </div>
          </div>
        </div>

        {/* Linked LMS Courses */}
        {linkedCourses && linkedCourses.length > 0 && (
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Linked Modular Courses ({linkedCourses.length})</h3>
                <p className="text-xs text-slate-500">Universal courses associated with this programme for learner enrolment and interactive progression.</p>
              </div>
              <Link href="/courses/new" className="btn btn-secondary btn-sm">
                + Add Course
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {linkedCourses.map((c: any) => (
                <div key={c.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{c.course_code}</code>
                      <span className="font-semibold text-sm text-slate-900">{c.title}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {c.level} • {c.learning_hours} Hours • Status: <span className="uppercase text-amber-600 font-medium">{c.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/courses/${c.id}`} className="btn btn-secondary btn-sm">
                      Manage Course →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Curriculum Builder */}
        <CurriculumBuilder programmeId={id} modules={modules} quizzes={quizzes} />
      </div>
    </div>
  );
}
