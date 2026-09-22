import React from 'react';
import { getLearnerWorkspace } from '@/services/learner-workspace';
import { createClient } from '@/utils/supabase/server';
import LearnerChatClient from '@/components/ai/learner-chat-client';

export default async function LearnerAIPage() {
  let errorMsg = null;
  let aiConfigured = false;

  try {
    await getLearnerWorkspace();
    
    // Check if any free AI provider is active on the platform
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('ai_providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_enabled', true)
      .eq('is_free', true);
      
    if (error) {
      console.error("Error fetching AI providers:", error);
    }
      
    if (count && count > 0) {
      aiConfigured = true;
    }

  } catch (error: any) {
    errorMsg = error.message;
  }

  if (errorMsg) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p>{errorMsg}</p>
      </div>
    );
  }

  if (!aiConfigured) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Learning Assistant</h1>
            <p className="text-gray-500 mt-2">Get help explaining complex concepts, generating study notes, and brainstorming portfolio ideas.</p>
          </div>
        </header>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
          <div className="text-yellow-600 text-2xl">⚠️</div>
          <div>
            <h3 className="font-bold text-yellow-800 text-lg">AI Services Temporarily Unavailable</h3>
            <p className="text-yellow-700 mt-1">The system administrator has not enabled any AI provider for this region. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between md:items-end pb-4 border-b gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-indigo-600">🤖</span> AI Learning Assistant
          </h1>
          <p className="text-gray-500 mt-2">Your personal tutor. AI responses are generated to assist your learning and should not replace your original work.</p>
        </div>
      </header>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 shadow-sm">
        <strong>Academic Integrity Notice:</strong> The AI Assistant will not complete assessments or write final assignment submissions for you. It is designed to act as a study aid.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md hover:border-indigo-300 transition cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">💡</div>
            <h3 className="font-bold text-gray-900">Explain a Concept</h3>
          </div>
          <p className="text-sm text-gray-500">Stuck on a tricky lesson? Ask the AI to break it down using simple analogies based on your course material.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md hover:border-indigo-300 transition cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">📝</div>
            <h3 className="font-bold text-gray-900">Generate Study Notes</h3>
          </div>
          <p className="text-sm text-gray-500">Automatically summarize a long module or document into concise, readable bullet points.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md hover:border-indigo-300 transition cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">❓</div>
            <h3 className="font-bold text-gray-900">Practice Quiz</h3>
          </div>
          <p className="text-sm text-gray-500">Generate a custom set of flashcards or multiple-choice questions to test your knowledge before the real exam.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md hover:border-indigo-300 transition cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">🧠</div>
            <h3 className="font-bold text-gray-900">Portfolio Brainstorming</h3>
          </div>
          <p className="text-sm text-gray-500">Discuss ideas for your Startup Launch Portfolio. The AI can help validate assumptions and refine your Business Model Canvas.</p>
        </div>
      </div>
      
      {/* AI Chat Interface */}
      <LearnerChatClient />
    </div>
  );
}
