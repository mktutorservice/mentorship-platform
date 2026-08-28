'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email ?? '');
    }
    getUser();
  }, []);

  return (
    <section className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account details and preferences</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex items-center space-x-4 pb-4 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center font-bold text-xl text-gray-700">
            {email ? email[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Account Profile</h2>
            <p className="text-sm text-gray-500">{email || 'Loading user info...'}</p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </section>
  );
}