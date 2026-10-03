"use client";

import { useState, useEffect } from 'react';
import { suggestNadiSite, NadiSiteSuggestion } from '@/services/nadi-assignment';
import { createClient } from '@/utils/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';

export default function LearnerAssignmentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');
  const [suggestions, setSuggestions] = useState<NadiSiteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [nadiSites, setNadiSites] = useState<{ id: string; site_name: string; state_id: string }[]>([]);
  const [states, setStates] = useState<{ id: string; state_name: string }[]>([]);
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedNadi, setSelectedNadi] = useState("");
  
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title')
        .eq('status', 'published')
        .order('title');
        
      if (coursesData) setCourses(coursesData);
      
      const { data: statesData } = await supabase
        .from('states')
        .select('id, state_name')
        .order('state_name');
        
      if (statesData) setStates(statesData);

      const { data: nadiData } = await supabase
        .from('nadi_sites')
        .select('id, site_name, state_id')
        .order('site_name');
        
      if (nadiData) setNadiSites(nadiData);
    }
    fetchData();
  }, []);

  const handleSuggest = async () => {
    setLoading(true);
    // Hardcoded example values, in reality this comes from the learner's profile
    const result = await suggestNadiSite('40000', 'Shah Alam', 'state-uuid-here');
    setSuggestions(result);
    setLoading(false);
  };

  const ensureParticipantExists = async (userId: string, supabase: any) => {
    // Check if participant exists
    const { data: participant } = await supabase
      .from('participants')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (!participant) {
      // Fetch profile to get name
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();
        
      if (profileError || !profile) {
        console.error("Profile fetch error:", JSON.stringify(profileError));
        throw new Error("User profile not found or accessible.");
      }

      const { data: newParticipant, error: insertError } = await supabase.from('participants').insert([{
        id: userId,
        full_name: profile.full_name || 'Unknown',
        email: profile.email || null,
      }]).select();

      if (insertError) {
        console.error("Failed to insert participant:", JSON.stringify(insertError));
        throw new Error("Failed to create participant record: " + insertError.message);
      }
      
      if (!newParticipant || newParticipant.length === 0) {
        throw new Error("Failed to create participant record: No rows returned. Check RLS policies.");
      }
    }
  };

  const handleAssignSite = async (nadiId: string) => {
    if (!userId) {
      alert("No user ID found in URL. Please go back to the users list.");
      return;
    }
    
    setLoading(true);
    const supabase = createClient();
    
    try {
      await ensureParticipantExists(userId, supabase);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
      setLoading(false);
      return;
    }
    
    const { error } = await supabase
      .from('participants')
      .update({ nadi_id: nadiId })
      .eq('id', userId);
      
    if (error) {
      console.error(error);
      alert(`Failed to assign site: ${error.message}`);
    } else {
      alert('NADI Site successfully assigned to the learner!');
      setSelectedNadi("");
    }
    setLoading(false);
  };

  const handleEnrolCourse = async () => {
    if (!userId) {
      alert("No user ID found in URL. Please go back to the users list.");
      return;
    }
    
    if (!selectedCourse) return;

    setLoading(true);
    const supabase = createClient();
    
    try {
      await ensureParticipantExists(userId, supabase);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
      setLoading(false);
      return;
    }
    
    const { error } = await supabase
      .from('course_enrolments')
      .insert([{
        course_id: selectedCourse,
        participant_id: userId
      }]);
      
    if (error) {
      console.error("Course enrolment error:", JSON.stringify(error));
      if (error.code === '23505') {
        alert('Learner is already enrolled in this course.');
      } else {
        alert(`Failed to enrol learner: ${error.message || JSON.stringify(error)}`);
      }
    } else {
      alert('Learner successfully enrolled in the course!');
      setSelectedCourse("");
    }
    setLoading(false);
  };

  const filteredNadiSites = nadiSites.filter(nadi => {
    const matchesState = filterState ? nadi.state_id === filterState : true;
    const matchesCity = filterCity ? nadi.site_name.toLowerCase().includes(filterCity.toLowerCase()) : true;
    return matchesState && matchesCity;
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">LEARNER ASSIGNMENTS</h1>
      
      <div className="mb-8 border p-4 rounded bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">NADI Site Assignment</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Smart Recommendation</h3>
            <p className="text-sm text-gray-500 mb-4">Postcode: 40000 | City: Shah Alam</p>
            <button 
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 transition-colors" 
              onClick={handleSuggest}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Get System Recommendation'}
            </button>

            {suggestions.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Suggested NADI Sites</h4>
                <ul className="space-y-3">
                  {suggestions.map(site => (
                    <li key={site.nadi_id} className="text-sm border p-3 rounded bg-slate-50">
                      <strong className="block text-indigo-900">{site.name}</strong>
                      <span className="text-gray-600 text-xs">{site.matchReason}</span>
                      <br />
                      <button 
                        onClick={() => handleAssignSite(site.nadi_id)}
                        disabled={loading}
                        className="text-xs bg-emerald-500 hover:bg-emerald-600 transition-colors text-white px-3 py-1.5 rounded mt-2 font-medium disabled:opacity-50"
                      >
                        USE THIS SITE
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="border-l pl-8">
            <h3 className="font-medium text-gray-700 mb-2">Manual Selection</h3>
            <p className="text-sm text-gray-500 mb-4">Or manually assign a specific site from the registry.</p>
            
            <div className="mb-4 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Filter by State</label>
                <select 
                  className="border p-2 w-full rounded text-sm"
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                >
                  <option value="">All States</option>
                  {states.map(s => (
                    <option key={s.id} value={s.id}>{s.state_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Search City/Town</label>
                <input 
                  type="text" 
                  placeholder="e.g. Shah Alam"
                  className="border p-2 w-full rounded text-sm"
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                />
              </div>
            </div>

            <select 
              className="border p-2 w-full mb-3 rounded form-input"
              value={selectedNadi}
              onChange={(e) => setSelectedNadi(e.target.value)}
            >
              <option value="">-- Select NADI Site --</option>
              {filteredNadiSites.map(nadi => (
                <option key={nadi.id} value={nadi.id}>{nadi.site_name}</option>
              ))}
            </select>
            
            <div className="text-xs text-gray-500 mb-3">
              Showing {filteredNadiSites.length} site{filteredNadiSites.length !== 1 ? 's' : ''}
            </div>
            
            <button 
              onClick={() => handleAssignSite(selectedNadi)}
              className="bg-slate-800 text-white px-4 py-2 rounded text-sm hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedNadi || loading}
            >
              ASSIGN SELECTED SITE
            </button>
          </div>
        </div>
      </div>
      
      <div className="border p-4 rounded bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Assign Course</h2>
        <div className="flex gap-4 items-start max-w-2xl">
          <select 
            className="border p-2 flex-grow rounded form-input"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- Select a Course to Assign --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
          <button 
            onClick={handleEnrolCourse}
            className="bg-indigo-600 text-white px-6 py-2 rounded font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedCourse || loading}
          >
            ENROL
          </button>
        </div>
      </div>
    </div>
  );
}
