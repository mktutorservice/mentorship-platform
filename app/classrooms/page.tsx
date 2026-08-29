'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface Classroom {
  id: string;
  name: string;
  description: string;
  visibility: string;
  host_id: string;
  is_live: boolean;
  created_at: string;
}

export default function ClassroomsPage() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Modals & Active Stream States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>('');
  const [roomDescription, setRoomDescription] = useState<string>('');
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [showOptionsStep, setShowOptionsStep] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Video Streaming States
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const fetchClassrooms = async () => {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClassrooms(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const { data, error } = await supabase
      .from('classrooms')
      .insert({
        name: roomName,
        description: roomDescription,
        visibility: 'Public',
        host_id: userId,
      })
      .select()
      .single();

    if (error) {
      alert(`Error creating classroom: ${error.message}`);
    } else if (data) {
      setCreatedRoomId(data.id);
      setShowOptionsStep(true);
      fetchClassrooms();
    }
  };

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      setIsStreaming(true);
      resetModal();

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 300);
    } catch (err) {
      alert('Could not access camera/microphone. Check browser permissions.');
    }
  };

  const stopVideoStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleCopyInviteLink = () => {
    if (!createdRoomId) return;
    const inviteUrl = `${window.location.origin}/classrooms?room=${createdRoomId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const resetModal = () => {
    setIsCreateModalOpen(false);
    setShowOptionsStep(false);
    setRoomName('');
    setRoomDescription('');
    setCreatedRoomId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e17] flex items-center justify-center text-[#8458B3] font-medium animate-pulse">
        Loading classrooms...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e17] text-white px-6 py-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Dark Theme Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#D0BDF4]">Classrooms</h1>
            <p className="text-xs text-gray-400 mt-0.5">Join structured group learning spaces</p>
          </div>

          <button
            onClick={() => { resetModal(); setIsCreateModalOpen(true); }}
            className="px-5 py-2 bg-[#8458B3] hover:bg-[#a280d3] text-white font-medium text-xs rounded-xl transition shadow-lg flex items-center gap-1.5"
          >
            <span>+ Create Room</span>
          </button>
        </div>

        {/* Live Broadcaster Stream View */}
        {isStreaming && (
          <div className="bg-[#171725] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-red-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
              ● Live Stream
            </div>
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-[400px] object-cover bg-black"
            />

            <div className="p-4 bg-[#10101a] flex items-center justify-between text-white border-t border-white/10">
              <span className="text-xs text-gray-300">Broadcasting camera feed to room</span>
              <button
                onClick={stopVideoStream}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition shadow-md"
              >
                End Stream
              </button>
            </div>
          </div>
        )}

        {/* Classroom Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classrooms.length === 0 ? (
            <div className="col-span-full bg-[#171725] p-12 rounded-2xl border border-white/10 text-center text-gray-400 text-sm shadow-xl">
              No classrooms created yet. Click "+ Create Room" to start one!
            </div>
          ) : (
            classrooms.map((room) => (
              <div
                key={room.id}
                onClick={() => router.push(`/classrooms/${room.id}`)}
                className="bg-[#171725] border border-white/10 hover:border-[#8458B3]/50 rounded-2xl p-6 shadow-xl transition cursor-pointer space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <span className="inline-block px-3 py-1 bg-[#10101a] text-[#D0BDF4] border border-white/10 text-[11px] font-medium rounded-full">
                    {room.visibility || 'Public'}
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#D0BDF4] transition">{room.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {room.description || 'Explore concepts, state management, and modern UI practices.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Created {new Date(room.created_at).toLocaleDateString()}</span>
                  <span className="text-[#D0BDF4] font-medium group-hover:underline">Enter Room →</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Creation & Options Dialog (Dark Theme) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171725] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-[#D0BDF4]">
                {!showOptionsStep ? 'Create Classroom' : 'Room Options'}
              </h2>
              <button onClick={resetModal} className="text-gray-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            {!showOptionsStep ? (
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Room Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Web Development Fundamentals"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full bg-[#10101a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#8458B3]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Explore full-stack concepts, state management, and modern practices."
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                    className="w-full bg-[#10101a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#8458B3] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="px-4 py-2 bg-[#202030] hover:bg-[#2a2a40] text-gray-300 text-xs font-medium rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#8458B3] hover:bg-[#a280d3] text-white text-xs font-medium rounded-xl transition shadow-md"
                  >
                    Create
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-300">
                  Room <strong className="text-white">"{roomName}"</strong> is created. Choose how to proceed:
                </p>

                <div className="space-y-3">
                  <button
                    onClick={startVideoStream}
                    className="w-full p-4 bg-[#8458B3] hover:bg-[#a280d3] text-white rounded-xl text-left transition shadow-md flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold">📹 Start Video Streaming</h4>
                      <p className="text-[10px] text-gray-200 mt-0.5">Broadcast live camera stream immediately</p>
                    </div>
                    <span className="text-xs">→</span>
                  </button>

                  <button
                    onClick={handleCopyInviteLink}
                    className="w-full p-4 bg-[#10101a] hover:bg-[#202030] border border-white/10 text-white rounded-xl text-left transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#D0BDF4]">✉️ Invite Your Students</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Copy shareable classroom link</p>
                    </div>
                    <span className="text-xs font-semibold text-[#8458B3]">
                      {copiedLink ? 'Copied!' : 'Copy Link'}
                    </span>
                  </button>
                </div>

                <div className="pt-2 text-right">
                  <button
                    onClick={resetModal}
                    className="px-4 py-2 bg-[#202030] hover:bg-[#2a2a40] text-gray-300 text-xs font-medium rounded-xl transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}