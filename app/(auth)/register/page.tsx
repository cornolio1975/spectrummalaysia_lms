"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function RegisterPage() {
  const [role, setRole] = useState<'LEARNER' | 'TRAINER' | null>(null);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation of standard supabase auth sign up, 
    // including structured address saving to 'participants' or 'trainers' table
    alert('Registration submitted successfully. Your account is currently pending administrator approval.');
  };

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-6">Choose Registration Type</h1>
        <div className="flex gap-4">
          <button className="border p-6 rounded" onClick={() => setRole('LEARNER')}>
            <h2 className="text-xl font-bold mb-2">LEARNER</h2>
            <p className="mb-4">Register as a learner to access assigned courses.</p>
            <span className="bg-blue-600 text-white px-4 py-2 rounded">REGISTER AS LEARNER</span>
          </button>
          <button className="border p-6 rounded" onClick={() => setRole('TRAINER')}>
            <h2 className="text-xl font-bold mb-2">TRAINER</h2>
            <p className="mb-4">Register as a trainer to provide training.</p>
            <span className="bg-blue-600 text-white px-4 py-2 rounded">REGISTER AS TRAINER</span>
          </button>
        </div>
        <div className="mt-8">
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleGoogleLogin}>
            CONTINUE WITH GOOGLE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{role} REGISTRATION</h1>
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">1. Personal Information</h2>
        <input className="border p-2" type="text" placeholder="Full Name" required />
        <input className="border p-2" type="email" placeholder="Email" required />
        <input className="border p-2" type="password" placeholder="Password" required />
        
        <h2 className="text-lg font-semibold mt-4">2. Structured Address</h2>
        <input className="border p-2" type="text" placeholder="House / Apartment / Lot Number" required />
        <input className="border p-2" type="text" placeholder="Street Address" required />
        <input className="border p-2" type="text" placeholder="Address Line 3 (Optional)" />
        <input className="border p-2" type="text" placeholder="Postcode" required />
        <input className="border p-2" type="text" placeholder="City" required />
        
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded mt-4">
          SUBMIT REGISTRATION
        </button>
      </form>
    </div>
  );
}
