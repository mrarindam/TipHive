'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Zap,
  Heart,
  MessageCircle,
  Share2,
  Lock,
  Globe2,
  Users,
  ExternalLink,
  MessageSquare,
  Send,
  Sparkles,
  Music2
} from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useWalletAuth } from '@/lib/wallet-auth-shim';
import { supabase } from '@/lib/supabase';
import TipModal from '@/components/profile/TipModal';
import ShareModal from '@/components/ui/ShareModal';
import { sanitizePostHtml } from '@/lib/sanitize';
import { PostCardSkeleton } from '@/components/ui/Skeleton';

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface Creator {
  id: string;
  wallet_address: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  total_earned?: number;
  suggested_amounts?: string[];
  button_text?: string;
}

interface PostComment {
  id: string;
  post_id: string;
  user_address: string;
  content: string;
  created_at: string;
  sender?: {
    wallet_address: string;
    username: string;
    display_name: string;
    avatar_url: string;
  } | null;
}

interface FeedPost {
  id: string;
  creator_id: string;
  title: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  visibility: string;
  category: string | null;
  created_at: string;
  creator: Creator | null;
  likesCount: number;
  isLiked: boolean;
  comments: PostComment[];
}



export default function HomePageClient() {
  const { address: userAddress } = useAccount();
  const { user, authenticated, login, getAccessToken } = useWalletAuth();
  const userId = user?.id;

  const [posts, setPosts] = useState<FeedPost[]>([]);
  
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [tippedSet, setTippedSet] = useState<Set<string>>(new Set());
  const [subscribedSet, setSubscribedSet] = useState<Set<string>>(new Set());

  // Infinite Scroll & Pagination
  const pageRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Tabs for Feed filter
  const [activeTab, setActiveTab] = useState<'public' | 'members' | 'tips_members'>('public');

  // Comment Drawer states
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [newCommentTexts, setNewCommentTexts] = useState<Record<string, string>>({});
  const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(null);

  // Modal states
  const [selectedCreatorForTip, setSelectedCreatorForTip] = useState<Creator | null>(null);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  const [shareUrl, setShareUrl] = useState('');
  const [shareTitle, setShareTitle] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Fetch access rights
  const loadAccessSets = useCallback(async () => {
    if (!userAddress) {
      setTippedSet(new Set());
      setSubscribedSet(new Set());
      return;
    }
    try {
      const res = await fetch(`/api/user/access?wallet=${encodeURIComponent(userAddress.toLowerCase())}`);
      if (res.ok) {
        const { tipped, subscribed } = await res.json();
        setTippedSet(new Set((tipped || []).map((a: string) => a.toLowerCase())));
        setSubscribedSet(new Set((subscribed || []).map((a: string) => a.toLowerCase())));
      }
    } catch (err) {
      console.error('[homepage] loadAccessSets failed:', err);
    }
  }, [userAddress]);

  // Fetch followed creators
  const loadFollowing = useCallback(async () => {
    const identifier = userAddress ? userAddress.toLowerCase() : userId;
    if (!identifier) {
      setFollowingIds([]);
      return;
    }
    try {
      const { data: currentUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('wallet_address', identifier)
        .maybeSingle();

      if (currentUser) {
        const { data: follows } = await supabase
          .from('followers')
          .select('creator_id')
          .eq('follower_id', currentUser.id);
        if (follows) {
          setFollowingIds(follows.map(f => f.creator_id));
        }
      }
    } catch (err) {
      console.error('[homepage] loadFollowing failed:', err);
    }
  }, [userAddress, userId]);

  // Fetch posts page-by-page (limit 5 per query, absolute limit of 50)
  const fetchFeed = useCallback(async (pageNum: number, isNew = false) => {
    if (isNew) {
      setLoadingFeed(true);
      pageRef.current = 0;
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    const from = pageNum * 5;
    const to = from + 4;

    // Direct Database Cap of 50 posts total
    if (from >= 50) {
      setHasMore(false);
      setLoadingFeed(false);
      setLoadingMore(false);
      return;
    }

    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          creator_id,
          title,
          content,
          image_url,
          video_url,
          visibility,
          category,
          created_at,
          user_profiles (
            id,
            wallet_address,
            username,
            display_name,
            avatar_url,
            bio,
            total_earned,
            suggested_amounts,
            button_text
          )
        `)
        .order('created_at', { ascending: false })
        .range(from, Math.min(49, to)); // hardcap at 49 (which is the 50th item)

      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) {
        setHasMore(false);
        if (isNew) setPosts([]);
        return;
      }

      const postIds = postsData.map(p => p.id);
      const identifier = userAddress ? userAddress.toLowerCase() : userId;

      const [likesRes, commentsRes] = await Promise.all([
        supabase
          .from('post_likes')
          .select('post_id, user_address')
          .in('post_id', postIds),
        supabase
          .from('post_comments')
          .select('id, post_id, user_address, content, created_at')
          .in('post_id', postIds)
          .order('created_at', { ascending: false })
      ]);

      const likesData = likesRes.data || [];
      const commentsData = commentsRes.data || [];

      const commenterAddresses = Array.from(new Set(commentsData.map(c => c.user_address.toLowerCase())));
      const profileMap = new Map<string, {
        wallet_address: string;
        username: string;
        display_name: string;
        avatar_url: string;
      }>();

      if (commenterAddresses.length > 0) {
        const { data: commenterProfiles } = await supabase
          .from('user_profiles')
          .select('wallet_address, username, display_name, avatar_url')
          .in('wallet_address', commenterAddresses);

        for (const p of commenterProfiles || []) {
          if (p.wallet_address) {
            profileMap.set(p.wallet_address.toLowerCase(), p);
          }
        }
      }

      const assembledPosts = (postsData as unknown as {
        id: string;
        creator_id: string;
        title: string;
        content: string;
        image_url: string | null;
        video_url: string | null;
        visibility: string;
        category: string | null;
        created_at: string;
        user_profiles: unknown;
      }[]).map((post) => {
        const likesForPost = likesData.filter(l => l.post_id === post.id);
        const commentsForPost = commentsData.filter(c => c.post_id === post.id).map(c => ({
          ...c,
          sender: profileMap.get(c.user_address.toLowerCase()) || null
        }));

        const isLiked = identifier 
          ? likesForPost.some(l => l.user_address.toLowerCase() === identifier.toLowerCase())
          : false;

        return {
          id: post.id,
          creator_id: post.creator_id,
          title: post.title,
          content: post.content,
          image_url: post.image_url,
          video_url: post.video_url,
          visibility: post.visibility,
          category: post.category,
          created_at: post.created_at,
          creator: post.user_profiles as Creator,
          likesCount: likesForPost.length,
          isLiked,
          comments: commentsForPost
        };
      });

      setPosts(prev => {
        const base = isNew ? [] : prev;
        const postMap = new Map<string, FeedPost>();
        base.forEach(p => postMap.set(p.id, p));
        assembledPosts.forEach(p => postMap.set(p.id, p));
        return Array.from(postMap.values());
      });
      // setHasMore true if we loaded exactly page size (5) and we haven't crossed 50 yet
      setHasMore(postsData.length === 5 && (from + postsData.length) < 50);
    } catch (err) {
      console.error('[homepage] fetchFeed failed:', err);
    } finally {
      setLoadingFeed(false);
      setLoadingMore(false);
    }
  }, [userAddress, userId]);

  // Infinite Scroll Observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingFeed || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        pageRef.current += 1;
        fetchFeed(pageRef.current);
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingFeed, loadingMore, hasMore, fetchFeed]);

  // Initial loading
  useEffect(() => {
    loadAccessSets();
    loadFollowing();
    fetchFeed(0, true);
  }, [loadAccessSets, loadFollowing, fetchFeed]);

  // Live updates trigger
  useEffect(() => {
    const refreshData = () => {
      loadAccessSets();
      fetchFeed(0, true);
    };
    window.addEventListener('tip-success', refreshData);
    window.addEventListener('subscription-success', refreshData);
    return () => {
      window.removeEventListener('tip-success', refreshData);
      window.removeEventListener('subscription-success', refreshData);
    };
  }, [loadAccessSets, fetchFeed]);

  // Follow trigger
  const handleFollowToggle = async (creatorId: string) => {
    if (!authenticated && !userAddress) {
      login();
      return;
    }
    const identifier = userAddress ? userAddress.toLowerCase() : userId;
    if (!identifier) return;

    try {
      const { data: currentUserProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('wallet_address', identifier)
        .maybeSingle();

      if (!currentUserProfile) return;

      const isFollowing = followingIds.includes(creatorId);
      if (isFollowing) {
        await supabase
          .from('followers')
          .delete()
          .eq('creator_id', creatorId)
          .eq('follower_id', currentUserProfile.id);
        setFollowingIds(prev => prev.filter(id => id !== creatorId));
      } else {
        await supabase
          .from('followers')
          .insert({
            creator_id: creatorId,
            follower_id: currentUserProfile.id
          });
        setFollowingIds(prev => [...prev, creatorId]);
      }
    } catch (err) {
      console.error('[homepage] follow toggle error:', err);
    }
  };

  // Like trigger
  const handleLikeToggle = async (postId: string) => {
    if (!authenticated && !userAddress) {
      login();
      return;
    }
    const identifier = userAddress ? userAddress.toLowerCase() : userId;
    if (!identifier) return;

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    const targetPost = posts[postIndex];
    const isLiked = targetPost.isLiked;

    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_address', identifier);

        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return { ...p, isLiked: false, likesCount: Math.max(0, p.likesCount - 1) };
          }
          return p;
        }));
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_address: identifier
          });

        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return { ...p, isLiked: true, likesCount: p.likesCount + 1 };
          }
          return p;
        }));

        if (targetPost.creator?.wallet_address) {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await getAccessToken()}`
            },
            body: JSON.stringify({
              wallet: targetPost.creator.wallet_address,
              action: 'create',
              type: 'like',
              actor: identifier,
              postTitle: targetPost.title
            }),
          });
        }
      }
    } catch (err) {
      console.error('[homepage] like toggle error:', err);
    }
  };

  // Comment submission
  const handlePostComment = async (postId: string) => {
    if (!authenticated && !userAddress) {
      login();
      return;
    }
    const identifier = userAddress ? userAddress.toLowerCase() : userId;
    const commentText = newCommentTexts[postId];
    if (!identifier || !commentText?.trim()) return;

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    const targetPost = posts[postIndex];

    setSubmittingCommentId(postId);
    try {
      const { data: newComment, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_address: identifier,
          content: commentText.trim()
        })
        .select()
        .single();

      if (error) throw error;

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('wallet_address, username, display_name, avatar_url')
        .eq('wallet_address', identifier)
        .maybeSingle();

      const commentWithSender = {
        ...newComment,
        sender: userProfile
      };

      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [commentWithSender, ...p.comments]
          };
        }
        return p;
      }));

      setNewCommentTexts(prev => ({ ...prev, [postId]: '' }));

      if (targetPost.creator?.wallet_address) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
          },
          body: JSON.stringify({
            wallet: targetPost.creator.wallet_address,
            action: 'create',
            type: 'comment',
            actor: identifier,
            postTitle: targetPost.title
          }),
        });
      }
    } catch (err) {
      console.error('[homepage] comment submission failed:', err);
      alert('Failed to post comment');
    } finally {
      setSubmittingCommentId(null);
    }
  };

  // Filtered list based on tabs
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'public') {
      return post.visibility === 'public';
    } else if (activeTab === 'members') {
      return post.visibility === 'supporters';
    } else if (activeTab === 'tips_members') {
      return post.visibility === 'followers' || post.visibility === 'supporters';
    }
    return true;
  });

  return (
    <div className="relative w-full bg-slate-50 dark:bg-[#050505] selection:bg-[#F7931A]/30 text-slate-900 dark:text-white font-sans min-h-screen pt-20 pb-24 transition-colors duration-300">
      
      {/* Decorative Blur Backgrounds - Only visible in dark mode to save rendering overhead */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[#F7931A]/5 to-purple-600/5 blur-[120px] rounded-full pointer-events-none z-0 hidden dark:block" />
      <div className="absolute top-[60vh] left-10 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-600/5 to-blue-600/5 blur-[120px] rounded-full pointer-events-none z-0 hidden dark:block" />

      <div className="w-full px-4 md:px-8 relative z-10 max-w-6xl mx-auto">
        
        {/* Unified Feed Column */}
        <div className="space-y-8">
            
            {/* Feed Tabs Selector */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4 transition-colors duration-300">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 p-1 rounded-2xl transition-colors duration-300">
                {[
                  { id: 'public', label: 'Public Posts', icon: Globe2 },
                  { id: 'members', label: 'Members Only', icon: Lock },
                  { id: 'tips_members', label: 'Tips & Members Only', icon: Sparkles }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as 'public' | 'members' | 'tips_members');
                        setOpenCommentsPostId(null);
                      }}
                      className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${
                        isActive 
                          ? 'text-black bg-[#F7931A] shadow-md' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Posts Feed */}
            {loadingFeed ? (
              <div className="space-y-8">
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="py-24 text-center bg-slate-100/50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 border-dashed rounded-[3rem] p-12 transition-colors duration-300">
                <div className="w-12 h-12 bg-slate-200/60 dark:bg-white/[0.03] border border-slate-300/50 dark:border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500 transition-colors duration-300">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-800 dark:text-white mb-2">No drops found</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-xs leading-relaxed">
                  There are no posts matching this visibility filter at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredPosts.map(post => {
                  if (!post.creator) return null;
                  const creatorAddr = post.creator.wallet_address.toLowerCase();
                  
                  const isOwner = (userAddress || userId)
                    ? (userAddress?.toLowerCase() === creatorAddr) || (userId === post.creator.wallet_address)
                    : false;

                  const hasAccess = isOwner
                    || post.visibility === 'public'
                    || (post.visibility === 'followers' && (tippedSet.has(creatorAddr) || subscribedSet.has(creatorAddr)))
                    || (post.visibility === 'supporters' && subscribedSet.has(creatorAddr));

                  const isLocked = !hasAccess;
                  const isAudio = post.video_url?.match(/\.(mp3|wav|ogg|m4a|aac)$/i);
                  const isVideo = !isAudio && (post.video_url?.includes('/video/') || post.video_url?.match(/\.(mp4|webm|mov|m4v)$/i));

                  return (
                    <article
                      key={post.id}
                      className="bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-md dark:shadow-2xl relative transition-all duration-300"
                    >
                      {/* Post Card Header */}
                      <div className="p-5 md:p-6 flex items-center justify-between border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
                        <div className="flex items-center gap-3">
                          <Link href={`/${post.creator.username}`} className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-white/10 relative block bg-[#111827]">
                            <img
                              src={post.creator.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.creator.display_name || post.creator.username)}`}
                              alt={post.creator.display_name}
                              className="w-full h-full object-cover"
                            />
                          </Link>
                          <div>
                            <div className="flex items-center gap-2">
                              <Link href={`/${post.creator.username}`} className="font-bold text-slate-800 dark:text-white hover:text-[#F7931A] dark:hover:text-[#F7931A] transition-colors leading-tight text-xs sm:text-sm">
                                {post.creator.display_name || post.creator.username}
                              </Link>
                              {post.category && (
                                <span className="text-[8px] font-black text-[#F7931A] uppercase tracking-widest bg-[#F7931A]/10 px-1.5 py-0.5 rounded-md border border-[#F7931A]/20">
                                  {post.category}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-[10px] mt-0.5">
                              <span className="font-semibold">@{post.creator.username}</span>
                              <span>•</span>
                              <span>{formatRelativeTime(post.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isOwner && (
                            <button
                              onClick={() => handleFollowToggle(post.creator_id)}
                              className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${
                                followingIds.includes(post.creator_id)
                                  ? 'bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                                  : 'bg-[#8A2BE2] text-white hover:bg-[#7828c8]'
                              }`}
                            >
                              {followingIds.includes(post.creator_id) ? 'Following' : 'Follow'}
                            </button>
                          )}

                          <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1 ${
                            post.visibility === 'public' ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/20' :
                            post.visibility === 'followers' ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-400/10 border border-blue-200 dark:border-blue-400/20' :
                            'text-[#8A2BE2] bg-purple-50 dark:text-[#D8B4FE] dark:bg-[#8A2BE2]/10 border border-purple-200 dark:border-[#8A2BE2]/30'
                          } transition-all duration-300`}>
                            {post.visibility === 'public' ? <Globe2 className="w-2.5 h-2.5" /> : post.visibility === 'followers' ? <Users className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                            {post.visibility === 'public' ? 'Public' : post.visibility === 'followers' ? 'Supporters' : 'Members'}
                          </span>
                        </div>
                      </div>

                      {/* Locked Overlay or Media content */}
                      {isLocked ? (
                        <div className="relative aspect-[16/9] bg-slate-900/90 dark:bg-black/80 overflow-hidden flex flex-col items-center justify-center p-6 text-center border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
                          <div className="relative z-10 max-w-xs space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#F7931A]/10 border border-[#F7931A]/30 flex items-center justify-center mx-auto">
                              <Lock className="w-5 h-5 text-[#F7931A]" />
                            </div>
                            <h3 className="text-base font-black font-outfit uppercase tracking-tight text-white">
                              {post.visibility === 'followers' ? 'Supporter Drop Locked' : 'Members Only Drop'}
                            </h3>
                            <p className="text-slate-300 dark:text-slate-400 text-[10px] leading-relaxed">
                              {post.visibility === 'followers'
                                ? 'Send a tip or subscribe to this creator to instantly unlock.'
                                : 'Subscribe to a membership tier to unlock.'}
                            </p>
                            <div className="flex items-center justify-center gap-2 pt-1">
                              <button
                                onClick={() => {
                                  setSelectedCreatorForTip(post.creator);
                                  setIsTipModalOpen(true);
                                }}
                                className="bg-[#F7931A] text-black font-black py-2 px-4 rounded-lg hover:scale-105 transition-all text-[9px] uppercase tracking-wider flex items-center gap-1"
                              >
                                <Zap className="w-3 h-3 fill-current" /> Tip to Unlock
                              </button>
                              <Link
                                href={`/${post.creator.username}/subscriptions`}
                                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black py-2 px-4 rounded-lg transition-all text-[9px] uppercase tracking-wider block"
                              >
                                View Tiers
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {post.image_url && (
                            <div className="w-full overflow-hidden border-b border-slate-200 dark:border-white/5 relative bg-slate-100 dark:bg-[#0B0F19] flex items-center justify-center transition-colors duration-300">
                              <img src={post.image_url} alt={post.title} className="w-full max-h-[500px] md:max-h-[600px] object-contain block mx-auto" />
                            </div>
                          )}

                          {isVideo && post.video_url && (
                            <div className="w-full aspect-video bg-black border-b border-slate-200 dark:border-white/5 relative flex items-center justify-center transition-colors duration-300">
                              <video src={post.video_url} controls className="w-full h-full object-contain" controlsList="nodownload" />
                            </div>
                          )}

                          {isAudio && post.video_url && (
                            <div className="p-4 bg-slate-100 dark:bg-[#0E0E14] border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
                              <div className="max-w-md mx-auto bg-white dark:bg-gradient-to-br dark:from-[#1C1917] dark:to-[#0C0A09] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-center gap-3 shadow-sm dark:shadow-xl transition-all duration-300">
                                <div className="w-10 h-10 rounded-lg bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 flex items-center justify-center text-[#8A2BE2] shrink-0">
                                  <Music2 className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <audio src={post.video_url} controls className="w-full h-8" controlsList="nodownload" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Post Info Section */}
                      <div className="p-5 md:p-6 bg-white dark:bg-transparent">
                        <Link href={`/${post.creator.username}/posts/${encodeURIComponent(post.title)}`} className="block group">
                          <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white group-hover:text-[#F7931A] dark:group-hover:text-[#F7931A] transition-colors leading-tight font-outfit uppercase tracking-tight mb-3">
                            {post.title}
                          </h2>
                        </Link>

                        {!isLocked && (
                          <div 
                            className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-xs md:text-sm mb-4 line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.content) }}
                          />
                        )}

                        {/* Interactive Buttons Bar: Like, Comment, and Share */}
                        <div className="flex items-center gap-5 pt-3 border-t border-slate-200 dark:border-white/5 text-[10px] transition-colors duration-300">
                          <button
                            onClick={() => handleLikeToggle(post.id)}
                            className={`flex items-center gap-1.5 font-black uppercase tracking-widest transition-all ${
                              post.isLiked ? 'text-[#F7931A]' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-[#F7931A] text-[#F7931A]' : 'text-slate-400 dark:text-slate-450'}`} />
                            <span>{post.likesCount} Likes</span>
                          </button>
                          
                          <button
                            onClick={() => setOpenCommentsPostId(openCommentsPostId === post.id ? null : post.id)}
                            className={`flex items-center gap-1.5 font-black uppercase tracking-widest transition-all ${
                              openCommentsPostId === post.id ? 'text-[#8A2BE2]' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                            }`}
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments.length} Comments</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}/${post.creator?.username}/posts/${encodeURIComponent(post.title)}`;
                              setShareUrl(url);
                              setShareTitle(`Check out this post by ${post.creator?.display_name || post.creator?.username}: ${post.title}`);
                              setIsShareModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                          
                          <Link
                            href={`/${post.creator.username}/posts/${encodeURIComponent(post.title)}`}
                            className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-white ml-auto"
                          >
                            <span>Full</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>

                      {/* Comments Inline Expandable Drawer */}
                      <AnimatePresence>
                        {openCommentsPostId === post.id && (
                          <div className="border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0a0a0e] p-4 space-y-4 transition-colors duration-300">
                            <div className="flex gap-3 items-start border-b border-slate-200 dark:border-white/5 pb-4 transition-colors duration-300">
                              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 shrink-0 flex items-center justify-center overflow-hidden transition-colors duration-300">
                                <img
                                  src={`https://api.dicebear.com/9.x/shapes/svg?seed=${userAddress || 'anonymous'}`}
                                  alt="You"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 flex gap-2">
                                <textarea
                                  value={newCommentTexts[post.id] || ''}
                                  onChange={(e) => setNewCommentTexts({ ...newCommentTexts, [post.id]: e.target.value })}
                                  placeholder="Write a comment..."
                                  className="flex-1 bg-white dark:bg-white/[0.01] border border-slate-300 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#8A2BE2] outline-none resize-none h-9 transition-all duration-300"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handlePostComment(post.id);
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handlePostComment(post.id)}
                                  disabled={submittingCommentId === post.id || !(newCommentTexts[post.id] || '').trim()}
                                  className="p-2 bg-[#8A2BE2] hover:bg-[#7828c8] text-white rounded-lg transition-all disabled:opacity-40"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                              {post.comments.length === 0 ? (
                                <div className="text-center py-4 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
                                  No comments yet.
                                </div>
                              ) : (
                                post.comments.map(comment => (
                                  <div key={comment.id} className="flex gap-2.5 bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 p-3 rounded-xl transition-all duration-300">
                                    <div className="w-6 h-6 rounded-md overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 bg-slate-100 dark:bg-[#111] transition-colors duration-300">
                                      <img
                                        src={comment.sender?.avatar_url || `https://api.dicebear.com/9.x/shapes/svg?seed=${comment.user_address}`}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <div className="flex items-center gap-1">
                                          <span className="text-[10px] font-bold text-slate-800 dark:text-white leading-none">
                                            {comment.sender?.display_name || 'Anonymous'}
                                          </span>
                                          <span className="text-[8px] text-slate-500 font-semibold leading-none">
                                            @{comment.sender?.username || 'user'}
                                          </span>
                                        </div>
                                        <span className="text-[8px] text-slate-400 dark:text-slate-600 font-black uppercase">
                                          {formatRelativeTime(comment.created_at)}
                                        </span>
                                      </div>
                                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                                        {comment.content}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </AnimatePresence>
                    </article>
                  );
                })}

                {/* Infinite Scroll target node */}
                {hasMore && (
                  <div ref={lastElementRef} className="py-6 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-t-transparent border-[#F7931A] rounded-full animate-spin" />
                  </div>
                )}
                
                {loadingMore && (
                  <div className="space-y-4">
                    <PostCardSkeleton />
                  </div>
                )}

                {!hasMore && posts.length > 0 && (
                  <div className="py-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
                    Showing the 50 most recent drops.
                  </div>
                )}
              </div>
            )}
          </div>

      </div>

      {/* Tip Modal Trigger Integration */}
      {selectedCreatorForTip && (
        <TipModal
          isOpen={isTipModalOpen}
          onClose={() => {
            setIsTipModalOpen(false);
            setSelectedCreatorForTip(null);
          }}
          creator={{
            wallet_address: selectedCreatorForTip.wallet_address,
            display_name: selectedCreatorForTip.display_name,
            username: selectedCreatorForTip.username,
            suggested_amounts: selectedCreatorForTip.suggested_amounts,
            button_text: selectedCreatorForTip.button_text
          }}
        />
      )}

      {/* Share Modal Integration */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={shareUrl}
        title={shareTitle}
      />
    </div>
  );
}
