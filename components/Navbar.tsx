'use client';

import { useEffect, useState } from 'react';
import LinkNext from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    async function checkAuthAndProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
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
    router.push('/login');
  };

  if (!mounted || pathname === '/' || pathname === '/login') {
    return null;
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const isDark = currentTheme === 'dark';

  const goldIconFilter = "invert(62%) sepia(43%) saturate(762%) hue-rotate(8deg) brightness(92%) contrast(88%)";

  return (
    <nav className="sticky top-0 z-50 w-full py-2.5 px-3 sm:px-6 flex items-center justify-between border-b border-[#B38728]/30 bg-[#0b0c10] backdrop-blur-md">
      
      {/* BRAND LOGO */}
      <div className="shrink-0 flex items-center mr-2">
        <LinkNext href="/feed" className="flex items-center">
          <svg
            viewBox="0 0 470 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 sm:h-5 md:h-6 w-auto max-w-[100px] sm:max-w-[150px] md:max-w-none"
          >
            <path d="M5 2 V16 A6 6 0 0 0 17 16 V2" stroke="#B38728" strokeWidth="3.5" strokeLinecap="square" />
            <path d="M27 22 V2 L45 22 V2" stroke="#B38728" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M55 2 V22 M69 2 L55 12 L69 22" stroke="#B38728" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M79 22 V2 L97 22 V2" stroke="#B38728" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            <circle cx="117" cy="12" r="10" stroke="#B38728" strokeWidth="3.5" />
            <path d="M137 2 L143 22 L149 10 L155 22 L161 2" stroke="#B38728" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M171 22 V2 L189 22 V2" stroke="#B38728" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M214 22 V2 L222 14 L230 2 V22" stroke="#B38728" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M254 2 H240 V22 H254 M240 12 H250" stroke="#B38728" strokeWidth="3.5" strokeLinecap="square" />
            <path d="M264 22 V2 L282 22 V2" stroke="#B38728" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M292 2 H312 M302 2 V22" stroke="#B38728" strokeWidth="3.5" strokeLinecap="square" />
            <circle cx="328" cy="12" r="10" stroke="#B38728" strokeWidth="3.5" />
            <path d="M346 22 V2 H356 A5 5 0 0 1 356 12 H346 M354 12 L362 22" stroke="#B38728" strokeWidth="3.5" strokeLinecap="square" />
            <path d="M384 6 C384 2, 372 2, 372 7 C372 12, 384 12, 384 17 C384 22, 372 22, 372 18" stroke="#B38728" strokeWidth="3.5" strokeLinecap="square" />
            <path d="M394 2 V22 M394 12 H410 M410 2 V22" stroke="#B38728" strokeWidth="3.5" strokeLinecap="square" />
            <path d="M420 2 V22" stroke="#B38728" strokeWidth="3.5" strokeLinecap="square" />
            <path d="M430 22 V2 H442 A5 5 0 0 1 442 12 H430" stroke="#B38728" strokeWidth="3.5" strokeLinecap="square" />
            <rect x="452" y="18" width="4" height="4" fill="#B38728" />
          </svg>
        </LinkNext>
      </div>

      {/* NAVIGATION ICONS */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 max-w-full">
        
        {/* HOME FEED */}
        <LinkNext 
          href="/feed"
          className={`p-1.5 sm:p-2 rounded-xl border transition-all duration-200 shrink-0 ${
            pathname === '/feed' 
              ? 'bg-[#B38728]/25 border-[#B38728]' 
              : 'bg-black/40 border-[#B38728]/30 hover:bg-black/60'
          }`}
          title="Home Feed"
        >
          <Image src="/snow-house.png" alt="Home" width={18} height={18} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
        </LinkNext>

        {/* POSTS */}
        <LinkNext 
          href="/posts"
          className={`p-1.5 sm:p-2 rounded-xl border transition-all duration-200 shrink-0 ${
            pathname === '/posts' 
              ? 'bg-[#B38728]/25 border-[#B38728]' 
              : 'bg-black/40 border-[#B38728]/30 hover:bg-black/60'
          }`}
          title="Community Posts"
        >
          <Image src="/user-generated-content.png" alt="Posts" width={18} height={18} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
        </LinkNext>

        {/* PROFILE */}
        <LinkNext
          href="/profile"
          className={`p-1.5 sm:p-2 rounded-xl border transition-all duration-200 shrink-0 ${
            pathname === '/profile' 
              ? 'bg-[#B38728]/25 border-[#B38728]' 
              : 'bg-black/40 border-[#B38728]/30 hover:bg-black/60'
          }`}
          title="Profile"
        >
          <Image src="/privacy.png" alt="Profile" width={18} height={18} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
        </LinkNext>

        {/* ADD POST MODAL TRIGGER */}
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-add-post-modal'))}
          className="p-1.5 sm:p-2 rounded-xl bg-black/40 border border-[#B38728]/30 hover:bg-black/60 transition-all duration-200 cursor-pointer shrink-0"
          title="Create Post"
        >
          <Image src="/plus.png" alt="Add Post" width={18} height={18} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
        </button>

        {/* CONTACTS */}
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-contacts-modal'))}
          className="p-1.5 sm:p-2 rounded-xl bg-black/40 border border-[#B38728]/30 hover:bg-black/60 transition-all duration-200 cursor-pointer shrink-0"
          title="My Contacts"
        >
          <Image src="/contacts.png" alt="Contacts" width={18} height={18} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
        </button>

        {/* VERIFIED BADGE */}
        <div 
          className="p-1.5 sm:p-2 rounded-xl bg-black/40 border border-[#B38728]/30 shrink-0"
          title="Account Verified"
        >
          <Image src="/verified.png" alt="Verified User" width={18} height={18} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
        </div>

        {/* SETTINGS */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-profile-settings'))}
          className="p-1.5 sm:p-2 rounded-xl bg-black/40 border border-[#B38728]/30 hover:bg-black/60 transition-all duration-200 cursor-pointer shrink-0"
          title="Profile Settings"
        >
          <Image src="/sett.png" alt="Settings" width={18} height={18} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
        </button>

        {/* THEME TOGGLE */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="p-1.5 sm:p-2 rounded-xl bg-black/40 border border-[#B38728]/30 hover:bg-black/60 transition-all duration-200 cursor-pointer shrink-0"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <Image src="/contrast.png" alt="Theme" width={18} height={18} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
        </button>

        {/* SIGN OUT */}
        <button
          onClick={handleSignOut}
          className="p-1.5 sm:p-2 rounded-xl bg-black/40 border border-[#B38728]/30 hover:bg-black/60 transition-all duration-200 cursor-pointer shrink-0"
          title="Sign Out"
        >
          <Image 
            src="/logout.png" 
            alt="Sign Out" 
            width={18} 
            height={18} 
            className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
            style={{ filter: goldIconFilter }}
          />
        </button>

      </div>
    </nav>
  );
}