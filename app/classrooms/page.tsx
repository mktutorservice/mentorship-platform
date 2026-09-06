'use client';

import { useState } from 'react';
import LiveVideoModal from '@/components/LiveVideoModal';

export default function ClassroomsPage() {
  const [activeClassroom, setActiveClassroom] = useState<string | null>(null);

  const classrooms = [
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
  ];

  return (
    <section className="min-h-screen bg-[#0d0e15] text-white py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="border-b border-amber-500/20 pb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-amber-400 tracking-tight">Group Classrooms</h1>
            <p className="text-sm text-gray-400 mt-1">Join structured group learning spaces & live broadcasts</p>
          </div>
          <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/10">
            + Create Room
          </button>
        </div>

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
                <span>🎥</span> Join Broadcast
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* LiveKit Video Classroom Modal */}
      {activeClassroom && (
        <LiveVideoModal
          roomId={activeClassroom}
          username={`User_${Math.floor(Math.random() * 1000)}`}
          onClose={() => setActiveClassroom(null)}
        />
      )}
    </section>
  );
}