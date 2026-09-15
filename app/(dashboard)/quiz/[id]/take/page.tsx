import { getQuizWithQuestions } from "@/app/actions/quiz-take";
import { TakeQuizClient } from "@/components/lms/take-quiz-client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function TakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { quiz, questions, error } = await getQuizWithQuestions(id);

  if (error || !quiz) {
    notFound();
  }

  const supabase = await createClient();
  const { data: participants } = await supabase.from("participants").select("id").limit(1);
  const participantId = participants?.[0]?.id || "00000000-0000-0000-0000-000000000001";

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <Link href={`/programmes/${quiz.programme_id}`} className="text-sm text-primary-500 hover:underline mb-4 inline-block">
          ← Back to Programme
        </Link>
        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-gray-600 mb-4">{quiz.description}</p>
        
        <div className="flex gap-4 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border inline-flex">
          <div><span className="font-semibold text-gray-700">Questions:</span> {questions?.length || 0}</div>
          <div>•</div>
          <div><span className="font-semibold text-gray-700">Passing Mark:</span> {quiz.pass_mark}%</div>
          <div>•</div>
          <div><span className="font-semibold text-gray-700">Max Attempts:</span> {quiz.max_attempts}</div>
        </div>
      </div>

      <TakeQuizClient 
        quizId={id} 
        participantId={participantId} 
        quiz={quiz} 
        questions={questions || []} 
      />
    </div>
  );
}
