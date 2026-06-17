'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SinglePostSkeleton } from '@/components/ui/Skeleton';
import { Heart, Share2, MessageCircle, Zap, Lock, Globe2, Users } from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useWalletAuth } from '@/lib/wallet-auth-shim';
import { motion } from 'framer-motion';
import ShareModal from '@/components/ui/ShareModal';
import TipModal from '@/components/profile/TipModal';
import { sanitizePostHtml } from '@/lib/sanitize';

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

interface Post {
  id: string;
  creator_id: string;
  title: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  visibility: string;
  category: string | null;
  created_at: string;
}

interface CreatorProfile {
  id: string;
  wallet_address: string;
  username: string;
  display_name?: string;
  suggested_amounts?: string[];
  button_text?: string;
}

export default function PostDetailClient() {
  const { username, slug } = useParams();
  const { address: userAddress } = useAccount();
  const { user, getAccessToken, authenticated, login } = useWalletAuth();
  const userId = user?.id;
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasTipped, setHasTipped] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchData() {
      if (!username || !slug) return;

      try {
        const bundleRes = await fetch(
          `/api/posts/by-slug?username=${encodeURIComponent(username as string)}&slug=${encodeURIComponent(slug as string)}`,
        );

        if (!bundleRes.ok) {
          setLoading(false);
          return;
        }

        const bundle = await bundleRes.json();
        const bundleCreator = bundle.creator as CreatorProfile & { wallet_address: string };
        const postData = bundle.post as Post;

        setCreator(bundleCreator);
        setPost(postData);
        setLikes(bundle.likesCount || 0);
        setComments(bundle.comments || []);

        const identifier = userAddress ? userAddress.toLowerCase() : userId;

        if (identifier) {
          const promises: PromiseLike<void>[] = [];

          promises.push(
            supabase
              .from('post_likes')
              .select('id')
              .eq('post_id', postData.id)
              .eq('user_address', identifier)
              .maybeSingle()
              .then(({ data }) => {
                setIsLiked(!!data);
              }),
          );

          if (bundleCreator.wallet_address) {
            promises.push(
              fetch(`/api/user/access?wallet=${encodeURIComponent(identifier)}`)
                .then((r) => (r.ok ? r.json() : { tipped: [], subscribed: [] }))
                .then((access: { tipped: string[]; subscribed: string[] }) => {
                  const creatorAddr = bundleCreator.wallet_address.toLowerCase();
                  setIsSubscribed((access.subscribed || []).includes(creatorAddr));
                  setHasTipped((access.tipped || []).includes(creatorAddr));
                }),
            );
          }

          await Promise.all(promises);
        }
      } catch (err) {
        console.error('Error fetching post details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [username, slug, userAddress, userId]);

  const handleLike = async () => {
    if (!authenticated && !userAddress) {
      login();
      return;
    }
    if (!userId && !userAddress) return;
    if (!post) return;
    const identifier = userAddress ? userAddress.toLowerCase() : userId!;

    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_address', identifier);
        setLikes(prev => prev - 1);
        setIsLiked(false);
      } else {
        await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_address: identifier
          });
        setLikes(prev => prev + 1);
        setIsLiked(true);

        // Create notification for creator
        if (creator?.wallet_address) {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await getAccessToken()}`
            },
            body: JSON.stringify({
              wallet: creator.wallet_address,
              action: 'create',
              type: 'like',
              actor: identifier,
              postTitle: post.title
            }),
          });
        }
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handlePostComment = async () => {
    if (!authenticated && !userAddress) {
      login();
      return;
    }
    if (!userId && !userAddress) return;
    if (!post) return;
    if (!commentText.trim()) return;

    const identifier = userAddress ? userAddress.toLowerCase() : userId!;

    setIsSubmittingComment(true);
    try {
      const { data: newComment, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: post.id,
          user_address: identifier,
          content: commentText.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch user profile for the new comment
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('wallet_address, username, display_name, avatar_url')
        .eq('wallet_address', identifier)
        .maybeSingle();

      setComments(prev => [{
        ...newComment,
        sender: userProfile
      }, ...prev]);
      
      setCommentText('');

      // Create notification for creator
      if (creator?.wallet_address) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
          },
          body: JSON.stringify({
            wallet: creator.wallet_address,
            action: 'create',
            type: 'comment',
            actor: identifier,
            postTitle: post.title
          }),
        });
      }
    } catch (err) {
      console.error('Comment error:', err);
      alert('Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] pt-24">
        <SinglePostSkeleton />
      </div>
    );
  }

  if (!post || !creator) return <div className="py-20 flex flex-col items-center justify-center text-white"><p className="mb-4">Post not found.</p><button onClick={() => router.back()} className="text-[#F7931A] hover:underline font-bold">Go Back</button></div>;

  const isOwner = (userAddress || userId) && creator?.wallet_address
    ? (userAddress?.toLowerCase() === creator.wallet_address.toLowerCase()) || (userId === creator.wallet_address)
    : false;
  // 'supporters' = members only (paid subscribers)
  // 'followers' = supporters only (tippers OR members)
  const hasAccess = isOwner
    || post.visibility === 'public'
    || (post.visibility === 'followers' && (hasTipped || isSubscribed))
    || (post.visibility === 'supporters' && isSubscribed);
  const isLocked = !hasAccess;
  const isSupportersPost = post.visibility === 'followers';
  const unlockHref = isSupportersPost ? `/${creator.username}` : `/${creator.username}/subscriptions`;
  const lockTitle = isSupportersPost ? 'Supporters & Members' : 'Members Only';
  const lockMessage = isSupportersPost
    ? 'Available for supporters and members. Tip or subscribe to unlock full access.'
    : 'This visual content is exclusive for my amazing members. Subscribe to unlock full access!';
  const unlockCta = isSupportersPost ? 'Visit Creator' : 'Unlock Now';


  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="max-w-4xl mx-auto pb-10 px-4 pt-10">

      <div className="relative space-y-8">
        {/* Post Header Info */}
        <div className="pb-6 md:pb-8 flex items-center justify-between border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{new Date(post.created_at as string).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <div className="flex items-center gap-2 mt-1">
                <Link href={`/${creator.username}`} className="text-[10px] font-black text-[#8A2BE2] uppercase tracking-widest bg-[#8A2BE2]/10 px-2 py-0.5 rounded-md hover:bg-[#8A2BE2]/20 transition-colors">
                  {creator.display_name || creator.username}
                </Link>
                {!!post.category && <span className="text-[10px] font-black text-[#F7931A] uppercase tracking-widest bg-[#F7931A]/10 px-2 py-0.5 rounded-md">{post.category as string}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-2 ${post.visibility === 'public' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' :
              post.visibility === 'followers' ? 'text-blue-400 bg-blue-400/10 border border-blue-400/20' :
                'text-[#D8B4FE] bg-[#8A2BE2]/10 border border-[#8A2BE2]/30'
              }`}>
              {post.visibility === 'public' ? <Globe2 className="w-3.5 h-3.5" /> : post.visibility === 'followers' ? <Users className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {post.visibility === 'public' ? 'Public' : post.visibility === 'followers' ? 'Supporters Only' : 'Members Only'}
            </span>
            <button onClick={() => setIsShareModalOpen(true)} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-white/5 shadow-sm">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Post Content Body */}
        <div className="py-6 md:py-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4 font-outfit text-slate-900 dark:text-white leading-tight">
            {post.title as string}
          </h1>

          {/* Media Rendering */}
          {!!post.image_url && (
            <div className="w-full relative rounded-3xl overflow-hidden mb-10 shadow-2xl border border-slate-200 dark:border-white/5">
              {isLocked ? (
                <div className="w-full aspect-video relative flex flex-col items-center justify-center bg-white/90 dark:bg-black/80 backdrop-blur-md p-6 text-center">
                  <Lock className="w-16 h-16 text-[#F7931A] mb-4" />
                  <h3 className="text-2xl font-black mb-2 uppercase tracking-tight text-slate-900 dark:text-white">{lockTitle}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm font-medium">{lockMessage}</p>
                  <Link href={unlockHref} className="bg-[#8A2BE2] text-white font-black py-4 px-10 rounded-2xl shadow-[0_15px_30px_rgba(138,43,226,0.4)] flex items-center gap-3 hover:scale-105 transition-all text-sm uppercase tracking-widest">
                    <Zap className="w-4 h-4 fill-current" /> {unlockCta}
                  </Link>
                </div>
              ) : (
                <img src={post.image_url as string} alt={post.title as string} className="w-full h-auto block" />
              )}
            </div>
          )}

          {!!post.video_url && (() => {
            const videoUrl = String(post.video_url);
            const isAudio = videoUrl.match(/\.(mp3|wav|ogg|m4a|aac)$/i);

            if (isAudio) {
              return (
                <div className="relative mb-12 group">
                  {/* Ambient Glow for Audio */}
                  <div className="absolute inset-0 -m-10 bg-gradient-to-br from-purple-600/30 via-pink-600/10 to-transparent blur-[100px] pointer-events-none opacity-50" />

                  <div className="w-full bg-[#111827]/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    {/* Cassette Design */}
                    <div className="max-w-md mx-auto relative aspect-[1.6/1] bg-gradient-to-br from-[#1A2234] to-[#0B0F19] rounded-[2rem] border-4 border-[#2A3449] shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex flex-col p-6 overflow-hidden">
                      {/* Cassette Labels/Lines */}
                      <div className="absolute top-0 left-0 right-0 h-4 bg-[#8A2BE2]/10 border-b border-white/5" />
                      <div className="flex justify-between items-center mb-auto">
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#8A2BE2]">Tape A-90</span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-white/5" />
                          <div className="w-2 h-2 rounded-full bg-white/5" />
                        </div>
                      </div>

                      {/* Rotating Reels Area */}
                      <div className="flex justify-center items-center gap-12 my-4">
                        {[1, 2].map(i => (
                          <div key={i} className="relative w-24 h-24 md:w-32 md:h-32">
                            <div className="absolute inset-0 bg-[#0B0F19] rounded-full border-4 border-white/5 shadow-inner" />
                            <div
                              className="absolute inset-2 border-4 border-dashed border-[#8A2BE2]/40 rounded-full flex items-center justify-center animate-cassette-spin"
                            >
                              <div className="w-8 h-8 md:w-12 md:h-12 bg-[#1A2234] rounded-full border-2 border-white/10 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white/20 rounded-full" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tape View Window */}
                      <div className="mt-auto h-8 bg-black/40 rounded-full border border-white/5 flex items-center justify-center px-6">
                        <div className="w-full h-1 bg-[#8A2BE2]/20 rounded-full overflow-hidden">
                          <div
                            className="w-1/3 h-full bg-gradient-to-r from-transparent via-[#8A2BE2] to-transparent animate-tape-shimmer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Audio Player Controls */}
                    <div className="mt-10 max-w-xl mx-auto">
                      <audio
                        src={videoUrl}
                        controls
                        className="w-full custom-audio-player h-10"
                        controlsList="nodownload"
                      />
                    </div>
                  </div>

                  <style jsx global>{`
                      .custom-audio-player::-webkit-media-controls-enclosure {
                        background-color: rgba(255, 255, 255, 0.05);
                        border-radius: 20px;
                      }
                      .custom-audio-player::-webkit-media-controls-panel {
                        padding: 0 20px;
                      }
                      @keyframes cassette-spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                      }
                      @keyframes tape-shimmer {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(300%); }
                      }
                      .animate-cassette-spin {
                        animation: cassette-spin 4s linear infinite;
                      }
                      .animate-tape-shimmer {
                        animation: tape-shimmer 3s linear infinite;
                      }
                    `}</style>
                </div>
              );
            }

            // Standard Video Player for Non-Audio
            return (
              <div className="relative mb-12">
                <div className="w-full relative rounded-2xl overflow-hidden aspect-video bg-black border border-slate-200 dark:border-white/10 shadow-sm">
                  {isLocked ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-black/80 backdrop-blur-xl p-6 text-center z-10">
                      <div className="w-20 h-20 bg-[#F7931A]/10 rounded-full flex items-center justify-center mb-6 border border-[#F7931A]/20">
                        <Lock className="w-10 h-10 text-[#F7931A]" />
                      </div>
                      <h3 className="text-3xl font-black mb-2 uppercase tracking-tight text-slate-900 dark:text-white">{isSupportersPost ? 'Supporters & Members' : 'Exclusive Content'}</h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm font-medium">{isSupportersPost ? 'Available for supporters and members. Tip or subscribe to unlock this video.' : 'Unlock this video and support the creator to get full access.'}</p>
                      <Link href={unlockHref} className="bg-[#8A2BE2] text-white font-black py-4 px-10 rounded-2xl shadow-[0_15px_30px_rgba(138,43,226,0.4)] uppercase tracking-widest text-sm flex items-center gap-3 hover:scale-105 transition-all">
                        <Zap className="w-4 h-4 fill-current" /> {isSupportersPost ? 'Visit Creator' : 'Subscribe to Watch'}
                      </Link>
                    </div>
                  ) : (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-contain relative z-10"
                      controlsList="nodownload"
                      poster={videoUrl
                        .replace(/\/video\/upload\//, '/video/upload/so_auto,q_auto,f_jpg,w_1000/')
                        .replace(/\.[^.]+$/, '.jpg')}
                    />
                  )}
                </div>
              </div>
            );
          })()}

          <div className="tiptap-content">
            {isLocked ? (
              <div className="relative">
                <div className="space-y-4 opacity-30 select-none">
                  <p className="text-xl font-medium leading-relaxed">This is a premium post. The creator has restricted this content to their loyal members. By subscribing, you&apos;ll get instant access to this post and many more!</p>
                  <div className="h-4 w-full bg-slate-800 rounded-full animate-pulse" />
                  <div className="h-4 w-3/4 bg-slate-800 rounded-full animate-pulse" />
                  <div className="h-4 w-5/6 bg-slate-800 rounded-full animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50 dark:to-[#111827] z-10"></div>
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="bg-white/95 dark:bg-[#111827]/90 border border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-2xl text-center max-w-xs backdrop-blur-xl">
                    <Lock className="w-12 h-12 text-[#F7931A] mx-auto mb-4" />
                    <h4 className="font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">Content Locked</h4>
                    <p className="text-xs text-slate-550 dark:text-slate-400 font-bold mb-6 uppercase tracking-widest">{isSupportersPost ? 'Available for Supporters & Members' : 'Available to Members'}</p>
                    <Link href={unlockHref} className="block w-full bg-white text-black font-black py-3 rounded-xl hover:bg-slate-200 transition-colors text-xs uppercase tracking-widest">{isSupportersPost ? 'Visit Creator' : 'Unlock Access'}</Link>
                  </div>
                </div>
              </div>
            ) : (
              <div
                dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.content as string) }}
              />
            )}
          </div>
        </div>

        {/* Support / Tip CTA (Public posts only) */}
        {post.visibility === 'public' && creator.wallet_address && !isOwner && (
          <div className="mx-6 md:mx-10 mb-8">
            <div className="bg-slate-50 dark:bg-[#0a0a0c] border border-slate-200 dark:border-white/10 rounded-[2rem] px-6 py-8 md:px-10 md:py-10 flex flex-col items-center text-center shadow-2xl">
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium mb-2">Enjoy this post?</p>
              <h4 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                Love to read this post support {creator.display_name || creator.username}
              </h4>
              <button
                onClick={() => setIsTipModalOpen(true)}
                className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold py-3 px-10 rounded-full transition-all shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95"
              >
                Support
              </button>
            </div>
          </div>
        )}

        {/* Interactions */}
        <div className="py-6 border-t border-slate-200 dark:border-white/5 flex items-center gap-8">
          <button onClick={handleLike} className={`flex items-center gap-3 font-black text-sm uppercase tracking-widest transition-all ${isLiked ? 'text-[#F7931A] scale-110' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:scale-105'}`}>
            <Heart className={`w-7 h-7 ${isLiked ? 'fill-[#F7931A]' : ''}`} /> {likes} Likes
          </button>
          <button className="flex items-center gap-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-black text-sm uppercase tracking-widest transition-all hover:scale-105">
            <MessageCircle className="w-7 h-7" /> {comments.length} Comments
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-10 border-t border-slate-200 dark:border-white/5 pt-10">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black uppercase tracking-tighter font-outfit text-slate-900 dark:text-white">Discussion</h3>
          <span className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-widest">{comments.length} Comments</span>
        </div>

        {!isLocked ? (
          <div className="space-y-10">
            <div className="flex gap-6 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8A2BE2]/20 to-[#F7931A]/20 border border-slate-200 dark:border-white/10 shrink-0 flex items-center justify-center overflow-hidden">
                {userAddress || userId ? (
                  <img
                    src={`https://api.dicebear.com/9.x/shapes/svg?seed=${userAddress || userId}`}
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-6 h-6 text-slate-600" />
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-[1.5rem] p-6 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none outline-none focus:ring-2 focus:ring-[#8A2BE2] transition-all min-h-[120px] font-medium shadow-inner"
                ></textarea>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handlePostComment}
                    disabled={isSubmittingComment || !commentText.trim()}
                    className="bg-[#8A2BE2] hover:bg-[#7828c8] text-white font-black py-3 px-8 rounded-xl transition-all shadow-lg shadow-[#8A2BE2]/20 text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-5 p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl group hover:border-[#8A2BE2]/30 transition-all">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 bg-black">
                    <img
                      src={comment.sender?.avatar_url || `https://api.dicebear.com/9.x/shapes/svg?seed=${comment.user_address}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{comment.sender?.display_name || 'Anonymous'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">@{comment.sender?.username || 'user'}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-600 font-bold uppercase tracking-widest">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-slate-650 dark:text-slate-450 leading-relaxed font-medium">{comment.content}</p>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-10 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 border-dashed">
                  <MessageCircle className="w-10 h-10 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs italic">No thoughts shared yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5">
            <Lock className="w-10 h-10 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Join the conversation by becoming a member!</p>
          </div>
        )}
      </div>
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={typeof window !== 'undefined' ? window.location.href : ''} title={`Check out this post: ${post.title as string}`} />
      {creator.wallet_address && (
        <TipModal
          isOpen={isTipModalOpen}
          onClose={() => setIsTipModalOpen(false)}
          creator={{
            wallet_address: creator.wallet_address,
            display_name: creator.display_name,
            username: creator.username,
            suggested_amounts: creator.suggested_amounts,
            button_text: creator.button_text,
          }}
        />
      )}
    </motion.div>
  );
}
