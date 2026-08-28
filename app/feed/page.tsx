'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Post {
  id: string;
  author_id: string;
  content: string;
  type: string;
  visibility: string;
  is_admin_post: boolean;
  is_job_post: boolean;
  created_at: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initFeed() {
      const { data, error } = await supabase
        .from('posts')
        .select('id, author_id, content, type, visibility, is_admin_post, is_job_post, created_at')
        .eq('visibility', 'PUBLIC')
        .order('is_admin_post', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error.message);
      } else if (data) {
        setPosts(data as Post[]);
      }
      setLoading(false);
    }

    initFeed();
  }, []);

  return (
    <section className="space-y-6 max-w-2xl mx-auto py-8 px-4">
      {/* Light Clean Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Home</h1>
      </div>

      {/* Feed Content */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading feed...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-gray-200/80 shadow-sm">
          <p className="text-gray-500 font-medium">No posts in the feed yet.</p>
        </div>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className={`p-6 rounded-2xl border transition shadow-sm ${
              post.is_admin_post
                ? 'bg-blue-50/50 border-blue-200'
                : 'bg-white border-gray-200/80 hover:border-gray-300'
            }`}
          >
            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          </div>
        ))
      )}
    </section>
  );
}