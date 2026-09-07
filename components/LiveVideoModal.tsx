'use client';

import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';

interface LiveVideoModalProps {
  roomId: string;
  username: string;
  onClose: () => void;
}

export default function LiveVideoModal({ roomId, username, onClose }: LiveVideoModalProps) {
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/livekit-token?room=${encodeURIComponent(roomId)}&username=${encodeURIComponent(username)}`
        );

        const data = await res.json();
        console.log('API Response payload:', data); // Log raw output for inspection

        if (!res.ok) {
          throw new Error(data.error || `Server returned status ${res.status}`);
        }

        if (data.token && typeof data.token === 'string') {
          setToken(data.token);
        } else {
          throw new Error(data.error || 'Token is missing or invalid in server response');
        }
      } catch (err: any) {
        console.error('Error fetching LiveKit token:', err);
        setError(err.message || 'Unable to connect to live stream');
      }
    })();
  }, [roomId, username]);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0e15]/90 backdrop-blur-md p-4">
        <div className="bg-[#12131c] border border-red-500/30 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-2xl">
          <p className="text-sm font-semibold text-red-400">Connection Failed</p>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-xs font-semibold transition"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0e15]/90 backdrop-blur-md">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-amber-400/80">Connecting to encrypted session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0d0e15] text-white">
      <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-[#12131c]">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          <h2 className="text-sm font-semibold tracking-wide text-amber-400">Room: {roomId}</h2>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition"
        >
          End Session
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-[#0d0e15]">
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          data-lk-theme="default"
          className="h-full border-none"
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </div>
  );
}