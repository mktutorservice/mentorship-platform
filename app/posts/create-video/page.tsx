'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const VIDEO_CATEGORIES = [
  'Educational',
  'Promotion',
  'Showcase',
  'Life Hack',
  'Entertainment',
  'Vlogs',
  'Tutorials',
  'How-to videos',
  'Screencasts',
  'Lectures',
  'Training videos',
  'Onboarding videos',
  'Documentaries',
  'Animated informational videos',
  'Other',
];

export default function CreateVideoPostPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoCategory, setVideoCategory] = useState('Educational');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [editedSettings, setEditedSettings] = useState<any>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const editedData = localStorage.getItem('editedVideoData');
    if (editedData) {
      try {
        const parsed = JSON.parse(editedData);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.videoCategory) setVideoCategory(parsed.videoCategory);
        if (parsed.videoUrl) setVideoPreviewUrl(parsed.videoUrl);
        setEditedSettings(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    setSelectedVideo(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setVideoPreviewUrl(base64Url);

      // Save persistent Base64 string to localStorage
      localStorage.setItem(
        'editedVideoData',
        JSON.stringify({
          videoUrl: base64Url,
          fileName: file.name,
          title,
          description,
          videoCategory,
        })
      );
    };
    reader.readAsDataURL(file);
  }
};

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  const handleOpenEditor = () => {
    if (!videoPreviewUrl) {
      alert('Please select a video first to edit.');
      return;
    }
    const existing = localStorage.getItem('editedVideoData');
    const parsed = existing ? JSON.parse(existing) : {};

    localStorage.setItem(
      'editedVideoData',
      JSON.stringify({
        ...parsed,
        videoUrl: videoPreviewUrl,
        title,
        description,
        videoCategory,
      })
    );
    router.push('/posts/edit-video');
  };

  const compressVideo = async (file: File | string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = typeof file === 'string' ? file : URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        video.play();
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(video.videoWidth, 1280);
        canvas.height = Math.min(video.videoHeight, 720);

        const ctx = canvas.getContext('2d');
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: 'video/webm' }));
        };

        recorder.start();

        const duration = video.duration || 1;
        const interval = setInterval(() => {
          if (video.ended || video.paused) {
            clearInterval(interval);
            recorder.stop();
          } else {
            if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const progress = Math.min(Math.round((video.currentTime / duration) * 50), 50);
            setUploadProgress(progress);
          }
        }, 33);
      };

      video.onerror = () => {
        if (typeof file !== 'string') {
          resolve(file);
        } else {
          reject(new Error('Failed to load video file for processing.'));
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!selectedVideo && !videoPreviewUrl) || !title.trim() || !description.trim()) {
      alert('Please fill out the video title, description, and upload a video file.');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setStatusMessage('Compressing video...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        alert('Authentication required.');
        setIsProcessing(false);
        return;
      }

      const videoSource = selectedVideo || videoPreviewUrl!;
      const processedBlob = await compressVideo(videoSource);

      let thumbnailUrl = '';
      if (thumbnailFile) {
        setStatusMessage('Uploading thumbnail...');
        const thumbExt = thumbnailFile.name.split('.').pop();
        const thumbName = `${user.id}/thumb_${Date.now()}.${thumbExt}`;
        const { data: thumbData } = await supabase.storage
          .from('post-attachments')
          .upload(thumbName, thumbnailFile);

        if (thumbData) {
          thumbnailUrl = supabase.storage
            .from('post-attachments')
            .getPublicUrl(thumbName).data.publicUrl;
        }
      }

      setStatusMessage('Uploading video...');
      const videoName = `${user.id}/video_${Date.now()}.webm`;

      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 95 ? 95 : prev + 5));
      }, 200);

      const { error: videoError } = await supabase.storage
        .from('post-attachments')
        .upload(videoName, processedBlob, { contentType: 'video/webm' });

      clearInterval(uploadInterval);
      if (videoError) throw videoError;

      setUploadProgress(100);
      const publicVideoUrl = supabase.storage
        .from('post-attachments')
        .getPublicUrl(videoName).data.publicUrl;

      const attachments = [
        {
          url: publicVideoUrl,
          type: 'VIDEO',
          name: selectedVideo?.name || editedSettings?.fileName || 'edited_video.mp4',
        },
      ];

      let finalContent = `🎬 **${title.trim()}**\n\n${description.trim()}\n\n📺 Type: ${videoCategory}`;
      if (thumbnailUrl) {
        finalContent += `\n🖼️ Thumbnail: ${thumbnailUrl}`;
      }

      const { error: insertError } = await supabase.from('posts').insert({
        author_id: user.id,
        content: finalContent,
        media_url: JSON.stringify(attachments),
        type: 'VIDEO',
        visibility: 'PUBLIC',
      });

      if (insertError) throw insertError;

      localStorage.removeItem('editedVideoData');
      router.push('/posts');
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const isPublishable = (selectedVideo || videoPreviewUrl) && title.trim() && description.trim() && !isProcessing;

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white p-6 md:p-12 flex flex-col justify-center items-center">
      <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={handleVideoSelect} />
      <input type="file" ref={thumbnailInputRef} accept="image/*" className="hidden" onChange={handleThumbnailSelect} />

      <div className="max-w-xl w-full bg-[#151622] border border-[#B38728]/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h1 className="text-xl font-black text-white">Create Video Post</h1>
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-xs font-bold transition">
            ← Back
          </button>
        </div>

        {/* Video Preview with Canvas Filters Applied */}
        <div className="flex flex-col items-center justify-center space-y-3">
          {videoPreviewUrl ? (
            <div className="relative w-full max-w-xs h-80 rounded-2xl overflow-hidden border border-[#B38728]/40 bg-black group flex items-center justify-center">
              <video
                src={videoPreviewUrl}
                muted={editedSettings?.isMuted}
                className="w-full h-full object-contain transition-all duration-300"
                style={{
                  filter: editedSettings?.filter || 'none',
                  transform: `rotate(${editedSettings?.rotation || 0}deg)`,
                  aspectRatio:
                    editedSettings?.aspectRatio && editedSettings.aspectRatio !== 'custom'
                      ? editedSettings.aspectRatio.replace(':', '/')
                      : 'auto',
                }}
                controls={!isProcessing}
              />

              {/* Saved Text Overlay Display */}
              {editedSettings?.overlayText?.text && (
                <div
                  className={`absolute pointer-events-none px-2 py-1 rounded bg-black/40 border border-dashed border-white/40 ${
                    editedSettings.overlayText.font || ''
                  }`}
                  style={{
                    left: `${editedSettings.overlayText.position.x}%`,
                    top: `${editedSettings.overlayText.position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    color: editedSettings.overlayText.color,
                    fontSize: `${editedSettings.overlayText.size}px`,
                  }}
                >
                  {editedSettings.overlayText.text}
                </div>
              )}

              {/* Upload Progress Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-2 z-20">
                  <div className="text-3xl font-black text-[#FCF6BA] tracking-widest animate-pulse">
                    {uploadProgress.toFixed(1)}%
                  </div>
                  <p className="text-[10px] text-gray-300 font-medium uppercase tracking-wider">{statusMessage}</p>
                  <div className="w-3/4 h-1.5 bg-white/20 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-[#B38728] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Edit Icon Overlay Trigger */}
              {!isProcessing && (
                <button
                  type="button"
                  onClick={handleOpenEditor}
                  className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black/90 border border-white/20 rounded-xl transition cursor-pointer flex items-center justify-center z-10"
                  title="Edit Video"
                >
                  <Image src="/compose.png" alt="Edit Video" width={22} height={22} className="object-contain w-5.5 h-5.5" unoptimized />
                </button>
              )}
            </div>
          ) : (
            <div
              onClick={() => videoInputRef.current?.click()}
              className="w-full max-w-xs h-64 border-2 border-dashed border-[#B38728]/50 hover:border-[#FCF6BA] rounded-2xl flex flex-col items-center justify-center bg-[#0f0f17] cursor-pointer transition space-y-3 p-4"
            >
              <Image src="/upload.png" alt="Upload Video" width={42} height={42} className="object-contain w-10 h-10" unoptimized />
              <span className="text-xs font-bold text-gray-300">Click to select video</span>
            </div>
          )}

          {(selectedVideo || editedSettings?.fileName) && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-medium truncate max-w-[200px]">
                {selectedVideo?.name || editedSettings?.fileName || 'Selected Video'}
              </span>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="text-[11px] text-[#FCF6BA] hover:underline font-bold"
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Thumbnail Selection */}
          <div className="flex items-center justify-between bg-[#0f0f17] p-4 rounded-2xl border border-white/10">
            <div>
              <p className="text-xs font-bold text-gray-200">Front Thumbnail (Picture)</p>
              <p className="text-[10px] text-gray-400">{thumbnailFile ? thumbnailFile.name : 'Optional cover image'}</p>
            </div>
            <button
              type="button"
              onClick={() => thumbnailInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:border-[#B38728] rounded-xl text-xs text-[#FCF6BA] transition cursor-pointer"
            >
              {thumbnailFile ? 'Change' : 'Choose'}
            </button>
          </div>

          {/* Video Title Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#FCF6BA]">Video Title / Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to Circuit Theory..."
              className="w-full bg-[#0f0f17] border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FCF6BA]"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#FCF6BA]">Type of Video</label>
            <select
              value={videoCategory}
              onChange={(e) => setVideoCategory(e.target.value)}
              className="w-full bg-[#0f0f17] border border-white/10 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-[#FCF6BA]"
            >
              {VIDEO_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#151622]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#FCF6BA]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a video description..."
              rows={4}
              className="w-full bg-[#0f0f17] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FCF6BA] resize-none"
            />
          </div>

          {/* Footer Bar */}
          <div className="flex justify-between items-center pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={handleOpenEditor}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-300 transition cursor-pointer"
            >
              <Image src="/compose.png" alt="Edit" width={18} height={18} className="object-contain w-4 h-4" unoptimized />
              Simple Edit
            </button>

            {/* Bright Golden Send / Publish Button */}
            <button
              type="submit"
              disabled={!isPublishable}
              className="p-2 transition-transform hover:scale-110 active:scale-95 disabled:opacity-40 cursor-pointer bg-transparent border-none outline-none flex items-center justify-center"
              title="Publish Video Post"
            >
              <div className="p-2 rounded-full bg-[#B38728]/20 border border-[#B38728] hover:bg-[#B38728]/40 shadow-[0_0_15px_rgba(252,246,186,0.5)] transition">
                <svg
                  className="w-6 h-6 text-[#FCF6BA] transform rotate-45 -translate-x-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}