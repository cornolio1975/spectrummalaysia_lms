"use client";

import { useState } from "react";
import { submitQuizAttempt } from "@/app/actions/quiz-take";

interface TakeQuizClientProps {
  quizId: string;
  participantId: string; // Hardcoded for MVP, in real app comes from auth context
  quiz: any;
  questions: any[];
}

export function TakeQuizClient({ quizId, participantId, quiz, questions }: TakeQuizClientProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleOptionSelect = (questionId: string, answerText: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerText }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      if (!confirm("You have unanswered questions. Submit anyway?")) {
        return;
      }
    }
    
    setIsSubmitting(true);
    const res = await submitQuizAttempt(quizId, participantId, answers);
    setIsSubmitting(false);
    
    if (res.error) {
      alert("Error submitting quiz: " + res.error);
    } else {
      setResult(res.attempt);
    }
  };

  if (result) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
        <div className={`text-4xl font-bold mb-2 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
          {result.percentage.toFixed(0)}%
        </div>
        <p className="text-gray-600 mb-6">
          Score: {result.score} / {result.max_score} <br />
          Passing Mark: {quiz.pass_mark}%
        </p>
        <span className={`badge px-4 py-2 text-lg ${result.passed ? 'badge-success' : 'badge-danger'}`}>
          {result.passed ? 'PASSED' : 'FAILED'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {questions.map((q, idx) => (
        <div key={q.id} className="card">
          <h3 className="font-semibold mb-4 text-lg">
            <span className="text-gray-400 mr-2">{idx + 1}.</span> {q.question_text}
            <span className="text-sm font-normal text-gray-500 float-right">{q.marks} pts</span>
          </h3>
          
          <div className="space-y-2 pl-6">
            {(q.options || []).map((opt: any, optIdx: number) => (
              <label 
                key={optIdx} 
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  answers[q.id] === opt.text ? 'bg-primary-50 border-primary-300' : 'hover:bg-gray-50'
                }`}
              >
                <input 
                  type="radio" 
                  name={`q_${q.id}`} 
                  value={opt.text}
                  checked={answers[q.id] === opt.text}
                  onChange={() => handleOptionSelect(q.id, opt.text)}
                  className="w-4 h-4 text-primary-600"
                />
                <span>{opt.text}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end p-4">
        <button 
          className="btn btn-primary px-8" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}
