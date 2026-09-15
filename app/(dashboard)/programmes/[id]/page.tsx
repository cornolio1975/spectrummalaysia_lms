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
          </div>
          <p className="mt-1 font-medium text-gray-700">Code: <code className="bg-gray-100 px-2 py-1 rounded">{programme.programme_code}</code></p>
        </div>
      </div>

      <div className="page-body">
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

        {/* Curriculum Builder */}
        <CurriculumBuilder programmeId={id} modules={modules} quizzes={quizzes} />
      </div>
    </div>
  );
}
