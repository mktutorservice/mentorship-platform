'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

interface AuthorProfile {
  id: string;
  name: string;
  username: string;
  profile_picture?: string;
}

// Updated union to include 'TEXT' and eliminate build-time type errors
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
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE';
  created_at: string;
  profiles?: AuthorProfile;
  likes_count?: number;
  user_has_liked?: boolean;
}

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Share Card Toggle & Post Composer State
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [postContent, setPostContent] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [locationStr, setLocationStr] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);

  // Hidden Multi-File Input
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  }, [router]);

  // Handle Multi-File Selection
  const handleMultipleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      setShowAddMenu(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Geolocation Attachment
  const handleAttachLocation = () => {
    setShowAddMenu(false);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `📍 Location: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        setLocationStr(coords);
      },
      () => alert('Unable to retrieve location.')
    );
  };

  // Create & Publish Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && selectedFiles.length === 0) return;

    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      alert('User not authenticated.');
      setSubmitting(false);
      return;
    }

    // Ensure profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      const fallbackUsername = user.email ? user.email.split('@')[0] + '_' + user.id.slice(0, 4) : 'user_' + user.id.slice(0, 4);
      await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        username: fallbackUsername,
        name: user.user_metadata?.name || fallbackUsername,
        role: 'STUDENT'
      });
    }

    // Upload files to Supabase Storage
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

    const finalContent = locationStr 
      ? `${postContent.trim()}\n\n${locationStr}`
      : postContent.trim();

    const mediaPayload = uploadedAttachments.length > 0 
      ? JSON.stringify(uploadedAttachments) 
      : null;

    const primaryType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' = 
      uploadedAttachments.length > 0 ? (uploadedAttachments[0].type as 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE') : 'TEXT';

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
      setLocationStr('');
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

  // Parse Single / Multi Attachment
  const renderPostAttachments = (post: Post) => {
    if (!post.media_url) return null;

    let attachments: PostAttachment[] = [];
    try {
      if (post.media_url.startsWith('[')) {
        attachments = JSON.parse(post.media_url);
      } else {
        attachments = [{ url: post.media_url, type: post.type, name: 'Attachment' }];
      }
    } catch (e) {
      attachments = [{ url: post.media_url, type: post.type, name: 'Attachment' }];
    }

    return (
      <div className="space-y-2 mt-2">
        {attachments.map((item, idx) => (
          <div key={idx}>
            {item.type === 'IMAGE' && (
              <img src={item.url} alt={item.name} className="rounded-xl max-h-80 w-full object-cover border border-white/10" />
            )}
            {item.type === 'VIDEO' && (
              <video src={item.url} controls className="rounded-xl max-h-80 w-full border border-white/10" />
            )}
            {item.type === 'FILE' && (
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 bg-[#10101a] border border-white/10 rounded-xl text-xs text-[#D0BDF4] hover:underline truncate"
              >
                📄 Download: {item.name || 'Attached File'}
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e17] flex items-center justify-center text-[#8458B3] font-medium animate-pulse">
        Loading community feed...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e17] text-white px-4 py-8">
      {/* Hidden Multi-File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        multiple 
        accept="image/*,video/*,.pdf,.doc,.docx,.txt" 
        className="hidden" 
        onChange={handleMultipleFilesSelect} 
      />

      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header with Top 'Share' Button */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#D0BDF4]">Community Feed</h1>
            <p className="text-xs text-gray-400 mt-0.5">Explore posts from peers and mentors</p>
          </div>

          <button
            onClick={() => setIsShareOpen(!isShareOpen)}
            className="px-5 py-2 bg-[#8458B3] hover:bg-[#a280d3] text-white font-medium text-xs rounded-xl transition shadow-lg flex items-center gap-1.5"
          >
            <span>✨ Share</span>
            <span className="text-[10px]">{isShareOpen ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Collapsible Share Composer Box */}
        {isShareOpen && (
          <div className="bg-[#171725] border border-white/10 rounded-2xl p-4 shadow-2xl space-y-3 animate-fadeIn">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind? Share updates, files, photos, or ask a question..."
              rows={3}
              className="w-full bg-[#10101a] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#8458B3] resize-none"
            />

            {/* Location Badge */}
            {locationStr && (
              <div className="flex items-center justify-between bg-[#10101a] border border-[#8458B3]/30 px-3 py-1.5 rounded-xl text-xs text-[#D0BDF4]">
                <span>{locationStr}</span>
                <button 
                  type="button" 
                  onClick={() => setLocationStr('')}
                  className="text-gray-400 hover:text-white font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Selected File Badges */}
            {selectedFiles.length > 0 && (
              <div className="space-y-1.5">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#10101a] border border-white/10 px-3 py-1.5 rounded-xl text-xs text-gray-300">
                    <span className="truncate">📎 {file.name}</span>
                    <button 
                      type="button" 
                      onClick={() => removeFile(idx)}
                      className="text-gray-400 hover:text-white font-bold ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Composer Footer Actions */}
            <div className="flex items-center justify-between pt-1">
              {/* + Add Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="px-3.5 py-1.5 bg-[#202030] hover:bg-[#2a2a40] border border-white/10 text-xs text-white font-medium rounded-xl transition flex items-center gap-1.5"
                >
                  <span>+ Add</span>
                  <span className="text-[10px]">▼</span>
                </button>

                {showAddMenu && (
                  <div className="absolute left-0 mt-2 w-40 bg-[#1a1a28] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-left px-3 py-2 hover:bg-[#8458B3]/20 flex items-center gap-2 text-gray-200"
                    >
                      📁 Attach File(s)
                    </button>
                    <button
                      type="button"
                      onClick={handleAttachLocation}
                      className="w-full text-left px-3 py-2 hover:bg-[#8458B3]/20 flex items-center gap-2 text-gray-200"
                    >
                      📍 Location
                    </button>
                  </div>
                )}
              </div>

              {/* Publish Post Button */}
              <button
                onClick={handleCreatePost}
                disabled={submitting || (!postContent.trim() && selectedFiles.length === 0)}
                className="px-5 py-2 bg-[#8458B3] hover:bg-[#a280d3] disabled:opacity-50 text-white font-medium text-xs rounded-xl transition shadow-md"
              >
                {submitting ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </div>
        )}

        {/* Community Posts Feed */}
        {posts.length === 0 ? (
          <div className="bg-[#171725] p-10 rounded-2xl border border-white/10 text-center text-gray-400 text-sm">
            No posts yet. Be the first to start a discussion!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const authorName = post.profiles?.name || post.profiles?.username || 'Community User';
              const initial = authorName ? authorName[0].toUpperCase() : 'C';

              return (
                <div key={post.id} className="bg-[#171725] border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#8458B3]/20 border border-[#8458B3] flex items-center justify-center font-bold text-white text-sm shrink-0">
                      {initial}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{authorName}</h3>
                      <p className="text-[10px] text-gray-400">
                        {new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {/* Render Single or Multiple Attachments */}
                  {renderPostAttachments(post)}

                  {/* Likes Action Bar */}
                  <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                    <button
                      onClick={() => handleToggleLike(post)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition ${
                        post.user_has_liked ? 'text-pink-500' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {post.user_has_liked ? '❤️ Liked' : '🤍 Like'}
                      <span className="bg-white/5 px-2 py-0.5 rounded-full text-[10px]">
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