'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabaseClient';

interface AuthorProfile {
  id: string;
  name: string;
  username: string;
  profile_picture?: string;
}

interface PostAttachment {
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'FILE' | 'TEXT';
  name: string;
}

interface Post {
  id: string;
  author_id: string;
  content: string;
  media_url?: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'CLASSROOM';
  classroom_url?: string;
  created_at: string;
  profiles?: AuthorProfile;
  likes_count?: number;
  user_has_liked?: boolean;
}

export default function PostsPage() {
  const router = useRouter();
  const { resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Composer State
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [postContent, setPostContent] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [classroomUrl, setClassroomUrl] = useState<string>('');
  const [isClassroom, setIsClassroom] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchPosts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        author_id,
        content,
        media_url,
        type,
        created_at,
        profiles!author_id (
          id,
          name,
          username,
          profile_picture
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error.message);
    } else {
      const postsWithLikes = await Promise.all(
        ((data as unknown as Post[]) || []).map(async (post) => {
          const { count } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          let hasLiked = false;
          if (userId) {
            const { data: userLike } = await supabase
              .from('post_likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', userId)
              .maybeSingle();
            hasLiked = !!userLike;
          }

          return {
            ...post,
            likes_count: count || 0,
            user_has_liked: hasLiked,
          };
        })
      );

      setPosts(postsWithLikes);
    }
    setLoading(false);
  };

  useEffect(() => {
    async function initSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }
      setCurrentUserId(session.user.id);
      await fetchPosts();
    }

    initSession();

    const handleToggleModal = () => {
      setIsShareOpen((prev) => !prev);
    };

    window.addEventListener('open-add-post-modal', handleToggleModal);
    return () => {
      window.removeEventListener('open-add-post-modal', handleToggleModal);
    };
  }, [router]);

  const handleMultipleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && selectedFiles.length === 0 && !classroomUrl) return;

    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      alert('User not authenticated.');
      setSubmitting(false);
      return;
    }

    const uploadedAttachments: PostAttachment[] = [];

    for (const file of selectedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: storageData } = await supabase.storage
        .from('post-attachments')
        .upload(fileName, file);

      if (storageData) {
        const { data: publicUrlData } = supabase.storage
          .from('post-attachments')
          .getPublicUrl(fileName);

        let fileType: 'IMAGE' | 'VIDEO' | 'FILE' | 'TEXT' = 'FILE';
        if (file.type.startsWith('image/')) fileType = 'IMAGE';
        else if (file.type.startsWith('video/')) fileType = 'VIDEO';

        uploadedAttachments.push({
          url: publicUrlData.publicUrl,
          type: fileType,
          name: file.name
        });
      }
    }

    const mediaPayload = uploadedAttachments.length > 0 
      ? JSON.stringify(uploadedAttachments) 
      : null;

    let primaryType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' = 'TEXT';
    if (uploadedAttachments.length > 0) {
      primaryType = uploadedAttachments[0].type;
    }

    const finalContent = isClassroom && classroomUrl 
      ? `${postContent.trim()}\n\n🔗 Live Classroom: ${classroomUrl}`
      : postContent.trim();

    const { error } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        content: finalContent,
        media_url: mediaPayload,
        type: primaryType,
        visibility: 'PUBLIC',
      });

    if (error) {
      alert(`Error publishing post: ${error.message}`);
    } else {
      setPostContent('');
      setSelectedFiles([]);
      setClassroomUrl('');
      setIsClassroom(false);
      setIsShareOpen(false);
      await fetchPosts();
    }
    setSubmitting(false);
  };

  const handleToggleLike = async (post: Post) => {
    if (!currentUserId) return;

    if (post.user_has_liked) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', currentUserId);
    } else {
      await supabase
        .from('post_likes')
        .insert({ post_id: post.id, user_id: currentUserId });
    }

    fetchPosts();
  };

  // Filter posts based on user search query
  const filteredPosts = posts.filter((post) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const contentMatches = post.content?.toLowerCase().includes(query);
    const authorNameMatches = post.profiles?.name?.toLowerCase().includes(query);
    const usernameMatches = post.profiles?.username?.toLowerCase().includes(query);

    return contentMatches || authorNameMatches || usernameMatches;
  });

  const activeTheme = theme === 'system' ? resolvedTheme : theme;
  const isDark = mounted ? activeTheme === 'dark' : true;

  const renderPostAttachments = (post: Post) => {
    if (!post.media_url) return null;

    let attachments: PostAttachment[] = [];
    try {
      if (post.media_url.startsWith('[')) {
        attachments = JSON.parse(post.media_url);
      } else {
        attachments = [{ url: post.media_url, type: post.type as any, name: 'Attachment' }];
      }
    } catch (e) {
      attachments = [{ url: post.media_url, type: post.type as any, name: 'Attachment' }];
    }

    return (
      <div className="space-y-3 mt-3">
        {attachments.map((item, idx) => (
          <div key={idx}>
            {item.type === 'IMAGE' && (
              <img src={item.url} alt={item.name} className="rounded-2xl max-h-96 w-full object-cover border border-[#B38728]/20 shadow-md" />
            )}
            {item.type === 'VIDEO' && (
              <video src={item.url} controls className="rounded-2xl max-h-96 w-full border border-[#B38728]/20 shadow-md" />
            )}
            {item.type === 'FILE' && (
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center gap-3 p-3 border rounded-xl text-xs transition group truncate ${
                  isDark
                    ? 'bg-[#0f0f17] border-[#B38728]/30 text-[#FCF6BA] hover:border-[#FCF6BA]'
                    : 'bg-slate-100 border-slate-300 text-amber-800 hover:border-[#B38728]'
                }`}
              >
                <span>📄</span>
                <span className="truncate group-hover:underline">{item.name || 'Attached PDF / Document'}</span>
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-medium animate-pulse transition-colors duration-300 ${
        isDark ? 'bg-[#0b0c10] text-[#B38728]' : 'bg-slate-50 text-amber-700'
      }`}>
        Loading posts...
      </div>
    );
  }

  return (
    <div className={`min-h-screen px-4 py-8 transition-colors duration-300 ${
      isDark ? 'bg-[#0b0c10] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <input 
        type="file" 
        ref={fileInputRef} 
        multiple 
        accept="image/*,video/*,.pdf,.doc,.docx,.txt" 
        className="hidden" 
        onChange={handleMultipleFilesSelect} 
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, context, or members..."
            className={`w-full border rounded-2xl py-3 pl-11 pr-10 text-xs focus:outline-none transition ${
              isDark
                ? 'bg-[#151622] border-[#B38728]/30 focus:border-[#FCF6BA] text-white placeholder-gray-500 focus:shadow-[0_0_15px_rgba(179,135,40,0.3)]'
                : 'bg-white border-slate-300 focus:border-[#B38728] text-slate-900 placeholder-slate-400 focus:shadow-sm'
            }`}
          />
          <svg className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'fill-gray-400' : 'fill-slate-400'}`} viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'
              }`}
            >
              ✕
            </button>
          )}
        </div>

        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-4 transition-colors ${
          isDark ? 'border-white/10' : 'border-slate-200'
        }`}>
          <div>
            <h1 className={`text-2xl font-black tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Community Posts
            </h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Share photos, videos, books, descriptions, & live classrooms
            </p>
          </div>

          {/* Plus Icon Action Button */}
          <button
            onClick={() => setIsShareOpen(!isShareOpen)}
            className={`p-2 rounded-full border shadow-md hover:scale-105 transition flex items-center justify-center cursor-pointer ${
              isDark
                ? 'bg-[#151622]/80 border-[#B38728]/40 shadow-[0_0_15px_rgba(179,135,40,0.2)] hover:border-[#FCF6BA]'
                : 'bg-white border-slate-300 hover:border-[#B38728]'
            }`}
            title={isShareOpen ? "Close Post Composer" : "Create Post"}
          >
            <Image 
              src="/plus.png" 
              alt="Create Post" 
              width={26} 
              height={26} 
              className="object-contain w-6 h-6"
              unoptimized
            />
          </button>
        </div>

        {/* Collapsible Create Post Box */}
        {isShareOpen && (
          <form onSubmit={handleCreatePost} className={`border rounded-3xl p-5 shadow-2xl space-y-4 transition-colors ${
            isDark 
              ? 'bg-[#151622] border-[#B38728]/40 shadow-[0_0_25px_rgba(0,0,0,0.8)]' 
              : 'bg-white border-slate-200 shadow-slate-200'
          }`}>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What would you like to share? (Write descriptions, notes, or post context...)"
              rows={3}
              className={`w-full border rounded-2xl p-4 text-xs focus:outline-none focus:border-[#FCF6BA] focus:shadow-[0_0_12px_rgba(179,135,40,0.4)] transition resize-none ${
                isDark
                  ? 'bg-[#0f0f17] border-[#B38728]/30 text-white placeholder-gray-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />

            {/* Live Classroom Link Option */}
            {isClassroom && (
              <div className="space-y-1">
                <input
                  type="url"
                  placeholder="Paste Live Classroom Link (e.g., Google Meet, Zoom, Jitsi)"
                  value={classroomUrl}
                  onChange={(e) => setClassroomUrl(e.target.value)}
                  className={`w-full border rounded-xl p-3 text-xs focus:outline-none focus:border-[#FCF6BA] ${
                    isDark
                      ? 'bg-[#0f0f17] border-[#B38728]/40 text-white placeholder-gray-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            )}

            {/* Selected File Badges */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className={`flex items-center justify-between border px-3 py-2 rounded-xl text-xs ${
                    isDark ? 'bg-[#0f0f17] border-white/10 text-gray-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}>
                    <span className="truncate">📎 {file.name}</span>
                    <button 
                      type="button" 
                      onClick={() => removeFile(idx)}
                      className={`font-bold ml-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Actions Toolbar */}
            <div className={`flex flex-wrap items-center justify-between gap-3 pt-2 border-t ${
              isDark ? 'border-white/5' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-3.5 py-2 border rounded-xl text-xs font-medium transition cursor-pointer ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                >
                  📁 Attach Media/PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsClassroom(!isClassroom)}
                  className={`px-3.5 py-2 border rounded-xl text-xs font-medium transition cursor-pointer ${
                    isClassroom 
                      ? 'bg-[#B38728]/20 border-[#B38728] text-[#B38728]' 
                      : isDark
                      ? 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                >
                  🎥 Live Classroom
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting || (!postContent.trim() && selectedFiles.length === 0 && !classroomUrl)}
                className="px-6 py-2 bg-[#B38728] hover:bg-[#c29532] disabled:opacity-50 text-black font-extrabold text-xs rounded-xl transition shadow-[0_0_12px_rgba(179,135,40,0.4)] cursor-pointer"
              >
                {submitting ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </form>
        )}

        {/* Feed List */}
        {filteredPosts.length === 0 ? (
          <div className={`p-10 rounded-3xl border text-center text-xs ${
            isDark ? 'bg-[#151622] border-white/10 text-gray-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            {searchQuery ? `No posts matched "${searchQuery}"` : 'No posts found. Be the first to publish a post!'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const authorName = post.profiles?.name || post.profiles?.username || 'Community Member';
              const initial = authorName ? authorName[0].toUpperCase() : 'C';

              return (
                <div key={post.id} className={`border rounded-3xl p-6 shadow-xl space-y-4 transition-colors ${
                  isDark ? 'bg-[#151622] border-white/10' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#B38728]/20 border border-[#B38728] flex items-center justify-center font-bold text-[#B38728] text-sm shrink-0">
                      {initial}
                    </div>
                    <div>
                      <h3 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {authorName}
                      </h3>
                      <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <p className={`text-xs leading-relaxed whitespace-pre-wrap ${
                    isDark ? 'text-gray-200' : 'text-slate-700'
                  }`}>
                    {post.content}
                  </p>

                  {renderPostAttachments(post)}

                  <div className={`flex items-center justify-between pt-3 border-t ${
                    isDark ? 'border-white/5' : 'border-slate-100'
                  }`}>
                    <button
                      onClick={() => handleToggleLike(post)}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition ${
                        post.user_has_liked
                          ? 'text-pink-500'
                          : isDark
                          ? 'text-gray-400 hover:text-white'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {post.user_has_liked ? '❤️ Liked' : '🤍 Like'}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        isDark ? 'bg-white/5' : 'bg-slate-100'
                      }`}>
                        {post.likes_count || 0}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}