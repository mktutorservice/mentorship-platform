'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
    }
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (pathname === '/' || !mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-4 py-3 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        <Link href="/feed" className="text-xl font-bold tracking-tight text-gray-900">
          MentorshipPlatform
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
          <Link href="/feed" className="hover:text-black transition">
            Home
          </Link>
          <Link href="/classrooms" className="hover:text-black transition">
            Classrooms
          </Link>
          <Link href="/private-rooms" className="hover:text-black transition">
            Private Rooms
          </Link>
          <Link href="/mentors" className="hover:text-black transition">
            Available Mentors
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          {isAuthenticated && (
            <Link
              href="/profile"
              className="text-sm font-medium text-gray-600 hover:text-black transition"
            >
              Profile
            </Link>
          )}

          <Link
            href="/settings"
            className="text-sm font-medium text-gray-600 hover:text-black transition px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            Settings
          </Link>

          {!isAuthenticated && (
            <Link
              href="/login"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium px-4 py-1.5 rounded-lg border border-gray-300/60 transition shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}