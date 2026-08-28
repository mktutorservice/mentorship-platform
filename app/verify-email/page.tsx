'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.verifyOtp({
      email: 'mikiasdagne38@gmail.com', // Replace with state/searchParams email
      token: token,
      type: 'signup', // Use 'email' if utilizing magic links/email OTPs
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Success: Redirect to protected feed route
    router.push('/feed');
    router.refresh();
  };

  return (
    <form onSubmit={handleVerify}>
      {/* Input bound to `token` state */}
      <input 
        type="text" 
        value={token} 
        onChange={(e) => setToken(e.target.value)} 
        maxLength={6}
        placeholder="123456"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify Code & Sign In'}
      </button>
    </form>
  );
}