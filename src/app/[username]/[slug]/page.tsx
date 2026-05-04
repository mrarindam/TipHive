'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, ArrowLeft, Share2, MessageCircle, Zap, Lock, Globe2, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ShareModal from '@/components/ui/ShareModal';
import { useAccount } from 'wagmi';

export default function PostPage() {
  const { username, slug } = useParams();
  const { address: userAddress } = useAccount();
  const router = useRouter();
  const [post, setPost] = useState<Record<string, unknown> | null>(null);
  const [creator, setCreator] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!username || !slug) return;
      const title = decodeURIComponent(slug as string);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profile) {
        setCreator(profile);
        const { data: postData } = await supabase
          .from('posts')
          .select('*')
          .eq('creator_id', profile.id)
          .ilike('title', title)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (postData) {
          setPost(postData);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [username, slug]);

  const handleLike = () => {
    if (isLiked) {
      setLikes(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setIsLiked(true);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#F7931A] border-t-transparent rounded-full animate-spin"></div></div>;

  if (!post || !creator) return <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center text-white"><p className="mb-4">Post not found.</p><button onClick={() => router.back()} className="text-[#F7931A] hover:underline">Go Back</button></div>;

  const isOwner = userAddress?.toLowerCase() === (creator?.wallet_address as string)?.toLowerCase();
  const isLocked = post.visibility !== 'public' && !isOwner;
  const type = post.video_url ? 'video' : post.image_url ? 'image' : 'text';

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pt-24 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.push(`/${creator.username}`)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </button>

        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative">
          {/* Creator Header */}
          <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5">
            <Link href={`/${creator.username}`} className="flex items-center gap-4 group">
              <Image 
                src={(creator.avatar_url as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.display_name as string || 'User')}`} 
                alt={creator.display_name as string} 
                width={48} height={48} 
                className="rounded-full bg-black group-hover:scale-105 transition-transform" 
                unoptimized 
              />
              <div>
                <h3 className="font-bold text-lg group-hover:text-[#F7931A] transition-colors">{creator.display_name as string}</h3>
                <p className="text-sm text-slate-400">@{creator.username as string} • {new Date(post.created_at as string).toLocaleDateString()}</p>
              </div>
            </Link>
            <button onClick={() => setIsShareModalOpen(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Post Content */}
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-[#8A2BE2] uppercase tracking-widest bg-[#8A2BE2]/10 px-2 py-1 rounded-md">{type}</span>
              {!!post.category && <span className="text-xs font-bold text-[#F7931A] uppercase tracking-widest bg-[#F7931A]/10 px-2 py-1 rounded-md">{post.category as string}</span>}
              <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1 ${
                post.visibility === 'public' ? 'text-emerald-400 bg-emerald-400/10' :
                post.visibility === 'followers' ? 'text-blue-400 bg-blue-400/10' :
                'text-orange-400 bg-orange-400/10'
              }`}>
                {post.visibility === 'public' ? <Globe2 className="w-3 h-3" /> : post.visibility === 'followers' ? <Users className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {post.visibility === 'public' ? 'Public' : post.visibility === 'followers' ? 'Followers Only' : 'Supporters Only'}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6">{post.title as string}</h1>

            {/* Media Rendering */}
            {!!post.image_url && (
              <div className="w-full relative rounded-2xl overflow-hidden mb-8 aspect-video bg-black">
                {isLocked ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center">
                    <Lock className="w-12 h-12 text-[#F7931A] mb-4" />
                    <h3 className="text-xl font-bold mb-2">Subscribe to Unlock</h3>
                    <p className="text-slate-400 mb-6 max-w-sm">This content is exclusive for supporters. Subscribe to unlock full access.</p>
                    <button className="bg-[#8A2BE2] text-white font-black py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(138,43,226,0.3)] flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Subscribe Now
                    </button>
                  </div>
                ) : (
                  <Image src={post.image_url as string} alt={post.title as string} fill className="object-contain" unoptimized />
                )}
              </div>
            )}

            {!!post.video_url && (
              <div className="w-full relative rounded-2xl overflow-hidden mb-8 aspect-video bg-black">
                {isLocked ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center z-10">
                    <Lock className="w-12 h-12 text-[#F7931A] mb-4" />
                    <h3 className="text-xl font-bold mb-2">Subscribe to Unlock</h3>
                    <button className="bg-[#8A2BE2] text-white font-black py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(138,43,226,0.3)] mt-4">Subscribe Now</button>
                  </div>
                ) : (
                  <video src={post.video_url as string} controls className="w-full h-full object-contain" />
                )}
              </div>
            )}

            <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-slate-300">
              {isLocked ? (
                <div className="relative">
                  <p className="blur-sm select-none opacity-50">This is a blurred out preview of the premium content that you cannot read until you subscribe. It contains very valuable information that the creator has worked hard on.</p>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111827] z-10"></div>
                </div>
              ) : (
                <div 
                  className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-lg prose-h1:text-4xl prose-h1:font-black prose-h2:text-3xl prose-h2:font-bold prose-h3:text-2xl prose-h3:font-bold prose-blockquote:border-l-[#8A2BE2] prose-blockquote:text-slate-400 prose-a:text-[#8A2BE2] prose-strong:text-white prose-ul:list-disc prose-ol:list-decimal prose-li:text-slate-300"
                  dangerouslySetInnerHTML={{ __html: post.content as string }} 
                />
              )}
            </div>
          </div>

          {/* Interactions */}
          <div className="p-6 md:p-8 border-t border-white/5 bg-white/5 flex items-center gap-6">
            <button onClick={handleLike} className={`flex items-center gap-2 font-bold transition-colors ${isLiked ? 'text-[#F7931A]' : 'text-slate-400 hover:text-white'}`}>
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-[#F7931A]' : ''}`} /> {likes} Likes
            </button>
            <button className="flex items-center gap-2 text-slate-400 hover:text-white font-bold transition-colors">
              <MessageCircle className="w-6 h-6" /> 0 Comments
            </button>
          </div>
        </div>

        {/* Comments Section Placeholder */}
        <div className="mt-8 bg-[#111827]/50 rounded-[2rem] p-6 md:p-8 border border-white/5">
          <h3 className="text-xl font-black uppercase mb-6">Comments</h3>
          {!isLocked ? (
            <div className="flex gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-slate-800 shrink-0"></div>
              <div className="flex-1">
                <textarea placeholder="Write a comment..." className="w-full bg-[#1A2234] border border-white/10 rounded-xl p-4 text-white resize-none outline-none focus:border-[#8A2BE2] transition-colors min-h-[100px]"></textarea>
                <div className="flex justify-end mt-2">
                  <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-lg transition-colors">Post Comment</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 font-bold">Comments are for members only.</div>
          )}
        </div>
      </div>
      
      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={typeof window !== 'undefined' ? window.location.href : ''} title={`Check out this post: ${post.title as string}`} />
    </div>
  );
}
