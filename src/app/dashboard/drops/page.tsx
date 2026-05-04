'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Image as ImageIcon, Headphones, Video, Eye, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAccount } from 'wagmi';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  visibility: string;
  category: string;
  created_at: string;
}

const postTypes = [
  { id: 'text', label: 'Post', icon: FileText, color: '#F7931A', desc: 'Write an article or update' },
  { id: 'album', label: 'Photo', icon: ImageIcon, color: '#8A2BE2', desc: 'Share photos with your fans' },
  { id: 'audio', label: 'Audio', icon: Headphones, color: '#3B82F6', desc: 'Upload music or podcasts' },
  { id: 'video', label: 'Video', icon: Video, color: '#EF4444', desc: 'Share video content' },
];

export default function DropsPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    const fetchPosts = async () => {
      setLoading(true);
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .single();

      if (profile) {
        const { data } = await supabase
          .from('posts')
          .select('*')
          .eq('creator_id', profile.id)
          .order('created_at', { ascending: false });
        setPosts(data || []);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [address]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    await supabase.from('posts').delete().eq('id', id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-4 md:px-0 space-y-3"
      >
        <div className="flex items-center gap-3 mb-2">
           <div className="w-12 h-1 bg-[#f7931a] rounded-full" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f7931a]">Creator Suite</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] flex flex-wrap gap-x-4">
          <span>Content</span>
          <span className="text-[#f7931a]">Drops</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
          Share exclusive updates, photos, and media with your most loyal supporters.
        </p>
      </motion.div>

      {/* Post Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {postTypes.map((type, i) => (
          <motion.button
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => router.push(`/dashboard/drops/new?type=${type.id}`)}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-[#0f0f14] border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${type.color}15`, border: `1px solid ${type.color}30` }}
            >
              <type.icon className="w-7 h-7" style={{ color: type.color }} />
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-lg">{type.label}</p>
              <p className="text-slate-500 text-xs mt-1 hidden md:block">{type.desc}</p>
            </div>
            {/* Hover glow */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${type.color}08 0%, transparent 70%)` }}
            />
          </motion.button>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Published Section */}
      <div>
        <div className="flex items-center gap-6 mb-6">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Published</h2>
          <span className="text-sm text-slate-500 bg-white/5 px-3 py-1 rounded-full font-bold">{posts.length} posts</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center bg-[#0f0f14] rounded-3xl border border-white/5">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <FileText className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Publish your first post</h3>
            <p className="text-slate-500 max-w-md text-sm">Post public posts or make them exclusive to your supporters or members. Creators who post exclusively tend to earn more support.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-5 bg-[#0f0f14] rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
              >
                {/* Thumbnail */}
                {post.image_url ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <FileText className="w-6 h-6 text-slate-600" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold truncate">{post.title || 'Untitled'}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.visibility}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
