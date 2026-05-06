'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Sparkles, Calendar, Music2, Video } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import TopCreatorsBubbles from '@/components/ui/TopCreatorsBubbles';
import { extractFirstImage, TextThumbnail } from '../[username]/layout';
import { useAccount } from 'wagmi';
import { Skeleton, PostCardSkeleton } from '@/components/ui/Skeleton';

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
  creator_id: string;
  visibility: string;
}

interface Creator {
  id: string;
  wallet_address: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  total_earned: number;
  posts?: Post[];
}

function CreatorFeedRow({ creator, isFollowingInitial }: { creator: Creator, isFollowingInitial: boolean }) {
  const { isConnected, address: userAddress } = useAccount();
  const [isFollowing, setIsFollowing] = useState(isFollowingInitial);
  const rowRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "end start"]
  });

  const lineWidth = useTransform(scrollYProgress, [0, 0.5, 1], ["0%", "50%", "100%"]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isConnected || !userAddress) return alert('Please connect your wallet');
    
    try {
      const { data: currentUserProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('wallet_address', userAddress.toLowerCase())
        .single();

      if (!currentUserProfile) return;

      if (isFollowing) {
        await supabase.from('followers').delete().eq('creator_id', creator.id).eq('follower_id', currentUserProfile.id);
        setIsFollowing(false);
      } else {
        await supabase.from('followers').insert({ creator_id: creator.id, follower_id: currentUserProfile.id });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div ref={rowRef} className="mb-24">
      {/* Horizontal Header */}
      <div className="flex items-center gap-4 md:gap-6 mb-8 px-4 md:px-0">
        <Link href={`/${creator.username}`} className="relative shrink-0 group/logo">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#F7931A] to-[#8A2BE2] rounded-full blur-xl opacity-0 group-hover/logo:opacity-40 transition-opacity duration-500" />
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#F7931A] to-[#8A2BE2] shadow-[0_0_25px_rgba(247,147,26,0.2)] relative">
            <div className="w-full h-full rounded-full border-2 border-[#0B0F19] overflow-hidden bg-[#111827]">
              <Image
                src={creator.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.display_name)}`}
                alt={creator.display_name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-4 flex-1">
          {userAddress?.toLowerCase() !== creator.wallet_address.toLowerCase() && (
            <button 
              onClick={handleFollow}
              className={`px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                isFollowing 
                  ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' 
                  : 'bg-[#8A2BE2] text-white hover:bg-[#7828c8] shadow-[0_10px_20px_rgba(138,43,226,0.2)]'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
          
          <div className="flex items-baseline gap-2">
            <Link href={`/${creator.username}`} className="text-xl md:text-2xl font-black text-white hover:text-[#F7931A] transition-colors truncate">
              {creator.display_name}
            </Link>
            <span className="text-slate-500 font-bold text-sm hidden sm:inline">new post</span>
          </div>

          {/* Animated Line */}
          <div className="flex-1 h-[1px] bg-white/5 relative hidden md:block">
            <motion.div 
              style={{ width: lineWidth }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#F7931A] to-[#8A2BE2]" 
            />
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-0">
        {creator.posts && creator.posts.map((post) => {
          const contentImage = extractFirstImage(post.content);
          return (
            <Link 
              key={post.id} 
              href={`/${creator.username}/posts/${encodeURIComponent(post.title)}`}
              className="group relative flex flex-col bg-[#111827] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#F7931A]/30 transition-all shadow-2xl"
            >
              <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-white">
                Post
              </div>
              
              <div className="h-80 relative overflow-hidden bg-[#1A2234]">
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
                    return <Image src={thumbUrl} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />;
                  }

                  if (isAudio) {
                    return (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-600/20 to-pink-600/20 relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <Music2 className="w-12 h-12 text-purple-400 z-10" />
                        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300/50 z-10">Audio Track</span>
                      </div>
                    );
                  }

                  if (isVideo) {
                    return (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-600/20 to-indigo-600/20 relative">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <Video className="w-12 h-12 text-blue-400 z-10" />
                        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-blue-300/50 z-10">Video Clip</span>
                      </div>
                    );
                  }

                  return <TextThumbnail title={post.title} size="small" />;
                })()}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <h4 className="font-black text-xl text-white group-hover:text-[#F7931A] transition-colors line-clamp-2 leading-tight mb-3">
                    {post.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                      post.visibility === 'public' ? 'text-emerald-500 bg-emerald-500/10' : 'text-[#F7931A] bg-[#F7931A]/10'
                    }`}>
                      {post.visibility}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Explore() {
  const { address: userAddress } = useAccount();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const fetchCreators = useCallback(async (pageNum: number, isNewSearch = false) => {
    const limit = 10;
    const from = pageNum * limit;
    const to = from + limit - 1;

    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    let query = supabase
      .from('user_profiles')
      .select('id, wallet_address, username, display_name, bio, avatar_url, total_earned')
      .eq('is_creator', true);
    
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,username.ilike.%${search}%`);
    }

    const { data: profileData, error } = await query
      .order('total_earned', { ascending: false })
      .range(from, to);

    if (error || !profileData) {
      setHasMore(false);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (profileData.length < limit) setHasMore(false);

    // Fetch recent posts
    const creatorIds = profileData.map(p => p.id);
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .in('creator_id', creatorIds)
      .order('created_at', { ascending: false });

    // Fetch following status
    let fIds: string[] = [];
    if (userAddress) {
      const { data: currentUser } = await supabase.from('user_profiles').select('id').eq('wallet_address', userAddress.toLowerCase()).single();
      if (currentUser) {
        const { data: follows } = await supabase.from('followers').select('creator_id').eq('follower_id', currentUser.id);
        if (follows) fIds = follows.map(f => f.creator_id);
      }
    }
    setFollowingIds(prev => isNewSearch ? fIds : [...new Set([...prev, ...fIds])]);

    const creatorsWithPosts = profileData.map(profile => ({
      ...profile,
      posts: postsData?.filter(p => p.creator_id === profile.id).slice(0, 3) || []
    })).filter(c => c.posts.length > 0) as Creator[];

    setCreators(prev => isNewSearch ? creatorsWithPosts : [...prev, ...creatorsWithPosts]);
    setLoading(false);
    setLoadingMore(false);
  }, [search, userAddress]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchCreators(0, true);
  }, [search, fetchCreators]);

  useEffect(() => {
    if (page > 0) {
      fetchCreators(page);
    }
  }, [page, fetchCreators]);

  return (
    <div className="w-full py-12 pt-32">
      {/* Full Width Header */}
      <div className="px-4 md:px-12 mb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-full">
            <h1 className="text-4xl md:text-8xl font-black text-white mb-4 font-outfit uppercase tracking-tighter leading-[0.9] flex flex-wrap items-center gap-x-2 md:gap-x-4 overflow-visible">
              <span>Discover</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F7931A] to-[#8A2BE2]">Creators</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium">Support the brilliant minds of the Mezo Network.</p>
          </div>
          
          <div className="relative w-full md:w-[400px] group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#F7931A] to-[#8A2BE2] rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
            <div className="relative bg-[#0B0F19] border border-white/10 rounded-3xl p-1.5 flex items-center shadow-2xl">
              <div className="pl-5 text-slate-500">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Find a creator..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none py-3.5 px-4 text-white focus:outline-none placeholder:text-slate-600 font-bold text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Supporters Bubbles - Wider Container */}
      {!search && (
        <div className="px-4 md:px-12">
          <TopCreatorsBubbles />
          
          {/* Live Posting Header */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            <h2 className="text-xl font-black uppercase tracking-tighter text-white font-outfit">Live posting</h2>
          </div>
        </div>
      )}

      {/* Feed Section - Wider Layout */}
      <div className="px-4 md:px-12 space-y-12">
        {creators.map((creator) => (
          <CreatorFeedRow 
            key={creator.id} 
            creator={creator} 
            isFollowingInitial={followingIds.includes(creator.id)} 
          />
        ))}

        {/* Loading Indicators */}
        {loading && (
          <div className="space-y-24 py-10">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <div className="flex items-center gap-6 mb-8">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="h-10 w-64 rounded-2xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Intersection Observer Target */}
        <div ref={lastElementRef} className="h-10" />

        {!hasMore && creators.length > 0 && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-full shadow-xl">
              <Sparkles className="w-5 h-5 text-[#F7931A]" />
              <p className="text-sm font-black uppercase tracking-widest text-slate-400">End of the hive</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
