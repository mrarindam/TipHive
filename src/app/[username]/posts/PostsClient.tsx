'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, Globe2, Users, Filter, Sparkles, ChevronDown, Video, Music2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { useProfile, TextThumbnail, extractFirstImage } from '../layout';
import { usePerformanceSettings } from '@/lib/hooks/usePerformanceSettings';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  video_url?: string;
  visibility: string;
  category?: string;
  created_at: string;
}

export default function PostsClient() {
  const { creator, fetchData } = useProfile();
  const { simplifyAnimations, enableBlur } = usePerformanceSettings();
  const { address: userAddress } = useAccount();

  const [posts, setPosts] = useState<Post[]>([]);
  const [postAccessFilter, setPostAccessFilter] = useState<'all' | 'public' | 'supporters' | 'exclusive'>('all');
  const [postSortOrder, setPostSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [hasTipped, setHasTipped] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!creator) return;
    async function loadPosts() {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('creator_id', creator!.id)
        .order('created_at', { ascending: false });
      if (data) setPosts(data);
    }
    loadPosts();
  }, [creator, fetchData]);

  useEffect(() => {
    if (!creator?.wallet_address || !userAddress) {
      setHasTipped(false);
      setIsSubscribed(false);
      return;
    }
    const fan = userAddress.toLowerCase();
    const creatorAddr = (creator.wallet_address as string).toLowerCase();

    async function loadAccess() {
      const [{ data: tipRow }, { data: subs }] = await Promise.all([
        supabase
          .from('tips')
          .select('id')
          .eq('from_address', fan)
          .eq('to_address', creatorAddr)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('subscriptions')
          .select('id, end_date')
          .eq('fan_address', fan)
          .eq('creator_address', creatorAddr)
          .eq('active', true),
      ]);
      setHasTipped(!!tipRow);
      if (subs && subs.length > 0) {
        const now = new Date();
        setIsSubscribed(subs.some(s => new Date(s.end_date) > now));
      } else {
        setIsSubscribed(false);
      }
    }
    loadAccess();

    const onTip = (e: Event) => {
      const detail = (e as CustomEvent<{ creator: string }>).detail;
      if (detail?.creator?.toLowerCase() === creatorAddr) loadAccess();
    };
    const onSub = (e: Event) => {
      const detail = (e as CustomEvent<{ creator: string }>).detail;
      if (detail?.creator?.toLowerCase() === creatorAddr) loadAccess();
    };
    window.addEventListener('tip-success', onTip);
    window.addEventListener('subscription-success', onSub);
    return () => {
      window.removeEventListener('tip-success', onTip);
      window.removeEventListener('subscription-success', onSub);
    };
  }, [creator?.wallet_address, userAddress]);

  if (!creator) return null;

  const isOwner = !!userAddress && !!creator.wallet_address && userAddress.toLowerCase() === (creator.wallet_address as string).toLowerCase();

  const filteredPosts = posts
    .filter(p => {
      const matchesAccess = postAccessFilter === 'all' ||
        (postAccessFilter === 'public' && p.visibility === 'public') ||
        (postAccessFilter === 'supporters' && p.visibility === 'followers') ||
        (postAccessFilter === 'exclusive' && p.visibility === 'supporters');
      return matchesAccess;
    })
    .sort((a, b) => {
      if (postSortOrder === 'latest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  return (
    <motion.div 
      initial={simplifyAnimations ? { opacity: 0 } : { opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.2 }} 
      className="grid grid-cols-1 xl:grid-cols-12 gap-8"
    >

      <div className="xl:col-span-8 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">All Posts</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{filteredPosts.length} posts</p>
          </div>
          <div className="flex items-center gap-3 relative group">
            <div className="flex items-center gap-2 bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl text-slate-900 dark:text-white text-sm font-bold shadow-sm">
              <span className="text-slate-450 dark:text-slate-400 uppercase text-[10px] tracking-widest mr-1">Sort:</span>
              <select
                value={postSortOrder}
                onChange={(e) => setPostSortOrder(e.target.value as 'latest' | 'oldest')}
                className="bg-transparent outline-none cursor-pointer appearance-none pr-6 relative z-10 text-slate-900 dark:text-white"
              >
                <option value="latest" className="bg-white dark:bg-[#0a0a0c] text-slate-900 dark:text-white">Latest</option>
                <option value="oldest" className="bg-white dark:bg-[#0a0a0c] text-slate-900 dark:text-white">Oldest</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>


        <div className="space-y-4">
          {filteredPosts.map(post => {
            const contentImage = extractFirstImage(post.content);
            let thumb = post.image_url || post.video_url || contentImage;

            // Fix: If thumb is a video, use Cloudinary thumbnail logic
            if (thumb && thumb.includes('/video/upload/') && thumb.includes('cloudinary.com')) {
              thumb = thumb.replace(/\/video\/upload\//, '/video/upload/so_auto,q_auto,f_jpg,w_500/').replace(/\.[^.]+$/, '.jpg');
            }

            const hasAccess = isOwner
              || post.visibility === 'public'
              || (post.visibility === 'followers' && (hasTipped || isSubscribed))
              || (post.visibility === 'supporters' && isSubscribed);
            const isLocked = !hasAccess;

            return (
              <Link href={`/${creator!.username}/posts/${encodeURIComponent(post.title as string)}`} key={post.id as string} className="flex flex-col md:flex-row gap-6 p-4 rounded-3xl bg-white dark:bg-[#0a0a0c] hover:bg-slate-50 dark:hover:bg-[#111113] transition-colors border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 group shadow-sm">
                <div className="w-full md:w-64 h-48 md:h-36 bg-slate-100 dark:bg-[#111113] rounded-2xl relative shrink-0 overflow-hidden">
                  <div className={`absolute inset-0 ${isLocked ? 'blur-md scale-110' : ''}`}>
                  {(() => {
                    const isAudio = post.video_url?.match(/\.(mp3|wav|ogg|m4a|aac)$/i);
                    const isVideo = !isAudio && (post.video_url?.includes('/video/') || post.video_url?.match(/\.(mp4|webm|mov|m4v)$/i));
                    let thumbUrl = post.image_url || contentImage;

                    if (!thumbUrl && isVideo && post.video_url?.includes('cloudinary.com')) {
                      thumbUrl = post.video_url
                        .replace(/\/video\/upload\//, '/video/upload/so_auto,q_auto,f_jpg,w_500/')
                        .replace(/\.[^.]+$/, '.jpg');
                    }

                    if (thumbUrl) {
                      return <Image src={thumbUrl} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />;
                    }

                    if (isAudio) {
                      return (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-600/20 to-pink-600/20 relative">
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                          <Music2 className="w-10 h-10 text-purple-400 z-10" />
                          <span className="mt-2 text-[8px] font-black uppercase tracking-[0.2em] text-purple-300/50 z-10">Audio Post</span>
                        </div>
                      );
                    }

                    if (isVideo) {
                      return (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600/20 to-indigo-600/20 relative">
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                          <Video className="w-10 h-10 text-blue-400 z-10" />
                          <span className="mt-2 text-[8px] font-black uppercase tracking-[0.2em] text-blue-300/50 z-10">Video Post</span>
                        </div>
                      );
                    }

                    return <TextThumbnail title={post.title} size="small" />;
                  })()}
                  </div>
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px] z-10">
                      <div className="bg-white/90 dark:bg-[#0a0a0c]/90 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white shadow-md dark:shadow-2xl">
                        <Lock className="w-3.5 h-3.5 text-[#F7931A]" />
                        <span className="uppercase tracking-widest">Locked</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 py-2 flex flex-col justify-center relative">
                  <h4 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#8A2BE2] transition-colors">{post.title as string}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 flex-1">{(post.content as string).replace(/<[^>]*>/g, '')}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-xs text-slate-500 font-bold">{new Date(post.created_at as string).toLocaleDateString()}</p>
                    <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${post.visibility === 'public' ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' :
                        post.visibility === 'followers' ? 'text-blue-400 bg-blue-400/10 border border-blue-400/20' :
                          'text-[#D8B4FE] bg-[#8A2BE2]/10 border border-[#8A2BE2]/30'
                      }`}>
                      {post.visibility === 'public' ? <Globe2 className="w-3 h-3" /> : post.visibility === 'followers' ? <Users className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {post.visibility === 'public' ? 'Public' : post.visibility === 'followers' ? 'Supporters Only' : 'Members Only'}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="xl:col-span-4">
        <div className={`bg-white/90 dark:bg-[#0a0a0c]/80 ${enableBlur ? 'backdrop-blur-xl' : ''} border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 sticky top-24 shadow-sm dark:shadow-2xl`}>

          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-white/5">
            <Filter className="w-5 h-5 text-[#8A2BE2]" />
            <h3 className="font-black uppercase tracking-tighter text-xl text-slate-900 dark:text-white italic">Filter Posts</h3>
          </div>
          
          <div className="mb-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A2BE2] mb-6 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> Access
            </h4>
            <div className="space-y-4">
              {[
                { id: 'all', label: 'All Posts', icon: <Sparkles className="w-4 h-4" /> },
                { id: 'public', label: 'Public', icon: <Globe2 className="w-4 h-4" /> },
                { id: 'supporters', label: 'Supporters Only', icon: <Users className="w-4 h-4" /> },
                { id: 'exclusive', label: 'Members Only', icon: <Lock className="w-4 h-4" /> }
              ].map((item) => (
                <label key={item.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="access" 
                      checked={postAccessFilter === item.id} 
                      onChange={() => setPostAccessFilter(item.id as 'all' | 'public' | 'supporters' | 'exclusive')}
                      className="hidden" 
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${postAccessFilter === item.id ? 'border-[#8A2BE2] bg-[#8A2BE2]/10' : 'border-slate-200 dark:border-white/10 group-hover:border-slate-350 dark:group-hover:border-white/30'}`}>
                      {postAccessFilter === item.id && <div className="w-2.5 h-2.5 rounded-full bg-[#8A2BE2]" />}
                    </div>
                    <span className={`text-sm font-bold transition-colors ${postAccessFilter === item.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
                      {item.label}
                    </span>
                  </div>
                  <span className={`transition-all ${postAccessFilter === item.id ? 'text-[#8A2BE2] opacity-100 scale-110' : 'text-slate-800 opacity-0 scale-90'}`}>
                    {item.icon}
                  </span>
                </label>
              ))}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
