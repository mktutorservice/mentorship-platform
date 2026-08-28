'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleGuestMode = () => {
    router.push('/feed');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f9fa] px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm text-center space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            MentorshipPlatform
          </h1>
          <p className="text-xs text-gray-500 mt-1.5">
            Select an entry path to get started
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/login"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2.5 rounded-xl transition shadow-sm flex items-center justify-center"
          >
            Sign Up
          </Link>

          <Link
            href="/login"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium py-2.5 rounded-xl border border-gray-300/60 transition flex items-center justify-center"
          >
            Sign In
          </Link>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <span className="relative bg-white px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            OR
          </span>
        </div>

        <button
          onClick={handleGuestMode}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-xl border border-gray-300/80 transition shadow-sm cursor-pointer"
        >
          Guest Mode
        </button>
      </div>
    </main>
  );
}