'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface MentorProfile {
  id: string;
  name: string;
  username: string;
  bio?: string;
  role: string;
  is_verified?: boolean;
}

export default function AvailableMentorsPage() {
  const router = useRouter();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [requestedIds, setRequestedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchMentors() {
      // 1. Check user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }

      // 2. Query Supabase profiles table for MENTOR accounts
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'MENTOR');

      if (error) {
        console.error('Error loading mentors:', error.message);
      } else {
        setMentors(data || []);
      }
      setLoading(false);
    }

    fetchMentors();
  }, [router]);

  const handleRequestMentorship = (mentor: MentorProfile) => {
    setRequestedIds((prev) => ({ ...prev, [mentor.id]: true }));
    alert(`Mentorship request sent to ${mentor.name || mentor.username}!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center text-gray-700 font-medium">
        Loading mentors...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef2f7] px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0d1b2a] mb-1">Available Mentors</h1>
        <p className="text-sm text-gray-500 mb-8">Connect with industry peers and experts</p>

        {mentors.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center shadow-sm">
            <p className="text-gray-500">No registered mentors found in database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => {
              const displayName = mentor.name || mentor.username || 'Software Mentor';
              const initials = displayName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={mentor.id}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center shrink-0 border border-gray-200">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{displayName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {mentor.bio || 'Full-Stack & Systems Architecture'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => handleRequestMentorship(mentor)}
                      disabled={requestedIds[mentor.id]}
                      className={`w-full py-2 px-4 rounded-xl text-xs font-semibold transition ${
                        requestedIds[mentor.id]
                          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                          : 'bg-[#eef2f7] hover:bg-gray-200 text-gray-800 border border-gray-300'
                      }`}
                    >
                      {requestedIds[mentor.id] ? 'Request Sent' : 'Request Mentorship'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}