'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);

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

  const toggleVerification = () => {
    setIsVerified((prev) => !prev);
  };

  if (pathname === '/' || pathname === '/login' || !mounted) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 w-full bg-transparent py-4 px-6 md:px-8 flex items-center justify-between">
      
      {/* BRAND LOGO (LEFT) */}
      <div className="flex-1 flex justify-start">
        <Link href="/feed" className="flex items-center gap-2 group">
          <svg
            viewBox="0 0 470 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 md:h-6 w-auto"
          >
            <path d="M5 2 V16 A6 6 0 0 0 17 16 V2" stroke="white" strokeWidth="3.5" strokeLinecap="square" />
            <path d="M27 22 V2 L45 22 V2" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M55 2 V22 M69 2 L55 12 L69 22" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M79 22 V2 L97 22 V2" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            <circle cx="117" cy="12" r="10" stroke="white" strokeWidth="3.5" />
            <path d="M137 2 L143 22 L149 10 L155 22 L161 2" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M171 22 V2 L189 22 V2" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M214 22 V2 L222 14 L230 2 V22" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M254 2 H240 V22 H254 M240 12 H250" stroke="white" strokeWidth="3.5" strokeLinecap="square" />
            <path d="M264 22 V2 L282 22 V2" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M292 2 H312 M302 2 V22" stroke="white" strokeWidth="3.5" strokeLinecap="square" />
            <circle cx="328" cy="12" r="10" stroke="white" strokeWidth="3.5" />
            <path d="M346 22 V2 H356 A5 5 0 0 1 356 12 H346 M354 12 L362 22" stroke="white" strokeWidth="3.5" strokeLinecap="square" />
            <path d="M384 6 C384 2, 372 2, 372 7 C372 12, 384 12, 384 17 C384 22, 372 22, 372 18" stroke="white" strokeWidth="3.5" strokeLinecap="square" />
            <path d="M394 2 V22 M394 12 H410 M410 2 V22" stroke="white" strokeWidth="3.5" strokeLinecap="square" />
            <path d="M420 2 V22" stroke="white" strokeWidth="3.5" strokeLinecap="square" />
            <path d="M430 22 V2 H442 A5 5 0 0 1 442 12 H430" stroke="white" strokeWidth="3.5" strokeLinecap="square" />
            <rect x="452" y="18" width="4" height="4" fill="#B38728" />
          </svg>
        </Link>
      </div>

      {/* FLOATING CAPSULE NAVIGATION (CENTER) */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-2 sm:gap-4 px-5 py-2 rounded-full bg-[#151622]/80 backdrop-blur-xl border border-[#B38728]/40 shadow-[0_0_20px_rgba(179,135,40,0.15)] transition-all duration-300">
          
          {/* HOME ICON */}
          <Link 
            href="/feed"
            className={`relative p-2 rounded-full transition-all duration-200 ${
              pathname === '/feed' 
                ? 'bg-[#B38728]/25 shadow-[0_0_12px_rgba(179,135,40,0.4)] scale-105' 
                : 'hover:bg-white/5 hover:scale-105'
            }`}
            title="Home Feed"
          >
            <Image 
              src="/snow-house.png" 
              alt="Home Feed" 
              width={26} 
              height={26} 
              className="object-contain w-6 h-6"
              priority
            />
            {pathname === '/feed' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FCF6BA] rounded-full shadow-[0_0_6px_#FCF6BA]" />
            )}
          </Link>

          {/* POSTS PAGE ICON (USER GENERATED CONTENT) */}
          <Link 
            href="/posts"
            className={`relative p-2 rounded-full transition-all duration-200 ${
              pathname === '/posts' 
                ? 'bg-[#B38728]/25 shadow-[0_0_12px_rgba(179,135,40,0.4)] scale-105' 
                : 'hover:bg-white/5 hover:scale-105'
            }`}
            title="Community Posts"
          >
            <Image 
              src="/user-generated-content.png" 
              alt="Community Posts" 
              width={26} 
              height={26} 
              className="object-contain w-6 h-6"
              unoptimized
            />
            {pathname === '/posts' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FCF6BA] rounded-full shadow-[0_0_6px_#FCF6BA]" />
            )}
          </Link>

          {/* PROFILE ICON */}
          <Link
            href="/profile"
            className={`relative p-2 rounded-full transition-all duration-200 ${
              pathname === '/profile' 
                ? 'bg-[#B38728]/25 shadow-[0_0_12px_rgba(179,135,40,0.4)] scale-105' 
                : 'hover:bg-white/5 hover:scale-105'
            }`}
            title="Profile"
          >
            <Image
              src="/profile.png"
              alt="Profile"
              width={28}
              height={28}
              className="rounded-full object-cover w-6 h-6"
              priority
            />
            {pathname === '/profile' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FCF6BA] rounded-full shadow-[0_0_6px_#FCF6BA]" />
            )}
          </Link>

          {/* CREATE POST ICON */}
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-add-post-modal'))}
            className="relative p-2 rounded-full hover:bg-white/5 hover:scale-105 transition-all duration-200 cursor-pointer"
            title="Create Post Modal"
          >
            <Image 
              src="/plus.png" 
              alt="Add Post" 
              width={26} 
              height={26} 
              className="object-contain w-6 h-6"
              unoptimized
            />
          </button>

          {/* CONTACTS ICON */}
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-contacts-modal'))}
            className="relative p-2 rounded-full hover:bg-white/5 hover:scale-105 transition-all duration-200 cursor-pointer"
            title="My Contacts"
          >
            <Image 
              src="/contacts.png" 
              alt="My Contacts" 
              width={22} 
              height={22} 
              className="object-contain w-5.5 h-5.5"
              style={{
                filter: 'invert(58%) sepia(85%) saturate(389%) hue-rotate(9deg) brightness(92%) contrast(88%)'
              }}
              unoptimized
            />
          </button>

          {/* VERIFICATION ICON */}
          <button 
            onClick={toggleVerification}
            className="relative p-2 rounded-full hover:bg-white/5 hover:scale-105 transition-all duration-200 cursor-pointer"
            title={isVerified ? "Account Verified" : "Verify Account"}
          >
            <Image 
              src={isVerified ? "/verified.png" : "/unverified.png"} 
              alt={isVerified ? "Verified User" : "Unverified User"} 
              width={24} 
              height={24} 
              className="object-contain w-5.5 h-5.5"
              style={{
                filter: 'invert(58%) sepia(85%) saturate(389%) hue-rotate(9deg) brightness(92%) contrast(88%)'
              }}
              unoptimized
            />
          </button>

          {/* SETTINGS ICON */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-profile-settings'))}
            className="relative p-2 rounded-full hover:bg-white/5 hover:scale-105 transition-all duration-200 cursor-pointer"
            title="Profile Settings"
          >
            <Image
              src="/sett.png"
              alt="Profile Settings"
              width={28}
              height={28}
              className="object-contain w-6 h-6"
              style={{
                filter: 'invert(58%) sepia(85%) saturate(389%) hue-rotate(9deg) brightness(92%) contrast(88%)'
              }}
              priority
            />
          </button>

          {/* SIGN OUT ICON */}
          <button
            onClick={handleSignOut}
            className="relative p-2 rounded-full hover:bg-white/5 hover:scale-105 transition-all duration-200 cursor-pointer"
            title="Sign Out"
          >
            <img
              src="/logout.png"
              alt="Sign Out"
              className="brightness-0 invert object-contain w-6 h-6"
            />
          </button>

        </div>
      </div>

      {/* RIGHT SIDE EMPTY SPACER */}
      <div className="flex-1 hidden md:block" />

    </nav>
  );
}