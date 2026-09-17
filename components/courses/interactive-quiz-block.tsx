"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, Award, RotateCcw, AlertTriangle } from "lucide-react";

interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface QuizData {
  pass_pct?: number;
  is_final_exam?: boolean;
  questions: QuizQuestion[];
}

interface Props {
  content: {
    id: string;
    title: string;
    content_body?: string;
  };
  onPass?: () => void;
}

export function InteractiveQuizBlock({ content, onPass }: Props) {
  let quizData: QuizData | null = null;
  try {
    if (content.content_body && content.content_body.trim().startsWith("{")) {
      quizData = JSON.parse(content.content_body);
    }
  } catch (err) {
    console.error("Failed to parse quiz JSON:", err);
  }

  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  if (!quizData || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
    return (
      <div className="card p-6 border border-slate-200">
        <h3 className="text-base font-bold text-slate-800 mb-2">{content.title}</h3>
        <p className="text-sm text-slate-500">Interactive quiz configuration is being initialized.</p>
      </div>
    );
  }

  const questions = quizData.questions;
  const passPct = quizData.pass_pct || 70;
  const isFinalExam = quizData.is_final_exam || questions.length >= 20;

  // Calculate score
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.answer) {
      correctCount++;
    }
  });
  const scorePct = Math.round((correctCount / questions.length) * 100);
  const passed = scorePct >= passPct;

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowExplanations(true);
    if (passed && onPass) {
      onPass();
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setShowExplanations(false);
  };

  const totalAnswered = Object.keys(selectedAnswers).length;

  return (
    <div className="card p-6 md:p-8 bg-white rounded-xl border border-slate-200 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isFinalExam 
                ? "bg-amber-100 text-amber-900 border border-amber-300" 
                : "bg-indigo-50 text-indigo-700 border border-indigo-200"
            }`}>
              {isFinalExam ? "🎓 Comprehensive Final Examination" : "📝 Knowledge Check"}
            </span>
            <span className="text-xs text-slate-500">
              Pass mark: <strong>{passPct}%</strong>
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1">{content.title}</h3>
        </div>

        <div className="text-right text-xs text-slate-500">
          <div>Total Questions: <strong>{questions.length}</strong></div>
          <div>Answered: <strong>{totalAnswered} / {questions.length}</strong></div>
        </div>
      </div>

      {/* Submitted Result Banner */}
      {submitted && (
        <div className={`p-6 rounded-xl border ${
          passed 
            ? "bg-emerald-50 border-emerald-300 text-emerald-950" 
            : "bg-rose-50 border-rose-300 text-rose-950"
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-2xl shrink-0 ${
                passed ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
              }`}>
                {scorePct}%
              </div>
              <div>
                <h4 className="font-extrabold text-lg flex items-center gap-1.5">
                  {passed ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      Assessment Passed!
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-rose-600" />
                      Passing Score Not Met
                    </>
                  )}
                </h4>
                <p className="text-xs mt-1">
                  You scored <strong>{correctCount}</strong> out of <strong>{questions.length}</strong> correct ({scorePct}%).
                  {passed
                    ? ` Congratulations! You met the required ${passPct}% competency standard.`
                    : ` A minimum score of ${passPct}% is required to satisfy micro-credential criteria. Please review explanations below and retake.`}
                </p>
              </div>
            </div>

            {!passed && (
              <button
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition shrink-0"
              >
                <RotateCcw className="h-4 w-4" /> Retake Examination
              </button>
            )}
          </div>
        </div>
      )}

      {/* Question List */}
      <div className="space-y-6">
        {questions.map((question, qIdx) => {
          const userChoice = selectedAnswers[qIdx];
          const isAnswered = userChoice !== undefined;
          const isCorrect = userChoice === question.answer;

          return (
            <div
              key={qIdx}
              className={`p-4 md:p-5 rounded-xl border transition-all ${
                submitted
                  ? isCorrect
                    ? "border-emerald-200 bg-emerald-50/20"
                    : "border-rose-200 bg-rose-50/20"
                  : isAnswered
                  ? "border-indigo-200 bg-slate-50/50"
                  : "border-slate-200 bg-white"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="font-semibold text-slate-900 text-sm leading-snug">
                  {question.q}
                </span>

                {submitted && (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2 mt-3">
                {question.options.map((opt, optIdx) => {
                  const isSelected = userChoice === optIdx;
                  const isThisCorrect = optIdx === question.answer;

                  let optClasses = "border-slate-200 hover:bg-slate-50 text-slate-700";
                  if (submitted) {
                    if (isThisCorrect) {
                      optClasses = "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold";
                    } else if (isSelected && !isThisCorrect) {
                      optClasses = "border-rose-400 bg-rose-50 text-rose-900 line-through";
                    } else {
                      optClasses = "border-slate-200 opacity-60 text-slate-500";
                    }
                  } else if (isSelected) {
                    optClasses = "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium shadow-xs";
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      className={`w-full text-left p-3 rounded-lg border text-xs flex items-center gap-3 transition cursor-pointer disabled:cursor-default ${optClasses}`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="flex-1">{opt}</span>
                      {submitted && isThisCorrect && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation on submit */}
              {submitted && question.explanation && (
                <div className="mt-3 p-3 rounded-lg bg-slate-100/80 border border-slate-200 text-xs text-slate-600">
                  <span className="font-bold text-slate-800 block mb-0.5">Explanation:</span>
                  {question.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submission Actions */}
      {!submitted ? (
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {totalAnswered < questions.length ? (
              <span className="text-amber-700 font-medium flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Please answer all {questions.length} questions before submitting ({questions.length - totalAnswered} remaining).
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                All questions answered. Ready to submit!
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={totalAnswered < questions.length}
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition cursor-pointer disabled:cursor-not-allowed"
          >
            Submit {isFinalExam ? "Final Examination" : "Knowledge Check"}
          </button>
        </div>
      ) : (
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Completed: <strong>{correctCount} / {questions.length}</strong> correct ({scorePct}%)
          </span>
          {!passed && (
            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
