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
    <nav className="sticky top-0 z-40 w-full bg-[#0f0f17]/90 backdrop-blur-md border-b border-white/10 text-white py-4 px-6 md:px-8 shadow-md flex items-center justify-between">
      
      {/* BRAND LOGO */}
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

      {/* NAVIGATION ACTIONS */}
      <div className="flex items-center space-x-3 text-xs">
        
        {/* HOME ICON */}
        <Link 
          href="/feed"
          className="relative flex items-center justify-center p-1 hover:scale-110 transition-transform duration-200"
          title="Home Feed"
        >
          <Image 
            src="/snow-house.png" 
            alt="Home Feed" 
            width={28} 
            height={28} 
            className="object-contain w-7 h-7"
            priority
          />
        </Link>

        {/* PROFILE ICON */}
        <Link
          href="/profile"
          className="relative flex items-center justify-center p-1 hover:scale-110 transition-transform duration-200"
          title="Profile"
        >
          <Image
            src="/profile.png"
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full object-cover w-7 h-7"
            priority
          />
        </Link>

        {/* CREATE POST ICON */}
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-add-post-modal'))}
          className="relative flex items-center justify-center p-1 hover:scale-110 transition-transform duration-200 cursor-pointer"
          title="Create Post"
        >
          <Image 
            src="/plus.png" 
            alt="Add Post" 
            width={28} 
            height={28} 
            className="object-contain w-7 h-7"
            unoptimized
          />
        </button>

        {/* CONTACTS ICON */}
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-contacts-modal'))}
          className="relative flex items-center justify-center p-1 hover:scale-110 transition-transform duration-200 cursor-pointer"
          title="My Contacts"
        >
          <Image 
            src="/contacts.png" 
            alt="My Contacts" 
            width={24} 
            height={24} 
            className="object-contain w-6 h-6"
            style={{
              filter: 'invert(58%) sepia(85%) saturate(389%) hue-rotate(9deg) brightness(92%) contrast(88%)'
            }}
            unoptimized
          />
        </button>

        {/* VERIFICATION ICON */}
        <button 
          onClick={toggleVerification}
          className="relative flex items-center justify-center p-1 hover:scale-110 transition-transform duration-200 cursor-pointer"
          title={isVerified ? "Account Verified" : "Verify Account"}
        >
          <Image 
            src={isVerified ? "/verified.png" : "/unverified.png"} 
            alt={isVerified ? "Verified User" : "Unverified User"} 
            width={26} 
            height={26} 
            className="object-contain w-6 h-6"
            style={{
              filter: 'invert(58%) sepia(85%) saturate(389%) hue-rotate(9deg) brightness(92%) contrast(88%)'
            }}
            unoptimized
          />
        </button>

        {/* SETTINGS ICON */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-profile-settings'))}
          className="relative flex items-center justify-center p-1 hover:scale-110 transition-transform duration-200 cursor-pointer"
          title="Profile Settings"
        >
          <Image
            src="/sett.png"
            alt="Profile Settings"
            width={32}
            height={32}
            className="object-contain w-7 h-7"
            style={{
              filter: 'invert(58%) sepia(85%) saturate(389%) hue-rotate(9deg) brightness(92%) contrast(88%)'
            }}
            priority
          />
        </button>

        {/* SIGN OUT ICON */}
        <button
          onClick={handleSignOut}
          className="relative flex items-center justify-center p-1 hover:scale-110 transition-transform duration-200 cursor-pointer"
          title="Sign Out"
        >
          <img
            src="/logout.png"
            alt="Sign Out"
            className="brightness-0 invert object-contain w-7 h-7"
          />
        </button>
      </div>
    </nav>
  );
}