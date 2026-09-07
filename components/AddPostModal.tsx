'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface PostAttachment {
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'FILE' | 'TEXT';
  name: string;
}

export default function AddPostModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [activeType, setActiveType] = useState<'video' | 'photo' | 'file' | 'location' | null>(null);

  // Attachment States
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [locationText, setLocationText] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // File Input Refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener('open-add-post-modal', handleOpenModal);
    return () => window.removeEventListener('open-add-post-modal', handleOpenModal);
  }, []);

  const closeModal = () => {
    setIsOpen(false);
    setContent('');
    setSelectedPhotos([]);
    setSelectedFiles([]);
    setLocationText('');
    setActiveType(null);
  };

  const handleSelectType = (type: 'video' | 'photo' | 'file' | 'location') => {
    setActiveType(type);

    if (type === 'video') {
      // Close modal and redirect directly to dedicated video post creation page
      closeModal();
      router.push('/posts/create-video');
    } else if (type === 'photo') {
      photoInputRef.current?.click();
    } else if (type === 'file') {
      fileInputRef.current?.click();
    }
  };

  const handlePhotosSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const incoming = Array.from(e.target.files);
      if (selectedPhotos.length + incoming.length > 7) {
        alert('You can only attach up to 7 photos at a time.');
        const allowed = incoming.slice(0, 7 - selectedPhotos.length);
        setSelectedPhotos((prev) => [...prev, ...allowed]);
      } else {
        setSelectedPhotos((prev) => [...prev, ...incoming]);
      }
    }
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && selectedPhotos.length === 0 && selectedFiles.length === 0 && !locationText.trim()) {
      return;
    }

    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      alert('You must be signed in to post.');
      setSubmitting(false);
      return;
    }

    try {
      const uploadedAttachments: PostAttachment[] = [];

      // Upload photos (Max 7)
      for (const photo of selectedPhotos) {
        const photoExt = photo.name.split('.').pop();
        const photoName = `${user.id}/photo_${Date.now()}_${Math.random().toString(36).substring(7)}.${photoExt}`;
        const { data: photoData } = await supabase.storage
          .from('post-attachments')
          .upload(photoName, photo);

        if (photoData) {
          const publicUrl = supabase.storage
            .from('post-attachments')
            .getPublicUrl(photoName).data.publicUrl;

          uploadedAttachments.push({
            url: publicUrl,
            type: 'IMAGE',
            name: photo.name,
          });
        }
      }

      // Upload documents
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/file_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: fileData } = await supabase.storage
          .from('post-attachments')
          .upload(fileName, file);

        if (fileData) {
          const publicUrl = supabase.storage
            .from('post-attachments')
            .getPublicUrl(fileName).data.publicUrl;

          uploadedAttachments.push({
            url: publicUrl,
            type: 'FILE',
            name: file.name,
          });
        }
      }

      let finalContent = content.trim();
      if (locationText.trim()) {
        finalContent += `\n\n📍 Location: ${locationText.trim()}`;
      }

      const mediaPayload = uploadedAttachments.length > 0 ? JSON.stringify(uploadedAttachments) : null;
      let primaryType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' = 'TEXT';
      if (uploadedAttachments.length > 0) {
        primaryType = uploadedAttachments[0].type;
      }

      const { error: insertError } = await supabase.from('posts').insert({
        author_id: user.id,
        content: finalContent,
        media_url: mediaPayload,
        type: primaryType,
        visibility: 'PUBLIC',
      });

      if (insertError) throw insertError;

      closeModal();
      window.dispatchEvent(new Event('refresh-posts'));
    } catch (err: any) {
      alert(`Error creating post: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0c10] text-white flex flex-col p-6 md:p-12 animate-fadeIn overflow-y-auto">
      <input type="file" ref={photoInputRef} multiple accept="image/*" className="hidden" onChange={handlePhotosSelect} />
      <input type="file" ref={fileInputRef} multiple accept=".pdf,.doc,.docx,.txt,.zip" className="hidden" onChange={handleFilesSelect} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8 max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-black text-white tracking-wide">Create New Post</h2>
        <button
          onClick={closeModal}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white font-bold transition text-lg cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col space-y-6">
        {/* Choices Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => handleSelectType('video')}
            className="flex items-center justify-center gap-3 p-4 rounded-2xl border bg-[#151622] border-white/10 hover:border-[#B38728]/50 transition cursor-pointer"
          >
            <Image src="/educational-video.png" alt="Video" width={24} height={24} className="object-contain w-6 h-6" unoptimized />
            <span className="text-xs font-bold text-gray-200">Video</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectType('photo')}
            className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition cursor-pointer ${
              activeType === 'photo'
                ? 'bg-[#B38728]/20 border-[#B38728] shadow-[0_0_15px_rgba(179,135,40,0.3)]'
                : 'bg-[#151622] border-white/10 hover:border-[#B38728]/50'
            }`}
          >
            <Image src="/image.png" alt="Photo" width={24} height={24} className="object-contain w-6 h-6" unoptimized />
            <span className="text-xs font-bold text-gray-200">Photo</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectType('file')}
            className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition cursor-pointer ${
              activeType === 'file'
                ? 'bg-[#B38728]/20 border-[#B38728] shadow-[0_0_15px_rgba(179,135,40,0.3)]'
                : 'bg-[#151622] border-white/10 hover:border-[#B38728]/50'
            }`}
          >
            <Image src="/folder.png" alt="File" width={24} height={24} className="object-contain w-6 h-6" unoptimized />
            <span className="text-xs font-bold text-gray-200">File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('location')}
            className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition cursor-pointer ${
              activeType === 'location'
                ? 'bg-[#B38728]/20 border-[#B38728] shadow-[0_0_15px_rgba(179,135,40,0.3)]'
                : 'bg-[#151622] border-white/10 hover:border-[#B38728]/50'
            }`}
          >
            <Image src="/location.png" alt="Location" width={24} height={24} className="object-contain w-6 h-6" unoptimized />
            <span className="text-xs font-bold text-gray-200">Location</span>
          </button>
        </div>

        {/* Location Input Field */}
        {activeType === 'location' && (
          <div className="bg-[#151622] border border-[#B38728]/40 p-4 rounded-2xl space-y-2">
            <label className="text-xs font-bold text-[#FCF6BA]">Add Location</label>
            <input
              type="text"
              placeholder="e.g., Campus Library, Engineering Block, Online..."
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              className="w-full bg-[#0f0f17] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FCF6BA]"
            />
          </div>
        )}

        {/* Text Area Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an update, notes, or post context..."
            rows={8}
            className="w-full flex-1 bg-[#151622] border border-[#B38728]/30 rounded-3xl p-6 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FCF6BA] focus:shadow-[0_0_20px_rgba(179,135,40,0.2)] transition resize-none"
          />

          {/* Photos Badge List */}
          {selectedPhotos.length > 0 && (
            <div className="bg-[#151622] p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-bold">Attached Photos ({selectedPhotos.length}/7):</span>
                {selectedPhotos.length < 7 && (
                  <button type="button" onClick={() => photoInputRef.current?.click()} className="text-[11px] text-[#FCF6BA] hover:underline">
                    + Add More
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedPhotos.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#0f0f17] border border-white/10 p-2 rounded-xl text-xs text-gray-300">
                    <span className="truncate">📷 {file.name}</span>
                    <button type="button" onClick={() => removePhoto(idx)} className="text-gray-400 hover:text-white font-bold ml-1">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Badge List */}
          {selectedFiles.length > 0 && (
            <div className="bg-[#151622] p-4 rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs text-gray-400 font-bold block">Attached Documents:</span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#0f0f17] border border-white/10 px-3 py-2 rounded-xl text-xs text-gray-300">
                    <span className="truncate">📎 {file.name}</span>
                    <button type="button" onClick={() => removeFile(idx)} className="text-gray-400 hover:text-white font-bold ml-2">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer - Send Button without Background */}
          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={submitting || (!content.trim() && selectedPhotos.length === 0 && selectedFiles.length === 0 && !locationText.trim())}
              className="p-2 transition-transform hover:scale-110 active:scale-95 disabled:opacity-40 cursor-pointer bg-transparent border-none outline-none"
              title="Publish Post"
            >
              <Image src="/send.png" alt="Send" width={38} height={38} className="object-contain w-9 h-9" unoptimized />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}