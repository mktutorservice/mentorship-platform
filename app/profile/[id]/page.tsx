'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface ProfileData {
  id: string;
  name?: string;
  role?: string;
  activity_status?: string;
  fee_status?: string;
  gender?: string;
  profile_picture?: string;
  phone?: string;
  department?: string;
  is_verified?: boolean;
}

export default function SingleProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const profileId = resolvedParams.id;

  const [mounted, setMounted] = useState<boolean>(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showContactsModal, setShowContactsModal] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
      }
      setLoading(false);
    }

    if (profileId) fetchProfile();
  }, [profileId]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0f0f17] text-white flex justify-center p-4 py-10">
      <div className="w-full max-w-3xl space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between bg-[#171722] p-4 rounded-3xl border border-white/10 shadow-xl">
          <Link 
            href="/feed" 
            className="text-xs font-semibold bg-[#252533] hover:bg-[#B38728] text-white px-4 py-2 rounded-full border border-white/10 transition"
          >
            ← Back to Feed
          </Link>
          <h1 className="text-lg font-bold text-[#B38728]">Student Profile</h1>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400">Loading profile data...</div>
        ) : !profile ? (
          <div className="text-center py-12 bg-[#171722] rounded-3xl border border-white/10">
            <p className="text-sm text-gray-400">Profile not found.</p>
            <Link href="/feed" className="text-xs text-[#B38728] underline mt-2 inline-block">Return to Feed</Link>
          </div>
        ) : (
          <div className="bg-[#171722] rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 text-white space-y-6">
            
            {/* Top Identity Block */}
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative">
                <img 
                  src={profile.profile_picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400'} 
                  alt={profile.name || 'User'} 
                  className="w-28 h-28 rounded-full object-cover border-4 border-[#B38728] shadow-lg"
                />
                {profile.is_verified && (
                  <span className="absolute bottom-0 right-0 bg-[#B38728] text-black p-1 rounded-full text-xs font-bold shadow">
                    ✓
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <h2 className="text-2xl font-black text-white">{profile.name || 'Anonymous Student'}</h2>
                  <span className="px-3 py-1 bg-[#B38728]/20 text-[#B38728] border border-[#B38728]/30 text-xs font-semibold rounded-full uppercase">
                    {profile.role || 'STUDENT'}
                  </span>
                </div>

                <p className="text-xs text-gray-400 italic">
                  "{profile.activity_status || 'Member of Mentorship Community'}"
                </p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-gray-300 pt-1">
                  <span><strong>Department:</strong> {profile.department || 'Software Engineering'}</span>
                  <span>•</span>
                  <span><strong>Gender:</strong> {profile.gender || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Additional Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-6">
              <div className="bg-[#252533] p-4 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Fee Structure</span>
                <p className="text-sm font-bold text-white">{profile.fee_status || 'By Negotiation'}</p>
              </div>

              <div className="bg-[#252533] p-4 rounded-2xl border border-white/5 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Phone Contact</span>
                <p className="text-sm font-mono font-bold text-[#B38728]">{profile.phone || 'Private'}</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowContactsModal(true)}
                className="bg-[#B38728] hover:bg-[#966f1f] text-black font-bold text-xs px-6 py-2.5 rounded-full transition shadow-md cursor-pointer"
              >
                Contact Student
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Modal */}
      {showContactsModal && profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#171722] text-white p-6 rounded-3xl max-w-sm w-full border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-[#B38728]">Contact Information</h3>
              <button onClick={() => setShowContactsModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#252533] p-3 rounded-2xl border border-white/5">
                <p className="text-gray-400">Phone</p>
                <p className="text-white font-mono font-bold mt-1">{profile.phone || 'Not available'}</p>
              </div>
            </div>

            <button
              onClick={() => setShowContactsModal(false)}
              className="w-full bg-[#B38728] text-black font-bold py-2.5 rounded-full text-xs uppercase"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}