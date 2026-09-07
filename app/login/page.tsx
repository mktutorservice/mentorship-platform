'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'mentor' | 'parent'>('student');
  const [otpCode, setOtpCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setStep('otp');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        window.location.href = '/feed';
      }
    }

    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode.trim(),
      type: 'signup',
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else if (data.session) {
      window.location.href = '/feed';
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);

    // Dynamic origin keeps you on localhost:3000 in local dev
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
       redirectTo: `${origin}/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        ...(mode === 'signup' ? { data: { role } } : {}),
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setGoogleLoading(false);
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem('user_role', 'guest');
    document.cookie = 'guest-session=true; path=/; max-age=86400';
    window.location.href = '/feed';
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 bg-[#0f0f17]">
      <div className="w-full max-w-sm bg-[#171722] p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        
        {/* Logo Header */}
        <div className="text-center space-y-1">
          <svg
            viewBox="0 0 470 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-auto mx-auto mb-3"
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
        </div>

        {step === 'credentials' ? (
          <>
            <div className="text-center space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  {mode === 'signin'
                    ? 'Sign in to access your dashboard'
                    : 'Select your role and enter details'}
                </p>
              </div>

              <div className="grid grid-cols-2 bg-[#0f0f17] p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMsg(null); }}
                  className={`text-xs font-semibold py-1.5 rounded-lg transition ${
                    mode === 'signin' ? 'bg-[#B38728] text-[#0f0f17]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMsg(null); }}
                  className={`text-xs font-semibold py-1.5 rounded-lg transition ${
                    mode === 'signup' ? 'bg-[#B38728] text-[#0f0f17]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium">
                {errorMsg}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Select Your Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-sm p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#B38728] bg-[#0f0f17] text-white transition"
                >
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#0f0f17] hover:bg-[#1a1a28] disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl border border-white/10 transition shadow-sm cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              {googleLoading
                ? 'Redirecting...'
                : mode === 'signin'
                ? 'Sign in with Google'
                : 'Sign up with Google'}
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <span className="relative bg-[#171722] px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                OR
              </span>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-sm p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#B38728] bg-[#0f0f17] text-white placeholder-gray-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#B38728] bg-[#0f0f17] text-white placeholder-gray-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gold-bg hover:brightness-110 disabled:opacity-50 text-[#0f0f17] text-sm font-bold py-2.5 rounded-xl transition shadow-lg cursor-pointer"
              >
                {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Send Verification Code'}
              </button>
            </form>

            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full bg-transparent hover:bg-white/5 text-gray-300 text-sm font-medium py-2.5 rounded-xl border border-white/10 transition cursor-pointer"
            >
              Continue as Guest &rarr;
            </button>
          </>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white tracking-tight">Verify Email</h1>
              <p className="text-xs text-gray-400 mt-1">
                We sent a code to <span className="font-semibold text-gray-200">{email}</span>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-lg font-mono p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#B38728] bg-[#0f0f17] text-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gold-bg hover:brightness-110 disabled:opacity-50 text-[#0f0f17] text-sm font-bold py-2.5 rounded-xl transition shadow-lg cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Verify Code & Sign In'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setStep('credentials')}
              className="w-full text-xs text-gray-400 hover:text-white font-medium text-center transition"
            >
              &larr; Back to registration
            </button>
          </div>
        )}

      </div>
    </section>
  );
}