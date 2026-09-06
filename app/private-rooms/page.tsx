'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import LiveVideoModal from '@/components/LiveVideoModal';

interface StudentProfile {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  role: string;
  fcm_token?: string; // Stored user notification token
}

export default function PrivateRoomsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuthAndFetchStudents() {
      const { data: { session } } = await supabase.auth.getSession();
      const userRole = localStorage.getItem('user_role');

      if (!session?.user || userRole === 'Guest') {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'STUDENT');

      if (error) {
        console.error('Error fetching student profiles:', error.message);
      } else {
        setStudents(data || []);
      }
      setLoading(false);
    }

    checkAuthAndFetchStudents();
  }, [router]);

  const handleStartCall = async (student: StudentProfile) => {
    const roomId = `private-${student.id.slice(0, 8)}`;

    // Trigger FCM Notification if token exists
    if (student.fcm_token) {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetFcmToken: student.fcm_token,
          callerName: 'Your Mentor',
          roomId,
        }),
      });
    }

    // Launch LiveKit Room
    setActiveRoomId(roomId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0e15] flex items-center justify-center text-white">
        <p className="text-amber-400 font-medium animate-pulse">Loading Student Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0e15] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-400 mb-2">Private Mentorship Hub</h1>
        <p className="text-sm text-gray-400 mb-8">
          Manage assigned students, launch instant encrypted video calls, and dispatch offline alerts.
        </p>

        {students.length === 0 ? (
          <div className="bg-[#12131c] p-8 rounded-2xl text-center border border-amber-500/10">
            <p className="text-gray-400">No students registered in the system yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-[#12131c] border border-amber-500/20 hover:border-amber-500/40 transition rounded-2xl p-6 shadow-xl flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-xl font-bold text-amber-400 shrink-0">
                    {(student.name || student.username)[0].toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {student.name || student.username}
                    </h3>
                    <p className="text-xs text-amber-400/80">@{student.username}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {student.bio || 'Student enrolled in active mentorship tracks.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStartCall(student)}
                    className="py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl text-xs transition text-center shadow-lg shadow-amber-500/10"
                  >
                    📞 Start Call
                  </button>
                  <button
                    onClick={() => alert(`Scheduling session with ${student.name}...`)}
                    className="py-2 px-3 bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-500/20 rounded-xl text-xs font-medium transition text-center"
                  >
                    📅 Schedule
                  </button>
                  <button
                    onClick={() => alert(`Opening chat with ${student.name}...`)}
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

      {/* LiveKit Video Modal */}
      {activeRoomId && (
        <LiveVideoModal
          roomId={activeRoomId}
          username="Mentor"
          onClose={() => setActiveRoomId(null)}
        />
      )}
    </div>
  );
}