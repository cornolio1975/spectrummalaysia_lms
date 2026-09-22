import React from 'react';
import { getTrainerWorkspace } from '@/services/trainer-workspace';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import AIAssistantClient from './AIAssistantClient';

export default async function TrainerAIPage() {
  let errorMsg = null;
  let aiConfigured = false;

  try {
    await getTrainerWorkspace();
    
    // Check if any AI provider is configured for the platform
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('ai_providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_enabled', true);
      
    if (error) console.error("AI Provider query error:", error);
      
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
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-end pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Trainer Assistant</h1>
            <p className="text-gray-500 mt-2">Generate content, rubrics, and analyze performance with AI.</p>
          </div>
        </header>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-4">
          <div className="text-yellow-600 text-2xl">⚠️</div>
          <div>
            <h3 className="font-bold text-yellow-800 text-lg">No AI provider is currently configured.</h3>
            <p className="text-yellow-700 mt-1">Please contact an administrator to activate an AI Provider in the Admin Console.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Trainer Assistant</h1>
          <p className="text-gray-500 mt-2">Generate content, rubrics, and analyze performance using platform AI capabilities.</p>
        </div>
      </header>

      <AIAssistantClient />
      
      <p className="text-xs text-center text-gray-400 mt-8">Note: All AI-generated content remains in draft state until explicitly published by you.</p>
    </div>
  );
}
