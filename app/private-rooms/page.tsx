'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import LiveVideoModal from '@/components/LiveVideoModal';

interface Profile {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  role: string;
  fcm_token?: string;
}

export default function PrivateRoomsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('STUDENT');
  const [currentUsername, setCurrentUsername] = useState<string>('User');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuthAndFetch() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/login');
        return;
      }

      // Get logged in user role & info
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      const role = profile?.role || localStorage.getItem('user_role') || 'STUDENT';
      const username = profile?.username || profile?.name || 'User';

      setCurrentUserRole(role);
      setCurrentUsername(username);

      // Mentors see assigned Students; Students/Parents see available Mentors
      const targetRole = role === 'MENTOR' ? 'STUDENT' : 'MENTOR';

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', targetRole);

      if (error) {
        console.error('Error fetching profiles:', error.message);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    }

    checkAuthAndFetch();
  }, [router]);

  const handleStartCall = async (targetUser: Profile) => {
    const roomId = `private-${targetUser.id.slice(0, 8)}`;

    if (targetUser.fcm_token) {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetFcmToken: targetUser.fcm_token,
          callerName: currentUsername,
          roomId,
        }),
      }).catch((e) => console.error('Failed to trigger FCM:', e));
    }

    setActiveRoomId(roomId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0e15] flex items-center justify-center text-white">
        <p className="text-amber-400 font-medium animate-pulse">Loading Private Rooms...</p>
      </div>
    );
  }

  const isMentor = currentUserRole === 'MENTOR';

  return (
    <div className="min-h-screen bg-[#0d0e15] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-400 mb-2">Private Mentorship Hub</h1>
        <p className="text-sm text-gray-400 mb-8">
          {isMentor 
            ? 'Connect 1-on-1 with assigned students, schedule sessions, or send real-time alerts.' 
            : 'Connect directly with your verified mentor in encrypted 1-on-1 private video sessions.'}
        </p>

        {users.length === 0 ? (
          <div className="bg-[#12131c] p-8 rounded-2xl text-center border border-amber-500/10">
            <p className="text-gray-400">
              {isMentor ? 'No students assigned yet.' : 'No available mentors online right now.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-[#12131c] border border-amber-500/20 hover:border-amber-500/40 transition rounded-2xl p-6 shadow-xl flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                 <div className="w-14 h-14 rounded-full border border-amber-500/40 shrink-0 overflow-hidden relative">
  <img 
    src={user.avatar_url || '/pp.jpg'} 
    alt={user.name || 'User'} 
    className="w-full h-full object-cover" 
  />
</div>
                    <h3 className="text-lg font-semibold text-white">
                      {user.name || user.username}
                    </h3>
                    <p className="text-xs text-amber-400/80">@{user.username || 'user'}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {user.bio || 'Active member in private mentorship tracks.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStartCall(user)}
                    className="py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl text-xs transition text-center shadow-lg shadow-amber-500/10"
                  >
                    📞 Connect Call
                  </button>
                  <button
                    onClick={() => alert(`Scheduling session with ${user.name || user.username}...`)}
                    className="py-2 px-3 bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/20 rounded-xl text-xs font-medium transition text-center"
                  >
                    📅 Schedule
                  </button>
                  <button
                    onClick={() => alert(`Opening chat with ${user.name || user.username}...`)}
                    className="py-2 px-3 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl text-xs font-medium transition text-center"
                  >
                    💬 Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeRoomId && (
        <LiveVideoModal
          roomId={activeRoomId}
          username={currentUsername}
          onClose={() => setActiveRoomId(null)}
        />
      )}
    </div>
  );
}