'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Guest');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    async function checkAuthAndProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      setIsAuthenticated(!!user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.name) {
          setUserName(profile.name);
        }
      }
    }

    checkAuthAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user_role');
    setIsAuthenticated(false);
    setUserName('Guest');
    router.push('/login');
  };

  if (pathname === '/' || !mounted) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#494D5F]/90 backdrop-blur-md border-b border-white/10 text-white py-3 px-6 shadow-md flex items-center justify-between">
      <Link href="/feed" className="text-lg font-bold text-[#A0D2EB] hover:opacity-80 transition">
        MentorshipPlatform
      </Link>

      <div className="hidden md:flex items-center space-x-6 text-xs font-semibold">
        <Link href="/feed" className="hover:text-[#D0BDF4] transition">
          Home
        </Link>
        <Link href="/classrooms" className="hover:text-[#D0BDF4] transition">
          Classrooms
        </Link>
        
        {isAuthenticated && (
          <Link href="/private-rooms" className="hover:text-[#D0BDF4] transition">
            Private Rooms
          </Link>
        )}

        <Link href="/mentors" className="hover:text-[#D0BDF4] transition">
          Available Mentors
        </Link>
      </div>

      <div className="flex items-center space-x-3 text-xs">
        {isAuthenticated && (
          <span className="text-[#E5EAF5] font-medium hidden sm:inline">
            {userName}
          </span>
        )}

        {isAuthenticated && (
          <Link
            href="/profile"
            className="text-xs font-semibold bg-[#8458B3] hover:bg-[#D0BDF4] hover:text-[#494D5F] px-3 py-1.5 rounded-full transition"
          >
            Profile
          </Link>
        )}

        {!isAuthenticated ? (
          <Link
            href="/login"
            className="bg-[#353846] hover:bg-[#8458B3] text-white text-xs font-medium px-4 py-1.5 rounded-full border border-white/10 transition shadow-sm"
          >
            Log In
          </Link>
        ) : (
          <button
            onClick={handleSignOut}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-medium px-4 py-1.5 rounded-full border border-red-500/30 transition shadow-sm cursor-pointer"
          >
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
}