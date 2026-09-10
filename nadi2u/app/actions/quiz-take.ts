"use server";

import { createClient } from "@/utils/supabase/server";

export async function getQuizWithQuestions(quizId: string) {
  const supabase = await createClient();
  
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*, lessons(title)")
    .eq("id", quizId)
    .single();

  if (quizError) return { error: quizError.message };

  const { data: questions, error: qError } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });

  if (qError) return { error: qError.message };

  return { quiz, questions };
}

export async function submitQuizAttempt(quizId: string, participantId: string, answers: any) {
  const supabase = await createClient();
  
  // 1. Get the quiz rules
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (quizError) return { error: quizError.message };

  // 2. Get questions to calculate score
  const { data: questions, error: qError } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId);

  if (qError) return { error: qError.message };

  // 3. Auto-grade if multiple choice
  let earnedScore = 0;
  let maxScore = 0;
  let requiresManualGrading = false;

  for (const q of questions) {
    maxScore += Number(q.marks);
    const userAnswer = answers[q.id];

    if (q.question_type === 'multiple_choice' || q.question_type === 'true_false') {
      // Find correct option index or check exact match depending on structure
      // Simplification for MVP: Assuming options array has {text, is_correct}
      const correctOptions = q.options?.filter((o: any) => o.is_correct).map((o: any) => o.text);
      if (correctOptions?.includes(userAnswer)) {
        earnedScore += Number(q.marks);
      }
    } else {
      requiresManualGrading = true;
    }
  }

  const percentage = (earnedScore / maxScore) * 100;
  const passed = percentage >= quiz.pass_mark;

  // 4. Record Attempt
  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert([{
      quiz_id: quizId,
      participant_id: participantId,
      score: earnedScore,
      max_score: maxScore,
      percentage,
      passed,
      completed_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (attemptError) return { error: attemptError.message };

  // 5. Store answers
  const answerInserts = Object.keys(answers).map(questionId => ({
    attempt_id: attempt.id,
    question_id: questionId,
    answer_text: answers[questionId],
  }));

  if (answerInserts.length > 0) {
    await supabase.from("quiz_answers").insert(answerInserts);
  }

  return { 
    attempt, 
    requiresManualGrading 
  };
}
