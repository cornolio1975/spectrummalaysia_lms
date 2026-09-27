"use client";

import { useState } from 'react';
import { suggestNadiSite, NadiSiteSuggestion } from '@/services/nadi-assignment';

export default function LearnerAssignmentsPage() {
  const [suggestions, setSuggestions] = useState<NadiSiteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    setLoading(true);
    // Hardcoded example values, in reality this comes from the learner's profile
    const result = await suggestNadiSite('40000', 'Shah Alam', 'state-uuid-here');
    setSuggestions(result);
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">LEARNER ASSIGNMENTS</h1>
      
      <div className="mb-8 border p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Smart NADI Site Assignment</h2>
        <p className="mb-4">Postcode: 40000 | City: Shah Alam</p>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded" 
          onClick={handleSuggest}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Get System Recommendation'}
        </button>

        {suggestions.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold">Suggested NADI Sites</h3>
            <ul className="list-disc pl-5 mt-2">
              {suggestions.map(site => (
                <li key={site.nadi_id} className="mb-2">
                  <strong>{site.name}</strong> - {site.matchReason}
                  <br />
                  <button className="text-sm bg-green-500 text-white px-2 py-1 rounded mt-1">
                    USE SUGGESTED SITE
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="border p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Assign Course</h2>
        <select className="border p-2 w-full mb-2">
          <option>Select a Course...</option>
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          ASSIGN COURSE
        </button>
      </div>
    </div>
  );
}
