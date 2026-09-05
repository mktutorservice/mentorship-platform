'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

interface MentorProfile {
  id: string;
  name?: string;
  gender?: string;
  department?: string;
  phone?: string;
  phone_number?: string;
  activity_status?: string;
  profile_picture?: string;
  role?: string;
}

export default function HomePage() {
  const [userName, setUserName] = useState<string>('User');
  const [mounted, setMounted] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  
  // Data States
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loadingMentors, setLoadingMentors] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(7);

  useEffect(() => {
    setMounted(true);

    async function loadDashboardData() {
      // 1. Get logged-in user details
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.name) setUserName(profile.name);
      }

      // 2. Fetch profiles from 'profiles' table
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*');

      // 3. Fetch all inserted entries from 'students' table
      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .order('name', { ascending: true });

      // Format students table data to match the mentor profile structure
      const formattedStudents = (studentsData || []).map((s, idx) => ({
        id: s.id || `student-${idx}`,
        name: s.name,
        gender: s.gender,
        department: s.department,
        phone: s.phone_number || s.phone,
        activity_status: 'Available for mentoring',
        role: 'MENTOR',
      }));

      // Combine both datasets
      const combinedData = [...(profilesData || []), ...formattedStudents];
      setMentors(combinedData);

      setLoadingMentors(false);
    }

    loadDashboardData();
  }, []);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 7);
  };

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen bg-[#0f0f17] text-white selection:bg-[#B38728] selection:text-white overflow-hidden pb-16">
      
      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg-tech.jpg"
          alt="Dashboard Background"
          fill
          priority
          className="object-cover object-center opacity-30 mix-blend-screen transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f17]/80 via-[#0f0f17]/60 to-[#0f0f17]" />
      </div>

      {/* FLOATING NAVIGATION BUTTON */}
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-20 left-6 z-40 w-10 h-10 rounded-full bg-[#B38728] hover:bg-[#966f1f] text-black transition-all shadow-xl active:scale-95 flex items-center justify-center border border-black/20 cursor-pointer"
        aria-label="Open Navigation Menu"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* DRAWER MENU OVERLAY */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          <aside className="relative w-80 max-w-[80vw] bg-[#171722] border-r border-white/10 p-6 flex flex-col justify-between z-10 shadow-2xl transition-transform duration-300">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <span className="text-sm font-black uppercase tracking-widest text-white">
                  Navigation<span className="text-[#B38728]">.</span>
                </span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-2">
                <Link
                  href="/feed"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#B38728]/10 text-[#B38728] font-bold text-sm"
                >
                  <span>🏠</span> Dashboard
                </Link>

                <Link
                  href="/create-profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  <span>👤</span> Create Profile
                </Link>

                <Link
                  href="/mentors"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  <span>👥</span> Mentors & Sessions
                </Link>

                <Link
                  href="/posts"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  <span>💬</span> Community Feed
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  <span>⚙️</span> Settings
                </Link>
              </nav>
            </div>

            <div className="border-t border-white/10 pt-4 text-xs text-gray-500">
              Logged in as <span className="text-white font-semibold">{userName}</span>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-10">
        
        {/* Welcome Section */}
        <section className="bg-[#171722]/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-2">
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            Hello, <span className="text-[#B38728]">{userName}</span>
          </h1>
        </section>

        {/* AVAILABLE MENTORS SINGLE-COLUMN LIST */}
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              {/* Mentorship Icon Box matching design */}
              <div className="w-9 h-9 rounded-xl bg-[#B38728]/15 border border-[#B38728]/30 flex items-center justify-center text-[#B38728] shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span>Available Mentors</span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#B38728]/20 text-[#B38728] border border-[#B38728]/30">
                {mentors.length}
              </span>
            </h2>
          </div>

          {loadingMentors ? (
            <div className="text-center py-12 text-xs text-gray-500 animate-pulse">Loading mentors catalog...</div>
          ) : mentors.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400 bg-[#171722]/40 rounded-3xl border border-white/5">
              No mentor profiles found in database.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Single column row layout sliced to visibleCount */}
              <div className="grid grid-cols-1 gap-4">
                {mentors.slice(0, visibleCount).map((mentor, index) => (
                  <div 
                    key={mentor.id || index} 
                    className="group relative bg-gradient-to-r from-[#1c1c2b]/90 via-[#181826]/90 to-[#141420]/90 hover:from-[#222233] hover:to-[#181826] border border-white/10 hover:border-[#B38728]/50 rounded-2xl p-5 backdrop-blur-2xl shadow-lg transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Mentor Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#B38728]/30 bg-[#252538] flex items-center justify-center font-black text-[#B38728] text-xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                          {mentor.profile_picture ? (
                            <img src={mentor.profile_picture} alt={mentor.name || 'Mentor'} className="w-full h-full object-cover" />
                          ) : (
                            mentor.name ? mentor.name.charAt(0).toUpperCase() : 'M'
                          )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#141420] rounded-full" />
                      </div>

                      {/* Mentor Name and Department */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-base text-white group-hover:text-[#B38728] transition-colors">
                            {mentor.name || 'Anonymous Mentor'}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold tracking-wider uppercase bg-[#B38728]/15 text-[#B38728] border border-[#B38728]/30">
                            {mentor.role || 'MENTOR'}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-400">
                          {mentor.department || 'Software Engineering'}
                        </p>
                      </div>
                    </div>

                    {/* Right Side Status & Phone */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-gray-400 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                      <span className="italic text-gray-400">
                        {mentor.phone || mentor.phone_number ? `📞 ${mentor.phone || mentor.phone_number}` : `"${mentor.activity_status || 'Available'}"`}
                      </span>
                      <span className="text-[#B38728] font-bold text-lg group-hover:translate-x-1 transition-transform">
                        &rarr;
                      </span>
                    </div>

                  </div>
                ))}
              </div>

              {/* CHEVRON ICON BUTTON (USING /chevron.png) */}
              {visibleCount < mentors.length && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    aria-label="Load more mentors"
                    className="group flex items-center justify-center p-2 rounded-full bg-[#171722]/80 hover:bg-[#B38728]/20 border border-[#B38728]/30 hover:border-[#B38728] transition-all duration-300 shadow-lg active:scale-95 cursor-pointer"
                  >
                    <Image
                      src="/chevron.png"
                      alt="Load more"
                      width={28}
                      height={28}
                      className="object-contain transition-transform duration-300 group-hover:translate-y-1"
                    />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}