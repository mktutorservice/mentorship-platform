'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import BackgroundSelector from '@/app/components/BackgroungSelector';

export default function HomePage() {
  const [role, setRole] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  
  // Dynamic Background State
  const [bgImage, setBgImage] = useState<string>('/hero-bg.jpg');
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    // Load saved background choice from localStorage
    const savedBg = localStorage.getItem('user_bg_image');
    if (savedBg) {
      setBgImage(savedBg);
    }

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        setRole(session.user.user_metadata?.role || 'Student');
      } else {
        setIsAuthenticated(false);
        const guestRole = localStorage.getItem('user_role');
        setRole(guestRole || 'Guest');
      }
    }
    checkAuth();
  }, []);

  const handleSelectBackground = (newBgUrl: string) => {
    setBgImage(newBgUrl);
    localStorage.setItem('user_bg_image', newBgUrl);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user_role');
    window.location.href = '/login';
  };

  if (!mounted) return null;

  return (
    <main 
      className="min-h-screen bg-cover bg-center bg-fixed relative flex items-center justify-center p-4 transition-all duration-500"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      {/* Dark semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <section className="relative z-10 w-full max-w-4xl mx-auto space-y-8 py-10">
        
        {/* Header Card */}
        <div className="bg-[#494D5F]/90 backdrop-blur-md text-white rounded-3xl p-6 shadow-xl flex items-center justify-between border border-white/10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#A0D2EB]">Home</h1>
            <p className="text-xs text-[#E5EAF5] mt-1 capitalize">
              Active Role: <span className="font-semibold text-white">{role}</span>
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Change Background Button */}
            <button
              onClick={() => setIsSelectorOpen(true)}
              className="bg-[#353846] hover:bg-[#8458B3] text-white text-xs font-semibold px-4 py-2.5 rounded-full border border-white/10 transition shadow-sm cursor-pointer"
            >
              BACKGROUND
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="bg-[#8458B3] hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] text-xs font-semibold px-5 py-2.5 rounded-full transition shadow-sm"
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="bg-[#8458B3] hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] text-xs font-semibold px-5 py-2.5 rounded-full transition shadow-sm"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition shadow-sm cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-[#8458B3] hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] text-xs font-semibold px-6 py-2.5 rounded-full transition shadow-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Main Navigation Pill Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/posts"
            className="flex items-center justify-center p-6 rounded-full bg-[#8458B3]/90 hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] font-bold text-lg tracking-wide uppercase shadow-lg backdrop-blur-md transition-all duration-200 border border-white/20 transform hover:-translate-y-0.5"
          >
            Posts
          </Link>

          <Link
            href="/mentors"
            className="flex items-center justify-center p-6 rounded-full bg-[#8458B3]/90 hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] font-bold text-lg tracking-wide uppercase shadow-lg backdrop-blur-md transition-all duration-200 border border-white/20 transform hover:-translate-y-0.5"
          >
            Available Mentors
          </Link>

          <Link
            href="/classrooms"
            className="flex items-center justify-center p-6 rounded-full bg-[#8458B3]/90 hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] font-bold text-lg tracking-wide uppercase shadow-lg backdrop-blur-md transition-all duration-200 border border-white/20 transform hover:-translate-y-0.5"
          >
            Free Classrooms
          </Link>

          <Link
            href="/private-rooms"
            className="flex items-center justify-center p-6 rounded-full bg-[#8458B3]/90 hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] font-bold text-lg tracking-wide uppercase shadow-lg backdrop-blur-md transition-all duration-200 border border-white/20 transform hover:-translate-y-0.5"
          >
            Private Classrooms
          </Link>
        </div>

      </section>

      {/* Background Selector Modal */}
      <BackgroundSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelectBackground={handleSelectBackground}
      />
    </main>
  );
}