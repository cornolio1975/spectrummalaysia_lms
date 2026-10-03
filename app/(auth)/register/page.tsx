"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const supabase = createClient();

  const [postcode, setPostcode] = useState('');
  const [city, setCity] = useState('');
  const [selectedState, setSelectedState] = useState('');

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPostcode(val);
    if (val.length === 5) {
      // Basic mock lookup for Malaysia postcodes
      if (val.startsWith('40')) { setCity('Shah Alam'); setSelectedState('Selangor'); }
      else if (val.startsWith('47')) { setCity('Petaling Jaya'); setSelectedState('Selangor'); }
      else if (val.startsWith('5')) { setCity('Kuala Lumpur'); setSelectedState('W.P. Kuala Lumpur'); }
      else if (val.startsWith('80') || val.startsWith('81')) { setCity('Johor Bahru'); setSelectedState('Johor'); }
      else if (val.startsWith('10') || val.startsWith('11')) { setCity('Georgetown'); setSelectedState('Pulau Pinang'); }
      else if (val.startsWith('88') || val.startsWith('89')) { setCity('Kota Kinabalu'); setSelectedState('Sabah'); }
      else if (val.startsWith('93')) { setCity('Kuching'); setSelectedState('Sarawak'); }
    }
  };

  const states = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang', 'Perak', 'Perlis', 
    'Pulau Pinang', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu', 'W.P. Kuala Lumpur', 
    'W.P. Labuan', 'W.P. Putrajaya'
  ];

  const [isValid, setIsValid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="bg-green-100 text-green-800 p-8 rounded-lg max-w-lg w-full shadow-sm border border-green-200">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold mb-4">Registration Successful!</h1>
          <p className="mb-6 text-lg">
            Registration successful. Your account has been created as Guest and is currently pending Admin approval. Your LMS role and access will be activated after Admin review.
          </p>
          <a href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded transition-colors">
            Return to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">CREATE NEW ACCOUNT</h1>
      
      <div className="mb-8 p-4 bg-gray-50 border rounded-lg text-sm text-gray-600">
        <p className="font-semibold mb-2">Registration Process:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Register an account below (or use Google Sign In)</li>
          <li>Your account will be created as a <strong>Guest</strong></li>
          <li>An Administrator will review and assign your proper role (Learner/Trainer/Observer)</li>
        </ul>
      </div>

      <div className="mb-8">
        <button 
          type="button"
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2" 
          onClick={handleGoogleLogin}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
          </svg>
          CONTINUE WITH GOOGLE
        </button>
      </div>
      
      <div className="relative flex py-5 items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink-0 mx-4 text-gray-400">OR REGISTER WITH EMAIL</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <form 
        onSubmit={handleRegister} 
        onChange={(e) => setIsValid(e.currentTarget.checkValidity())}
        className="flex flex-col gap-4"
      >
        <h2 className="text-lg font-semibold">1. Personal Information</h2>
        <input name="fullName" className="border p-2 rounded" type="text" placeholder="Full Name *" required />
        <input name="email" className="border p-2 rounded" type="email" placeholder="Email *" required />
        <div className="relative">
          <input name="password" className="border p-2 rounded w-full pr-10" type={showPassword ? "text" : "password"} placeholder="Password *" required />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                <line x1="2" y1="2" x2="22" y2="22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
        
        <h2 className="text-lg font-semibold mt-4">2. Structured Address</h2>
        <input name="address1" className="border p-2 rounded" type="text" placeholder="Lot / Unit # / House No. *" required />
        <input name="address2" className="border p-2 rounded" type="text" placeholder="Street Name *" required />
        <input name="address3" className="border p-2 rounded" type="text" placeholder="Address Line 3 (Optional)" />
        
        <div className="grid grid-cols-2 gap-4">
          <input 
            name="postcode" 
            className="border p-2 rounded" 
            type="text" 
            placeholder="Postcode *" 
            value={postcode}
            onChange={handlePostcodeChange}
            required 
            maxLength={5}
          />
          <input 
            name="city" 
            className="border p-2 rounded" 
            type="text" 
            placeholder="City *" 
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setIsValid(e.target.form!.checkValidity());
            }}
            required 
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <select 
            name="state" 
            className="border p-2 rounded" 
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setIsValid(e.target.form!.checkValidity());
            }}
            required
          >
            <option value="">-- Select State * --</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        
        <button 
          type="submit" 
          disabled={loading || !isValid} 
          className={`text-white py-3 px-4 rounded mt-4 transition-colors font-semibold ${loading || !isValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Submitting...' : 'SUBMIT REGISTRATION'}
        </button>
      </form>
    </div>
  );
}
