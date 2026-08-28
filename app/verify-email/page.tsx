'use client';

import { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailForm() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract email from query parameter: /verify-email?email=user@example.com
  const email = searchParams.get('email') || '';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email) {
      setError('Missing email address. Please return to registration.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token.trim(),
      type: 'signup',
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

   if (data?.session || data?.user) {
  window.location.href = '/feed';
}
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-center text-gray-900">Verify Email</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          We sent a code to <span className="font-semibold">{email || 'your email'}</span>
        </p>

        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter 6-Digit Code
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              maxLength={6}
              placeholder="123456"
              className="w-full rounded-xl border p-3 text-center text-lg tracking-widest outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gray-900 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Code & Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}