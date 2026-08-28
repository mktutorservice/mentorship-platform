'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Handle initial Sign Up or Sign In submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (mode === 'signup') {
      // Send sign up request with OTP email setting
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        // Switch view to OTP input screen
        setStep('otp');
      }
    } else {
      // Standard email/password login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/feed');
      }
    }

    setLoading(false);
  };

  // Step 2: Verify the 6-digit OTP code sent to email
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'signup',
    });

    if (error) {
      setErrorMsg(error.message);
    } else if (data.session) {
      router.push('/feed');
    }

    setLoading(false);
  };

  return (
    <section className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
        
        {/* Step 1: Enter Credentials */}
        {step === 'credentials' ? (
          <>
            <div className="text-center space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  {mode === 'signin'
                    ? 'Sign in to access your mentorship dashboard'
                    : 'Enter your details to receive a verification code'}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMsg(null); }}
                  className={`text-xs font-semibold py-1.5 rounded-lg transition ${
                    mode === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMsg(null); }}
                  className={`text-xs font-semibold py-1.5 rounded-lg transition ${
                    mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 bg-gray-50/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition shadow-sm cursor-pointer"
              >
                {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Send Verification Code'}
              </button>
            </form>
          </>
        ) : (
          /* Step 2: Enter Email Verification OTP Code */
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Verify Email</h1>
              <p className="text-xs text-gray-500 mt-1">
                We sent a code to <span className="font-semibold text-gray-800">{email}</span>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-lg font-mono p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-gray-400 bg-gray-50/50"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition shadow-sm cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Verify Code & Sign In'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setStep('credentials')}
              className="w-full text-xs text-gray-500 hover:text-gray-900 font-medium text-center"
            >
              ← Back to registration
            </button>
          </div>
        )}

      </div>
    </section>
  );
}