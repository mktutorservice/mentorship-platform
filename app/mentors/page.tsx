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

export default function MentorsPage() {
  const router = useRouter();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [requestedIds, setRequestedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchMentors() {
      // 1. Verify Authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }

      // 2. Query real profiles where role = 'MENTOR'
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

  const handleRequest = (mentor: MentorProfile) => {
    setRequestedIds((prev) => ({ ...prev, [mentor.id]: true }));
    alert(`Mentorship request sent to ${mentor.name || mentor.username}!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#12121e] flex items-center justify-center text-[#8458B3] font-medium animate-pulse">
        Loading registered mentors...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#12121e] text-white px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#D0BDF4] mb-1">Available Mentors</h1>
        <p className="text-sm text-gray-400 mb-8">Connect with verified industry peers and experts.</p>

        {mentors.length === 0 ? (
          <div className="bg-[#1b1b26] p-8 rounded-2xl border border-white/10 text-center text-gray-400">
            No registered mentors found in the database.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => {
              const displayName = mentor.name || mentor.username;
              const initials = displayName
                ? displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                : 'M';

              return (
                <div
                  key={mentor.id}
                  className="bg-[#1b1b26] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-[#8458B3]/20 border border-[#8458B3] flex items-center justify-center text-lg font-bold text-white shrink-0">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{displayName}</h3>
                        <p className="text-xs text-[#D0BDF4]">@{mentor.username}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {mentor.bio || 'Available for 1-on-1 mentorship sessions.'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRequest(mentor)}
                    disabled={requestedIds[mentor.id]}
                    className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition ${
                      requestedIds[mentor.id]
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-transparent'
                        : 'bg-[#8458B3] hover:bg-[#a280d3] text-white shadow-md'
                    }`}
                  >
                    {requestedIds[mentor.id] ? 'Request Sent' : 'Request Mentorship'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}