'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LiveVideoModal from '@/components/LiveVideoModal';

interface Classroom {
  id: string;
  title: string;
  description: string;
  tag: string;
}

export default function ClassroomsPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeClassroom, setActiveClassroom] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [classrooms, setClassrooms] = useState<Classroom[]>([
    {
      id: 'web-dev-101',
      title: 'Web Development Fundamentals',
      description: 'Explore full-stack concepts, state management, Next.js, and modern UI practices.',
      tag: 'Public',
    },
    {
      id: 'embedded-systems-201',
      title: 'Embedded Systems & Hardware',
      description: 'Microcontroller architecture, direct memory register control, and live hardware demos.',
      tag: 'Featured',
    },
  ]);

  useEffect(() => {
    async function getUserRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setUserRole(data?.role || localStorage.getItem('user_role') || 'STUDENT');
      } else {
        setUserRole(localStorage.getItem('user_role') || 'STUDENT');
      }
    }
    getUserRole();
  }, []);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newRoom: Classroom = {
      id: `classroom-${Date.now()}`,
      title: newTitle,
      description: newDesc || 'Live interactive mentorship classroom session.',
      tag: 'Mentor Live',
    };

    setClassrooms([newRoom, ...classrooms]);
    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
  };

  const isMentor = userRole === 'MENTOR' || userRole === 'mentor';

  return (
    <section className="min-h-screen bg-[#0d0e15] text-white py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="border-b border-amber-500/20 pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-amber-400 tracking-tight">Group Classrooms</h1>
            <p className="text-sm text-gray-400 mt-1">
              {isMentor 
                ? 'Host interactive learning spaces and live broadcasts for students & parents.' 
                : 'Join live structured group learning spaces hosted by verified mentors.'}
            </p>
          </div>

          {isMentor && (
            <button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/10"
            >
              + Create Room
            </button>
          )}
        </div>

        {isCreating && (
          <div className="bg-[#12131c] border border-amber-500/30 p-6 rounded-2xl shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-amber-400">Create New Classroom Broadcast</h3>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Classroom Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Advanced Embedded C Systems"
                  className="w-full bg-[#0d0e15] border border-amber-500/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief overview of the live topic..."
                  className="w-full bg-[#0d0e15] border border-amber-500/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-black font-semibold text-xs rounded-xl hover:bg-amber-400 transition"
                >
                  Start Classroom
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classrooms.map((room) => (
            <div
              key={room.id}
              className="bg-[#12131c] p-6 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {room.tag}
                </span>
                <h2 className="text-lg font-bold text-white">{room.title}</h2>
                <p className="text-xs text-gray-400 leading-relaxed">{room.description}</p>
              </div>

              <button
                onClick={() => setActiveClassroom(room.id)}
                className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <span>🎥</span> {isMentor ? 'Start Broadcast' : 'Attend Classroom'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {activeClassroom && (
        <LiveVideoModal
          roomId={activeClassroom}
          username={isMentor ? 'Mentor_Host' : `Attendee_${Math.floor(Math.random() * 1000)}`}
          onClose={() => setActiveClassroom(null)}
        />
      )}
    </section>
  );
}