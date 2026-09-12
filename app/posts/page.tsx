'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabaseClient';
import AddPostModal from '@/components/AddPostModal';

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
  views_count?: number;
  user_has_liked?: boolean;
}

const LOCAL_STORAGE_POSTS_KEY = 'cached_community_posts';
const LOCAL_STORAGE_VIEWER_KEY = 'community_viewer_id';

function getOrCreateViewerId(): string {
  if (typeof window === 'undefined') return '';
  let viewerId = localStorage.getItem(LOCAL_STORAGE_VIEWER_KEY);
  if (!viewerId) {
    viewerId = `viewer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(LOCAL_STORAGE_VIEWER_KEY, viewerId);
  }
  return viewerId;
}

function PostSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
      {Array.from({ length: 12 }).map((_, idx) => (
        <div
          key={idx}
          className="border rounded-3xl p-3 bg-[#151622] border-[#B38728]/20 space-y-3 flex flex-col justify-between"
        >
          <div className="relative w-full aspect-video rounded-2xl bg-white/5 border border-white/5">
            <div className="absolute -bottom-3 left-3 w-9 h-9 rounded-full bg-white/10 border-2 border-[#151622]" />
          </div>

          <div className="pt-2 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-3 bg-white/10 rounded-md w-3/4" />
              <div className="h-2.5 bg-white/5 rounded-md w-1/2" />
              <div className="h-2 bg-white/5 rounded-md w-1/3" />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="h-2 bg-white/5 rounded-md w-12" />
              <div className="flex gap-1.5">
                <div className="w-6 h-6 rounded-full bg-white/5" />
                <div className="w-6 h-6 rounded-full bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PostsPage() {
  const router = useRouter();
  const { resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState<boolean>(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadOfflinePosts = () => {
    setIsOfflineMode(true);
    const cachedData = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    if (cachedData) {
      try {
        setPosts(JSON.parse(cachedData));
      } catch {
        setPosts([]);
      }
    } else {
      setPosts([]);
    }
    setLoading(false);
  };

  const trackPostViews = async (postIds: string[], userId: string | null) => {
    if (postIds.length === 0 || !navigator.onLine) return;

    const viewerId = getOrCreateViewerId();
    const viewRecords = postIds.map((id) => ({
      post_id: id,
      viewer_id: viewerId,
      user_id: userId || null,
    }));

    await supabase.from('post_views').upsert(viewRecords, {
      onConflict: 'post_id,viewer_id',
      ignoreDuplicates: true,
    });
  };

  const fetchPosts = async () => {
    setLoading(true);
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (!isOnline) {
      loadOfflinePosts();
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          author_id,
          content,
          media_url,
          type,
          classroom_url,
          created_at,
          profiles!author_id (
            id,
            name,
            username,
            profile_picture
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsData = (data as unknown as Post[]) || [];

      const postsWithMetrics = await Promise.all(
        postsData.map(async (post) => {
          const { count: likesCount } = await supabase
            .from('post_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          const { count: viewsCount } = await supabase
            .from('post_views')
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
            likes_count: likesCount || 0,
            views_count: viewsCount || 0,
            user_has_liked: hasLiked,
          };
        })
      );

      setPosts(postsWithMetrics);
      setIsOfflineMode(false);
      localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(postsWithMetrics));

      const allPostIds = postsData.map((p) => p.id);
      trackPostViews(allPostIds, userId);
    } catch (err) {
      console.warn('Network issue encountered, displaying offline cached posts:', err);
      loadOfflinePosts();
    } finally {
      setLoading(false);
    }
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

    const handleOnline = () => fetchPosts();
    const handleOffline = () => loadOfflinePosts();
    const handleRefreshPosts = () => fetchPosts();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('refresh-posts', handleRefreshPosts);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('refresh-posts', handleRefreshPosts);
    };
  }, [router]);

  const handleToggleLike = async (post: Post) => {
    if (!currentUserId || !navigator.onLine) return;

    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === post.id) {
          const hasLiked = p.user_has_liked;
          return {
            ...p,
            user_has_liked: !hasLiked,
            likes_count: hasLiked ? (p.likes_count || 1) - 1 : (p.likes_count || 0) + 1,
          };
        }
        return p;
      })
    );

    if (post.user_has_liked) {
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', currentUserId);
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: currentUserId });
    }

    fetchPosts();
  };

  const filteredPosts = posts.filter((post) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      post.content?.toLowerCase().includes(query) ||
      post.profiles?.name?.toLowerCase().includes(query) ||
      post.profiles?.username?.toLowerCase().includes(query)
    );
  });

  const activeTheme = theme === 'system' ? resolvedTheme : theme;
  const isDark = mounted ? activeTheme === 'dark' : true;

  const renderPostMedia = (post: Post) => {
    if (post.type === 'CLASSROOM' || post.classroom_url) {
      return (
        <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-amber-950/80 to-[#151622] border border-[#B38728] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden group">
          <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span> LIVE CLASSROOM
          </div>
          <span className="text-3xl mb-1">LIVE</span>
          <p className="text-xs font-bold text-[#FCF6BA] line-clamp-1 max-w-[80%]">Interactive Classroom Session</p>
          {post.classroom_url && (
            <a
              href={post.classroom_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 px-4 py-1.5 bg-[#B38728] hover:bg-[#c29532] text-black font-extrabold text-[10px] rounded-xl transition shadow-[0_0_10px_rgba(179,135,40,0.4)]"
            >
              Join Classroom
            </a>
          )}
        </div>
      );
    }

    let attachments: PostAttachment[] = [];
    if (post.media_url) {
      try {
        attachments = post.media_url.startsWith('[') 
          ? JSON.parse(post.media_url) 
          : [{ url: post.media_url, type: post.type as any, name: 'Attachment' }];
      } catch {
        attachments = [{ url: post.media_url, type: post.type as any, name: 'Attachment' }];
      }
    }

    if (attachments.length > 0) {
      const item = attachments[0];
      if (item.type === 'IMAGE') {
        return (
          <img src={item.url} alt={item.name} className="w-full aspect-video object-cover rounded-2xl border border-[#B38728]/30" />
        );
      }
      if (item.type === 'VIDEO') {
        return (
          <video src={item.url} controls className="w-full aspect-video object-cover rounded-2xl border border-[#B38728]/30" />
        );
      }
    }

    return (
      <div className="w-full aspect-video rounded-2xl bg-[#0f0f17] border border-[#B38728]/20 flex flex-col items-center justify-center p-4 text-center">
        <span className="text-2xl mb-1 text-[#B38728]">POST</span>
        <p className="text-[11px] text-gray-400 italic line-clamp-3 px-2">
          "{post.content || 'Text Post'}"
        </p>
      </div>
    );
  };

  if (!mounted) return null;

  if (posts.length === 0 && !loading && isOfflineMode) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center px-4 transition-colors duration-300 ${
        isDark ? 'bg-[#0b0c10] text-white' : 'bg-slate-50 text-slate-900'
      }`}>
        <div className="relative w-24 h-24 mb-4 rounded-full border-2 border-[#B38728] overflow-hidden shadow-[0_0_20px_rgba(179,135,40,0.3)]">
          <Image 
            src="/pp.jpg" 
            alt="Offline Icon" 
            width={96} 
            height={96} 
            className="w-full h-full object-cover grayscale" 
            unoptimized
          />
        </div>
        <h2 className="text-lg font-bold text-[#FCF6BA]">You are offline</h2>
        <p className="text-xs text-gray-400 mt-1 text-center max-w-sm">
          No offline cached posts found. Please check your internet connection to load community updates.
        </p>
        <button 
          onClick={fetchPosts}
          className="mt-5 px-6 py-2 bg-[#B38728] text-black text-xs font-bold rounded-xl shadow-md hover:bg-[#c29532] transition cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen px-4 py-6 transition-colors duration-300 ${
      isDark ? 'bg-[#0b0c10] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#151622] border border-[#B38728]/30 p-4 rounded-3xl shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-wide">Community Posts</h1>
              {isOfflineMode && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  Offline Mode
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Explore photos, videos, descriptions, & live classrooms</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className={`w-full border rounded-2xl py-2 pl-9 pr-8 text-xs focus:outline-none transition ${
                  isDark
                    ? 'bg-[#0f0f17] border-[#B38728]/30 focus:border-[#FCF6BA] text-white placeholder-gray-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
              <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 fill-gray-400" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </div>

            {/* CREATE POST BUTTON (MODAL TRIGGER 2) */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-add-post-modal'))}
              className="p-2.5 rounded-2xl bg-[#B38728] hover:bg-[#c29532] text-black transition shadow-[0_0_12px_rgba(179,135,40,0.4)] shrink-0 cursor-pointer"
              title="Create Post"
            >
              <Image src="/plus.png" alt="Create Post" width={18} height={18} className="object-contain" unoptimized />
            </button>
          </div>
        </div>

        {loading ? (
          <PostSkeletonGrid />
        ) : filteredPosts.length === 0 ? (
          <div className={`p-10 rounded-3xl border text-center text-xs ${
            isDark ? 'bg-[#151622] border-white/10 text-gray-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            No posts found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPosts.map((post) => {
              const authorName = post.profiles?.name || post.profiles?.username || 'Creator Name';
              const authorInitial = authorName[0].toUpperCase();

              return (
                <div
                  key={post.id}
                  className={`border rounded-3xl p-3 shadow-xl space-y-3 transition-colors flex flex-col justify-between ${
                    isDark ? 'bg-[#151622] border-[#B38728]/30 hover:border-[#B38728]/60' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="relative">
                    {renderPostMedia(post)}
                    
                    <div className="absolute -bottom-3 left-3 w-9 h-9 rounded-full bg-black border-2 border-[#B38728] flex items-center justify-center font-bold text-[#B38728] text-xs shadow-lg z-10 overflow-hidden">
                      {post.profiles?.profile_picture ? (
                        <img src={post.profiles.profile_picture} alt={authorName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{authorInitial}</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 space-y-1 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-white line-clamp-2 leading-snug">
                        {post.content || 'Untitled Post'}
                      </h4>
                      <p className="text-[10px] font-medium text-[#B38728] mt-1 truncate">
                        {authorName}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Released: {new Date(post.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {post.views_count || 0} {post.views_count === 1 ? 'view' : 'views'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[9px] text-gray-500 uppercase tracking-wide font-semibold">
                        {post.type}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleLike(post)}
                          className={`p-1.5 rounded-full border transition flex items-center gap-1 cursor-pointer ${
                            post.user_has_liked
                              ? 'bg-[#B38728]/30 border-[#B38728] text-amber-300'
                              : 'bg-black/40 border-[#B38728]/30 text-gray-400 hover:text-white'
                          }`}
                          title="Like"
                        >
                          <span className="text-[10px]">Like</span>
                          {post.likes_count ? (
                            <span className="text-[9px] font-bold">{post.likes_count}</span>
                          ) : null}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* GLOBAL MODAL COMPONENT */}
      <AddPostModal />
    </div>
  );
}