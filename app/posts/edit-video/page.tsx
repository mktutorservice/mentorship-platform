'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type ToolType = 'crop' | 'filter' | 'trim' | 'text' | 'music' | 'rotate';

const CROP_RATIOS = [
  { label: 'Custom', value: 'custom' },
  { label: 'Square (1:1)', value: '1:1' },
  { label: '9:16', value: '9:16' },
  { label: '16:9', value: '16:9' },
  { label: '4:5', value: '4:5' },
  { label: '5:4', value: '5:4' },
  { label: '3:4', value: '3:4' },
  { label: '4:3', value: '4:3' },
  { label: '2:3', value: '2:3' },
  { label: '3:2', value: '3:2' },
];

const FILTERS = [
  { name: 'Normal', filter: 'none' },
  { name: 'Cinematic', filter: 'contrast(125%) brightness(95%) saturate(110%) sepia(10%)' },
  { name: 'Vintage', filter: 'sepia(50%) contrast(110%) brightness(90%) hue-rotate(-10deg)' },
  { name: 'Cyberpunk', filter: 'hue-rotate(180deg) saturate(180%) contrast(120%)' },
  { name: 'Warm Glow', filter: 'brightness(105%) sepia(25%) saturate(130%)' },
  { name: 'B&W Contrast', filter: 'grayscale(100%) contrast(140%)' },
  { name: 'Vivid', filter: 'saturate(200%) contrast(115%)' },
];

const FONTS = [
  { name: 'Inter (Sans)', class: 'font-sans' },
  { name: 'Cinematic (Serif)', class: 'font-serif' },
  { name: 'Code (Mono)', class: 'font-mono' },
  { name: 'Display (Impact)', class: 'font-black tracking-wider uppercase' },
];

export default function EditVideoPage() {
  const router = useRouter();

  // Video context states
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [activeTool, setActiveTool] = useState<ToolType>('crop');

  // Tool specific states
  const [selectedRatio, setSelectedRatio] = useState<string>('9:16');
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Timeline & Real Extraction States
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [videoThumbnails, setVideoThumbnails] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  // Scrubbing & Trim dragging states
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [activeTrimHandle, setActiveTrimHandle] = useState<'start' | 'end' | null>(null);

  // Waveform, Audio & Mute States
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const [isDecodingAudio, setIsDecodingAudio] = useState<boolean>(false);
  const [audioName, setAudioName] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Text Overlay States
  const [overlayText, setOverlayText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#FCF6BA');
  const [selectedFont, setSelectedFont] = useState<string>('font-sans');
  const [textSize, setTextSize] = useState<number>(24);
  const [textPosition, setTextPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const timelineTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = localStorage.getItem('editedVideoData');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.videoUrl) setVideoUrl(parsed.videoUrl);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Frame Extraction
  const extractVideoFrames = async (videoSrc: string, videoDuration: number) => {
    if (!videoSrc || videoDuration <= 0) return;
    setIsExtracting(true);

    const frameCount = 8;
    const interval = videoDuration / frameCount;
    const extractedImages: string[] = [];

    const tempVideo = document.createElement('video');
    tempVideo.src = videoSrc;
    tempVideo.crossOrigin = 'anonymous';
    tempVideo.muted = true;
    tempVideo.playsInline = true;

    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 90;
    const ctx = canvas.getContext('2d');

    await new Promise((resolve) => {
      tempVideo.onloadeddata = () => resolve(true);
    });

    for (let i = 0; i < frameCount; i++) {
      const timeToSeek = i * interval;
      tempVideo.currentTime = timeToSeek;

      await new Promise((resolve) => {
        tempVideo.onseeked = () => {
          if (ctx) {
            ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
            extractedImages.push(canvas.toDataURL('image/jpeg', 0.6));
          }
          resolve(true);
        };
      });
    }

    setVideoThumbnails(extractedImages);
    setIsExtracting(false);
  };

  // Audio Buffer Extraction
  const extractAudioPeaks = async (audioSourceUrl: string) => {
    try {
      setIsDecodingAudio(true);
      const response = await fetch(audioSourceUrl);
      const arrayBuffer = await response.arrayBuffer();

      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const rawData = decodedBuffer.getChannelData(0);
      const samples = 70;
      const blockSize = Math.floor(rawData.length / samples);
      const peaks: number[] = [];

      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        peaks.push(sum / blockSize);
      }

      const maxPeak = Math.max(...peaks, 0.001);
      const normalized = peaks.map((p) => Math.max(15, Math.round((p / maxPeak) * 100)));

      setWaveformPeaks(normalized);
      setIsDecodingAudio(false);
      audioContext.close();
    } catch (err) {
      console.error('Waveform extraction failed:', err);
      setIsDecodingAudio(false);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setTrimEnd(dur);
      extractVideoFrames(videoUrl, dur);
      extractAudioPeaks(videoUrl);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioName(file.name);
      const objectUrl = URL.createObjectURL(file);
      extractAudioPeaks(objectUrl);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isScrubbing && !activeTrimHandle) {
      const curr = videoRef.current.currentTime;
      setCurrentTime(curr);
      if (curr >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
    }
  };

  // Timeline Seeking & Trim Dragging
  const handleSeekOrTrim = (e: MouseEvent | React.MouseEvent<HTMLDivElement>) => {
    if (!timelineTrackRef.current || !duration || duration <= 0) return;

    const rect = timelineTrackRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const targetTime = (clickX / rect.width) * duration;

    if (activeTrimHandle === 'start') {
      const newStart = Math.min(targetTime, trimEnd - 0.5);
      setTrimStart(newStart);
      if (videoRef.current) videoRef.current.currentTime = newStart;
    } else if (activeTrimHandle === 'end') {
      const newEnd = Math.max(targetTime, trimStart + 0.5);
      setTrimEnd(newEnd);
      if (videoRef.current) videoRef.current.currentTime = newEnd;
    } else if (isScrubbing) {
      setCurrentTime(targetTime);
      if (videoRef.current) videoRef.current.currentTime = targetTime;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing || activeTrimHandle) {
        handleSeekOrTrim(e);
      }
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      setActiveTrimHandle(null);
    };

    if (isScrubbing || activeTrimHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, activeTrimHandle, duration, trimStart, trimEnd]);

  const handleRotate = () => {
    setRotationAngle((prev) => (prev + 90) % 360);
  };

  const handleTextDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    setTextPosition({ x, y });
  };

  const handleSaveChanges = () => {
  const existing = localStorage.getItem('editedVideoData');
  let parsed: Record<string, any> = {};
  if (existing) {
    try {
      parsed = JSON.parse(existing);
    } catch (e) {
      console.error(e);
    }
  }

  const updatedData = {
    ...parsed,
    // Preserve or update the original video URL
    videoUrl: parsed.videoUrl || videoUrl,
    filter: selectedFilter,
    aspectRatio: selectedRatio,
    rotation: rotationAngle,
    trim: { start: trimStart, end: trimEnd },
    overlayText: overlayText
      ? {
          text: overlayText,
          color: textColor,
          font: selectedFont,
          position: textPosition,
          size: textSize,
        }
      : null,
    audioTrack: audioName || null,
    isMuted,
    updatedAt: Date.now(), // Unique timestamp trigger
  };

  localStorage.setItem('editedVideoData', JSON.stringify(updatedData));
  router.push('/posts/create-video');
};

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const trimLeftPercent = duration > 0 ? (trimStart / duration) * 100 : 0;
  const trimRightPercent = duration > 0 ? 100 - (trimEnd / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#08080c] text-white flex flex-col items-center justify-between p-4 md:p-6 select-none">
      
      {/* Top Navigation Bar */}
      <header className="w-full max-w-4xl bg-[#12131f]/80 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => router.back()}
          className="text-xs font-bold text-gray-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
        >
          ✕ Cancel
        </button>

        <div className="flex items-center gap-1 sm:gap-2 bg-black/40 p-1.5 rounded-full border border-white/5">
          {[
            { id: 'crop', icon: '/expand.png', label: 'Crop' },
            { id: 'filter', icon: '/funnel.png', label: 'Filter' },
            { id: 'trim', icon: '/scissor.png', label: 'Trim' },
            { id: 'text', icon: '/add-text.png', label: 'Text' },
            { id: 'rotate', icon: '/rotate-arrow.png', label: 'Rotate' },
            { id: 'music', icon: '/music.png', label: 'Music' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'rotate') handleRotate();
                else setActiveTool(item.id as ToolType);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                activeTool === item.id
                  ? 'bg-gradient-to-r from-[#B38728]/30 to-[#FCF6BA]/20 border border-[#FCF6BA]/50 text-[#FCF6BA]'
                  : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Image src={item.icon} alt={item.label} width={16} height={16} className="object-contain w-4 h-4" unoptimized />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleSaveChanges}
          className="flex items-center gap-2 px-5 py-2 bg-[#B38728] hover:bg-[#FCF6BA] text-black font-bold text-xs rounded-full transition shadow-[0_0_12px_rgba(253,246,186,0.4)] cursor-pointer"
        >
          <Image src="/check.png" alt="Save" width={16} height={16} className="object-contain w-4 h-4 bg-transparent" unoptimized />
          <span>Save</span>
        </button>
      </header>

      {/* Video Viewport Canvas */}
      <main className="flex-1 w-full max-w-4xl my-4 flex items-center justify-center relative overflow-hidden">
        <div
          ref={canvasContainerRef}
          onMouseMove={handleTextDrag}
          onMouseUp={() => setIsDragging(false)}
          className="relative max-h-[48vh] rounded-2xl overflow-hidden border border-[#B38728]/30 shadow-2xl bg-black flex items-center justify-center transition-all duration-300"
          style={{
            aspectRatio: selectedRatio === 'custom' ? 'auto' : selectedRatio.replace(':', '/'),
          }}
        >
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              muted={isMuted}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-contain transition-all duration-300"
              style={{
                filter: selectedFilter,
                transform: `rotate(${rotationAngle}deg)`,
              }}
              controls
            />
          ) : (
            <div className="p-12 text-center text-xs text-gray-500">No Video Loaded</div>
          )}

          {overlayText && (
            <div
              onMouseDown={() => setIsDragging(true)}
              className={`absolute cursor-move select-none px-3 py-1 rounded-lg border border-dashed border-white/40 bg-black/40 backdrop-blur-xs ${selectedFont}`}
              style={{
                left: `${textPosition.x}%`,
                top: `${textPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                color: textColor,
                fontSize: `${textSize}px`,
              }}
            >
              {overlayText}
            </div>
          )}
        </div>
      </main>

      {/* Multi-Track Timeline Area */}
      <footer className="w-full max-w-4xl bg-[#12131f]/90 backdrop-blur-lg border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between text-xs text-gray-400 font-mono border-b border-white/10 pb-2">
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          <div className="flex items-center gap-3">
            {isDecodingAudio && <span className="text-[10px] text-cyan-400 animate-pulse">Decoding Audio...</span>}
            {isExtracting && <span className="text-[10px] text-[#FCF6BA] animate-pulse">Extracting Frames...</span>}
          </div>
        </div>

        {/* Timeline Container */}
        <div
          ref={timelineTrackRef}
          onMouseDown={(e) => {
            if (!activeTrimHandle) {
              setIsScrubbing(true);
              handleSeekOrTrim(e);
            }
          }}
          className="relative w-full bg-[#0a0a10] border border-white/10 rounded-2xl p-3 overflow-hidden space-y-2 cursor-pointer select-none"
        >
          {/* Interactive Trim Overlay */}
          <div
            className="absolute top-0 bottom-0 bg-black/75 z-20 pointer-events-none"
            style={{ left: 0, width: `${trimLeftPercent}%` }}
          />
          <div
            className="absolute top-0 bottom-0 bg-black/75 z-20 pointer-events-none"
            style={{ right: 0, width: `${trimRightPercent}%` }}
          />

          {/* Left Trim Handle */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              setActiveTrimHandle('start');
            }}
            className="absolute top-0 bottom-0 w-3 bg-[#FCF6BA] z-40 cursor-ew-resize flex items-center justify-center rounded-l-md shadow-lg"
            style={{ left: `${trimLeftPercent}%` }}
          >
            <div className="w-0.5 h-6 bg-black rounded-full" />
          </div>

          {/* Right Trim Handle */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              setActiveTrimHandle('end');
            }}
            className="absolute top-0 bottom-0 w-3 bg-[#FCF6BA] z-40 cursor-ew-resize flex items-center justify-center rounded-r-md shadow-lg"
            style={{ left: `calc(${100 - trimRightPercent}% - 12px)` }}
          >
            <div className="w-0.5 h-6 bg-black rounded-full" />
          </div>

          {/* Dynamic Playhead Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#FCF6BA] z-30 shadow-[0_0_10px_#FCF6BA] pointer-events-none"
            style={{
              left: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
            }}
          >
            <div className="w-3 h-3 bg-[#FCF6BA] rounded-full -translate-x-[5px] -translate-y-[2px] border border-black shadow-md" />
          </div>

          {/* Filmstrip Track */}
          <div className="relative h-14 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex items-center pointer-events-none">
            {videoThumbnails.length > 0 ? (
              <div className="grid grid-cols-8 w-full h-full gap-0.5 p-0.5">
                {videoThumbnails.map((thumb, idx) => (
                  <div
                    key={idx}
                    className="w-full h-full bg-cover bg-center rounded-sm border-r border-white/10"
                    style={{ backgroundImage: `url(${thumb})` }}
                  />
                ))}
              </div>
            ) : (
              <div className="w-full text-center text-[10px] text-gray-500 font-mono">
                {isExtracting ? 'Generating Filmstrip Frames...' : 'Load Video to Render Filmstrip'}
              </div>
            )}
          </div>

          {/* AUDIO TRACK (Appears only when Music button is selected) */}
          {activeTool === 'music' && (
            <div className="relative h-11 bg-teal-950/40 border border-teal-500/30 rounded-xl px-3 flex items-center justify-between overflow-hidden pointer-events-none transition-all">
              <span className="text-[10px] font-bold text-cyan-300 z-10 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md">
                🎵 {audioName || 'Extracted Audio Track'}
              </span>

              <div className="absolute inset-0 px-4 flex items-center justify-between gap-[2px]">
                {waveformPeaks.length > 0 ? (
                  waveformPeaks.map((peak, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-cyan-500 to-teal-300 rounded-full opacity-80"
                      style={{ height: `${peak}%` }}
                    />
                  ))
                ) : (
                  <div className="w-full text-center text-[9px] text-teal-400/50 font-mono">
                    {isDecodingAudio ? 'Parsing Waveform Peaks...' : 'No Waveform Data'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TEXT TRACK (Appears only when Text tool is active or when overlayText is typed) */}
          {(activeTool === 'text' || overlayText) && (
            <div className="h-8 bg-purple-900/40 border border-purple-500/30 rounded-lg px-3 flex items-center text-[10px] text-purple-200 pointer-events-none transition-all">
              T {overlayText || 'Add text overlay...'}
            </div>
          )}
        </div>

        {/* Dynamic Tool Configurations */}
        {activeTool === 'crop' && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#FCF6BA] block">Aspect Ratio</span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {CROP_RATIOS.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => setSelectedRatio(ratio.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                    selectedRatio === ratio.value
                      ? 'bg-[#B38728]/30 border-[#FCF6BA] text-[#FCF6BA]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTool === 'filter' && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#FCF6BA] block">Modern Filters</span>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {FILTERS.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setSelectedFilter(f.filter)}
                  className={`flex flex-col items-center space-y-1.5 p-2 rounded-xl border transition cursor-pointer min-w-[75px] ${
                    selectedFilter === f.filter
                      ? 'border-[#FCF6BA] bg-[#B38728]/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-lg bg-cover bg-center border border-white/20"
                    style={{
                      backgroundImage: videoUrl ? `url(${videoUrl})` : 'none',
                      filter: f.filter,
                      backgroundColor: '#222',
                    }}
                  />
                  <span className="text-[10px] font-medium text-gray-300">{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTool === 'trim' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-gray-300">
              <span className="font-bold text-[#FCF6BA]">Trim Duration</span>
              <span className="bg-black/60 px-3 py-1 rounded-full border border-white/10 text-[11px]">
                ⏱️ {trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s (Length: {(trimEnd - trimStart).toFixed(1)}s)
              </span>
            </div>
            <p className="text-[10px] text-gray-400">
              Drag the yellow vertical handles directly on the timeline track to crop start and end points.
            </p>
          </div>
        )}

        {activeTool === 'text' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder="Type overlay text (drag on video to move)..."
                className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FCF6BA]"
              />

              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FCF6BA]"
              >
                {FONTS.map((font) => (
                  <option key={font.class} value={font.class} className="bg-[#12131f]">
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">Color:</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>

              <div className="flex items-center gap-2 flex-1">
                <span className="text-[11px] text-gray-400">Size:</span>
                <input
                  type="range"
                  min={14}
                  max={60}
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  className="w-full accent-[#FCF6BA]"
                />
              </div>
            </div>
          </div>
        )}

        {activeTool === 'music' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#FCF6BA] block">Audio & Mute Settings</span>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:border-[#FCF6BA] rounded-xl text-xs text-[#FCF6BA] cursor-pointer transition"
                >
                  Choose Audio File
                </label>
                <span className="text-xs text-gray-400 truncate max-w-[200px]">
                  {audioName || 'No custom audio file chosen'}
                </span>
              </div>

              {/* Mute Video Button */}
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  isMuted
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <Image
                  src="/mute.png"
                  alt="Mute"
                  width={16}
                  height={16}
                  className={`object-contain w-4 h-4 ${isMuted ? 'opacity-100' : 'opacity-60'}`}
                  unoptimized
                />
                <span>{isMuted ? 'Muted' : 'Mute Video'}</span>
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}