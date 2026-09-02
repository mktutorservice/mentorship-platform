'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const [userName, setUserName] = useState<string>('User');
  const [mounted, setMounted] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.name) setUserName(profile.name);
      }
    }
    checkAuth();
  }, []);

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

      {/* FLOATING TRIGGER BUTTON - POSITIONED DIRECTLY UNDER NAVBAR */}
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-20 left-6 z-40 w-10 h-10 rounded-full bg-[#B38728] hover:bg-[#966f1f] text-black transition-all shadow-xl active:scale-95 flex items-center justify-center border border-black/20"
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
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#B38728]/10 text-[#B38728] font-bold text-sm"
                >
                  <span>🏠</span> Dashboard
                </Link>

                <Link
                  href="/about"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white text-sm font-medium transition-colors"
                >
                  <span>ℹ️</span> About Us
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
        
        <section className="bg-[#171722]/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-2">
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            Hello, <span className="text-[#B38728]">{userName}</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-400 max-w-xl">
            Explore available mentorship sessions, join live interactive classrooms, or review community feed updates.
          </p>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#171722]/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Active Mentors</span>
            <p className="text-2xl font-black text-white mt-1">24+</p>
          </div>
          <div className="bg-[#171722]/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Live Classrooms</span>
            <p className="text-2xl font-black text-white mt-1">12</p>
          </div>
          <div className="bg-[#171722]/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Community Posts</span>
            <p className="text-2xl font-black text-white mt-1">140+</p>
          </div>
          <div className="bg-[#171722]/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Private Sessions</span>
            <p className="text-2xl font-black text-white mt-1">8 Active</p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/posts"
            className="group relative bg-[#171722]/80 border border-white/10 hover:border-[#B38728]/50 rounded-3xl p-8 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-black text-white group-hover:text-[#B38728] transition-colors">
                Community Posts & Feed
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Share updates, participate in engineering discussions, and interact with fellow students and mentors.
              </p>
              <span className="inline-flex items-center gap-2 text-xs font-bold text-[#B38728]">
                Explore Feed &rarr;
              </span>
            </div>
          </Link>

          <Link
            href="/mentors"
            className="group relative bg-[#171722]/80 border border-white/10 hover:border-[#B38728]/50 rounded-3xl p-8 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-black text-white group-hover:text-[#B38728] transition-colors">
                Available Mentors
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Connect 1-on-1 with experienced mentors, book guidance sessions, and request project code reviews.
              </p>
              <span className="inline-flex items-center gap-2 text-xs font-bold text-[#B38728]">
                Find a Mentor &rarr;
              </span>
            </div>
          </Link>
        </section>

      </div>
    </main>
  );
}