'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, ImageIcon, Headphones, Video, Eye, Calendar, Trash2, AlertTriangle, Music2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAccount } from 'wagmi';
import { useDashboard } from '@/components/providers/DashboardProvider';
import Pagination from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';

const extractFirstImage = (html: string) => {
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
};

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
  const [currentPage, setCurrentPage] = useState(1);
  const [username, setUsername] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const { user } = useDashboard();

  useEffect(() => {
    const fetchPosts = async () => {
      if (!address && !user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      let profileQuery = supabase.from('user_profiles').select('id, username');
      
      if (address) {
        profileQuery = profileQuery.eq('wallet_address', address.toLowerCase());
      } else if (user?.id) {
        profileQuery = profileQuery.eq('wallet_address', user.id);
      }

      const { data: profile } = await profileQuery.single();
    
      if (profile) {
        setUsername(profile.username);
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
  }, [address, user?.id]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    await supabase.from('posts').delete().eq('id', deleteId);
    setPosts(prev => prev.filter(p => p.id !== deleteId));
    setDeleteId(null);
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
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-[0.85] flex flex-wrap gap-x-4">
          <span>Content</span>
          <span className="text-[#f7931a]">Posts</span>
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
            onClick={() => router.push(`/createposts?type=${type.id}`)}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white dark:bg-[#0f0f14] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 hover:scale-[1.03] shadow-sm hover:shadow-[0_0_30px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${type.color}15`, border: `1px solid ${type.color}30` }}
            >
              <type.icon className="w-7 h-7" style={{ color: type.color }} />
            </div>
            <div className="text-center">
              <p className="text-slate-900 dark:text-white font-bold text-lg">{type.label}</p>
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
      <div className="border-t border-slate-200 dark:border-white/5" />

      {/* Published Section */}
      <div>
        <div className="flex items-center gap-6 mb-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Published</h2>
          <span className="text-sm text-slate-600 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full font-bold">{posts.length} posts</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4 p-5 bg-white dark:bg-[#0f0f14] rounded-2xl border border-slate-200 dark:border-white/5">
                <Skeleton className="w-12 h-12 md:w-16 md:h-16 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center bg-white dark:bg-[#0f0f14] rounded-3xl border border-slate-200 dark:border-white/5">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-white/10">
              <FileText className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Publish your first post</h3>
            <p className="text-slate-500 max-w-md text-sm">Post public posts or make them exclusive to your supporters or members. Creators who post exclusively tend to earn more support.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {posts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => username && router.push(`/${username}/posts/${encodeURIComponent(post.title)}`)}
                  className="flex items-center gap-4 p-5 bg-white dark:bg-[#0f0f14] rounded-2xl border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all group cursor-pointer"
                >
                {/* Thumbnail */}
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#1A2234] flex items-center justify-center relative group">
                  {(() => {
                    const contentImage = extractFirstImage(post.content);
                    const hasImage = post.image_url || contentImage;
                    
                    // Case 1: We have a direct image or an image in content
                    if (hasImage) {
                      return <img src={hasImage} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />;
                    }
                    
                    // Case 2: No image, but we have a video_url (which could be video or audio)
                    if (post.video_url) {
                      const isAudio = post.video_url.match(/\.(mp3|wav|ogg|m4a|aac)$/i);
                      const isVideo = !isAudio && (post.video_url.includes('/video/') || post.video_url.match(/\.(mp4|webm|mov|m4v)$/i));
                      
                      // Try to show a video thumbnail ONLY if it's actually a video and on Cloudinary
                      if (isVideo && post.video_url.includes('cloudinary.com')) {
                        const videoThumb = post.video_url
                          .replace(/\/video\/upload\//, '/video/upload/so_auto,q_auto,f_jpg,w_300/')
                          .replace(/\.[^.]+$/, '.jpg');
                        return <img src={videoThumb} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />;
                      }

                      // Fallback placeholders for Video
                      if (isVideo) {
                        return (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600/20 to-indigo-600/20 relative">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                            <Video className="w-5 h-5 md:w-6 md:h-6 text-blue-400 z-10" />
                          </div>
                        );
                      } else {
                        // It's audio (either detected by extension or as fallback for video_url)
                        return (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-600/20 to-pink-600/20 relative">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                            <Music2 className="w-5 h-5 md:w-6 md:h-6 text-purple-400 z-10" />
                          </div>
                        );
                      }
                    }
                    
                    // Case 3: Pure text post, no media at all
                    return (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5">
                        <FileText className="w-5 h-5 md:w-6 md:h-6 text-slate-600" />
                      </div>
                    );
                  })()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-900 dark:text-white font-bold truncate">{post.title || 'Untitled'}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.visibility === 'public' ? 'public' : post.visibility === 'followers' ? 'supporters' : post.visibility === 'supporters' ? 'members' : post.visibility}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteId(post.id); }}
                    className="p-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all bg-slate-100 dark:bg-white/5 md:bg-transparent"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
            </div>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={Math.ceil(posts.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Delete Post?</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                This action cannot be undone. All media and data associated with this post will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
