import React from 'react';
import { getLearnerWorkspace } from '@/services/learner-workspace';
import { createClient } from '@/utils/supabase/server';

export default async function LearnerMessagesPage() {
  let errorMsg = null;
  let messages: any[] = [];

  try {
    const { participantId } = await getLearnerWorkspace();
    
    if (participantId) {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from('communication_recipients')
        .select(`
          id,
          read_at,
          created_at,
          communications (
            id,
            subject,
            body,
            type,
            created_at,
            trainers (name)
          )
        `)
        .eq('participant_id', participantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) messages = data;
    }
  } catch (error: any) {
    errorMsg = error.message;
  }

  if (errorMsg) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Messages</h1>
        <p>{errorMsg}</p>
      </div>
    );
  }

  const unreadCount = messages.filter(m => !m.read_at).length;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 mt-1">Communications from your trainers and administrators.</p>
        </div>
        {unreadCount > 0 && (
          <div className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-sm font-bold">
            {unreadCount} Unread
          </div>
        )}
      </header>

      {messages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
          <div className="text-4xl mb-4">✉️</div>
          <h3 className="text-lg font-bold text-gray-900">Your inbox is empty</h3>
          <p>You have no messages at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`bg-white rounded-xl border ${msg.read_at ? 'border-gray-200' : 'border-sky-300 shadow-sm'} p-6 transition`}
            >
              <div className="flex justify-between items-start gap-4 mb-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0">
                    {msg.communications?.trainers?.name?.charAt(0) || 'T'}
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${msg.read_at ? 'text-gray-700' : 'text-gray-900'}`}>
                      {msg.communications?.subject || 'No Subject'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      From: {msg.communications?.trainers?.name || 'Unknown Sender'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(msg.created_at).toLocaleString()}
                  </span>
                  {!msg.read_at && (
                    <span className="text-[10px] uppercase font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">New</span>
                  )}
                </div>
              </div>
              <div className={`text-sm prose prose-sm max-w-none ${msg.read_at ? 'text-gray-600' : 'text-gray-800'}`}>
                {msg.communications?.body}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
