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

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
    window.location.href = '/feed';
  };

  return (
    <main className="min-h-screen bg-[#12121e] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1b1b26] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {step === 'credentials' ? (
          <>
            <div className="text-center space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-[#D0BDF4] tracking-tight">
                  {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  {mode === 'signin'
                    ? 'Sign in to access your mentorship dashboard'
                    : 'Select your role and register details'}
                </p>
              </div>

              <div className="grid grid-cols-2 bg-[#12121e] p-1 rounded-2xl border border-white/5">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMsg(null); }}
                  className={`text-xs font-semibold py-2 rounded-xl transition ${
                    mode === 'signin'
                      ? 'bg-[#8458B3] text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMsg(null); }}
                  className={`text-xs font-semibold py-2 rounded-xl transition ${
                    mode === 'signup'
                      ? 'bg-[#8458B3] text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-2xl text-xs text-red-200 text-center font-medium">
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
                  className="w-full text-xs p-3 rounded-2xl border border-white/10 focus:outline-none focus:border-[#8458B3] bg-[#12121e] text-white"
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
              className="w-full flex items-center justify-center gap-2 bg-[#12121e] hover:bg-black/40 disabled:opacity-50 text-white text-xs font-medium py-3 rounded-2xl border border-white/10 transition shadow-sm cursor-pointer"
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
              <span className="relative bg-[#1b1b26] px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
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
                  className="w-full text-xs p-3 rounded-2xl border border-white/10 focus:outline-none focus:border-[#8458B3] bg-[#12121e] text-white"
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
                  className="w-full text-xs p-3 rounded-2xl border border-white/10 focus:outline-none focus:border-[#8458B3] bg-[#12121e] text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8458B3] hover:bg-[#a280d3] disabled:opacity-50 text-white text-xs font-bold py-3 rounded-2xl transition shadow-lg cursor-pointer"
              >
                {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Send Verification Code'}
              </button>
            </form>

            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full bg-[#12121e] hover:bg-black/40 text-gray-300 text-xs font-semibold py-3 rounded-2xl border border-white/10 transition shadow-sm cursor-pointer"
            >
              Continue as Guest
            </button>
          </>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[#D0BDF4] tracking-tight">Verify Email</h1>
              <p className="text-xs text-gray-400 mt-1">
                We sent a code to <span className="font-semibold text-white">{email}</span>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-2xl text-xs text-red-200 text-center font-medium">
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
                  className="w-full text-center tracking-widest text-lg font-mono p-3 rounded-2xl border border-white/10 focus:outline-none focus:border-[#8458B3] bg-[#12121e] text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8458B3] hover:bg-[#a280d3] disabled:opacity-50 text-white text-xs font-bold py-3 rounded-2xl transition shadow-lg cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Verify Code & Sign In'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setStep('credentials')}
              className="w-full text-xs text-gray-400 hover:text-white font-medium text-center"
            >
              ← Back to registration
            </button>
          </div>
        )}

      </div>
    </main>
  );
}