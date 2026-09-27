"use client";

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent was already given in local storage
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) setIsVisible(true);
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({ strictly_necessary: true, analytics: true, functional: true }));
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({ strictly_necessary: true, analytics: false, functional: false }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-slate-900 text-white p-6 shadow-xl z-50 flex flex-col md:flex-row items-center justify-between">
      <div className="mb-4 md:mb-0 md:mr-8 text-sm">
        <h3 className="font-bold text-lg mb-1">Privacy & Cookie Consent</h3>
        <p>
          We use strictly necessary cookies to make our site work. We'd also like to set optional analytics and functional cookies to help us improve it. We won't set optional cookies unless you enable them.
        </p>
      </div>
      <div className="flex gap-2 whitespace-nowrap">
        <button onClick={handleRejectNonEssential} className="border border-slate-400 px-4 py-2 rounded text-sm hover:bg-slate-800">
          Reject Non-Essential
        </button>
        <button onClick={handleAcceptAll} className="bg-blue-600 px-4 py-2 rounded text-sm font-bold hover:bg-blue-700">
          Accept All
        </button>
      </div>
    </div>
  );
}
