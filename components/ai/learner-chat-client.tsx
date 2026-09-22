"use client";

import React, { useState } from 'react';
import { queryAILearnerAssistantAction } from '@/app/actions/ai';

export default function LearnerChatClient() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, safeguardBlocked?: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await queryAILearnerAssistantAction({ userQuestion: userMessage });
      
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: res.answer, 
          safeguardBlocked: res.safeguardBlocked 
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: "Sorry, I encountered an error while trying to process your request." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="bg-gray-50 border-b border-gray-200 p-4 font-bold text-gray-800 flex items-center gap-2">
        New Chat
      </div>
      
      <div className="flex-1 p-6 flex flex-col overflow-y-auto gap-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 h-full">
            <div className="text-4xl mb-4">💬</div>
            <p>Select a capability above or type a message to start interacting.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : msg.safeguardBlocked
                    ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-xl p-4 bg-gray-100 text-gray-800 rounded-bl-none">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            placeholder="Ask the AI learning assistant..." 
            className="w-full bg-white border border-gray-300 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 top-2 w-8 h-8 rounded-md flex items-center justify-center transition
              ${(!input.trim() || isLoading) ? 'bg-gray-300 text-gray-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'}
            `}
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  );
}
