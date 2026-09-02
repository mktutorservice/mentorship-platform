'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface MentorProfile {
  id: string;
  name: string;
  username: string;
  profile_picture?: string;
  bio?: string;
  fee_status?: string;
  activity_status?: string;
  rating?: number;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function fetchMentors() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'MENTOR');

      if (error) {
        console.error('Error fetching mentors:', error.message);
      } else {
        setMentors(data || []);
      }
      setLoading(false);
    }

    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter((mentor) => {
    const query = searchQuery.toLowerCase();
    return (
      (mentor.name && mentor.name.toLowerCase().includes(query)) ||
      (mentor.username && mentor.username.toLowerCase().includes(query)) ||
      (mentor.bio && mentor.bio.toLowerCase().includes(query))
    );
  });

  return (
    <main className="min-h-screen bg-[#12121e] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#D0BDF4]">Available Mentors</h1>
            <p className="text-xs text-gray-400 mt-1">
              Connect with expert mentors, schedule sessions, and request private guidance.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search mentors by name or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 rounded-full bg-[#1b1b26] border border-white/10 text-white text-xs focus:outline-none focus:border-[#8458B3] w-full md:w-72"
          />
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#8458B3] text-sm font-medium animate-pulse">
            Loading mentor directory...
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="bg-[#1b1b26] p-8 rounded-2xl text-center border border-white/5">
            <p className="text-gray-400 text-xs">No mentors found matching your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-[#1b1b26] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#8458B3]/20 border border-[#8458B3] flex items-center justify-center text-xl font-bold text-white shrink-0 overflow-hidden">
                    {mentor.profile_picture ? (
                      <img src={mentor.profile_picture} alt={mentor.name} className="w-full h-full object-cover" />
                    ) : (
                      (mentor.name || mentor.username || 'M')[0].toUpperCase()
                    )}
                  </div>

                  <div>
                    <h3 className="text-md font-bold text-white">{mentor.name || mentor.username}</h3>
                    <p className="text-xs text-[#D0BDF4]">@{mentor.username || 'mentor'}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#8458B3]/20 text-[#A0D2EB] text-[10px] font-semibold rounded-full border border-[#8458B3]/40">
                      {mentor.fee_status || 'Per Hour'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 line-clamp-3">
                  {mentor.bio || mentor.activity_status || 'Experienced mentor offering guidance and code reviews.'}
                </p>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <Link
                    href={`/private-rooms?mentorId=${mentor.id}`}
                    className="flex-1 py-2 px-3 bg-[#8458B3] hover:bg-[#a280d3] text-white rounded-xl text-xs font-semibold transition text-center"
                  >
                    Connect
                  </Link>
                  <Link
                    href={`/profile?id=${mentor.id}`}
                    className="py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold transition text-center"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}