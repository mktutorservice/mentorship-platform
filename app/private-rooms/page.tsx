'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface StudentProfile {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  role: string;
}

export default function PrivateRoomsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCallStudent, setActiveCallStudent] = useState<StudentProfile | null>(null);

  useEffect(() => {
    async function checkAuthAndFetchStudents() {
      // 1. Verify Authentication & Role
      const { data: { session } } = await supabase.auth.getSession();
      const userRole = localStorage.getItem('user_role');

      if (!session?.user || userRole === 'Guest') {
        router.push('/login');
        return;
      }

      // 2. Fetch Student Profiles
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

  const handleStartCall = (student: StudentProfile) => {
    setActiveCallStudent(student);
  };

  const handleSchedule = (student: StudentProfile) => {
    alert(`Scheduling session with ${student.name || student.username}...`);
  };

  const handleMessage = (student: StudentProfile) => {
    alert(`Opening chat with ${student.name || student.username}...`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#12121e] flex items-center justify-center text-white">
        <p className="text-[#8458B3] font-medium animate-pulse">Loading Student Dashboard...</p>
      </div>
    );
  }

  // ACTIVE VIDEO CALL VIEW
  if (activeCallStudent) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-between p-4">
        <div className="w-full max-w-6xl flex items-center justify-between py-2 text-white border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-[#D0BDF4]">
              Private Call with {activeCallStudent.name || activeCallStudent.username}
            </h2>
            <p className="text-xs text-gray-400">Direct Mentoring Session</p>
          </div>
          <button
            onClick={() => setActiveCallStudent(null)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
          >
            End Call
          </button>
        </div>

        <div className="w-full max-w-6xl flex-1 my-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1b1b26] rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-[#8458B3]/30 border-2 border-[#8458B3] flex items-center justify-center text-2xl font-bold text-white mb-2">
              {(activeCallStudent.name || activeCallStudent.username)[0].toUpperCase()}
            </div>
            <p className="text-sm font-medium text-gray-300">
              {activeCallStudent.name || activeCallStudent.username}'s Video Feed
            </p>
          </div>

          <div className="bg-[#1b1b26] rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-2xl font-bold text-white mb-2">
              You
            </div>
            <p className="text-sm font-medium text-gray-300">Camera Feed Active</p>
          </div>
        </div>

        <div className="w-full max-w-md bg-[#1b1b26] border border-white/10 rounded-2xl p-3 flex items-center justify-around">
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-white text-xs font-medium">
            🎤 Mute
          </button>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-white text-xs font-medium">
            📷 Video Off
          </button>
          <button className="px-4 py-2 bg-[#8458B3] hover:bg-[#a280d3] rounded-xl text-white text-xs font-medium">
            🖥️ Share Screen
          </button>
        </div>
      </div>
    );
  }

  // STUDENT LIST & PROFILES VIEW
  return (
    <div className="min-h-screen bg-[#12121e] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#D0BDF4] mb-2">Private Mentorship Hub</h1>
        <p className="text-sm text-gray-400 mb-8">
          Manage your assigned students, launch instant video calls, schedule sessions, and send direct messages.
        </p>

        {students.length === 0 ? (
          <div className="bg-[#1b1b26] p-8 rounded-2xl text-center border border-white/5">
            <p className="text-gray-400">No students registered in the system yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-[#1b1b26] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#8458B3]/20 border border-[#8458B3] flex items-center justify-center text-xl font-bold text-white shrink-0">
                    {(student.name || student.username)[0].toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {student.name || student.username}
                    </h3>
                    <p className="text-xs text-[#D0BDF4]">@{student.username}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {student.bio || 'Student enrolled in active mentorship tracks.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStartCall(student)}
                    className="py-2 px-3 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-medium transition text-center"
                  >
                    📞 Start Call
                  </button>
                  <button
                    onClick={() => handleSchedule(student)}
                    className="py-2 px-3 bg-[#8458B3] hover:bg-[#a280d3] text-white rounded-xl text-xs font-medium transition text-center"
                  >
                    📅 Schedule
                  </button>
                  <button
                    onClick={() => handleMessage(student)}
                    className="py-2 px-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-medium transition text-center"
                  >
                    💬 Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}