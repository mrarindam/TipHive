'use client';

import { useParams, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { Share2, CheckCircle2, Video, MessageSquare, Code, Calendar, MapPin, AtSign, Globe } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useNetworkConfig } from '@/lib/hooks/useNetworkConfig';
import ShareModal from '@/components/ui/ShareModal';
import MUSDLogo from '@/components/ui/MUSDLogo';
import { ProfileHeaderSkeleton, PostCardSkeleton } from '@/components/ui/Skeleton';



export const extractFirstImage = (html: string) => {
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
};

export const TextThumbnail = ({ title, size = 'large' }: { title: string, size?: 'small' | 'large' }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1e293b] to-[#111827] relative overflow-hidden px-6 text-center group">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(138,43,226,0.15),transparent_70%)]" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7931A]/10 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:translate-x-5 group-hover:-translate-y-5 transition-transform duration-700" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#8A2BE2]/10 blur-3xl rounded-full -translate-x-10 translate-y-10 group-hover:-translate-x-5 group-hover:translate-y-5 transition-transform duration-700" />

      {/* Background Texture/Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />

      <h4 className={`text-white font-black uppercase tracking-tighter z-10 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105 ${size === 'large' ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'} line-clamp-3 px-4`}>
        {title}
      </h4>

      {/* Gloss Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
    </div>
  );
};

interface CreatorProfile {
  id: string;
  privy_did: string;
  wallet_address: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  creator_description?: string;
  creator_category?: string;
  location?: string;
  total_earned?: number;
  social_links?: string[] | Record<string, string>;
  suggested_amounts?: string[];
  button_text?: string;
  thank_you_message?: string;
  created_at: string;
}

interface ProfileContextType {
  creator: CreatorProfile | null;
  loading: boolean;
  followersCount: number;
  postsCount: number;
  isFollowing: boolean;
  isOwner: boolean;
  totalEarned: number;
  handleFollow: () => Promise<void>;
  fetchData: () => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextType | null>(null);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { username } = useParams();
  const pathname = usePathname();
  const { address: userAddress } = useAccount();

  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const { chainId } = useNetworkConfig();

  const { user, getAccessToken } = usePrivy();

  const userId = user?.id;

  const fetchData = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .ilike('username', username as string)
      .single();

    if (profile) {
      setCreator(profile);

      const { count: pCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', profile.id);
      setPostsCount(pCount || 0);

      const { count: fCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', profile.id);
      setFollowersCount(fCount || 0);

      if (userAddress || userId) {
        let profileQuery = supabase.from('user_profiles').select('id');
        
        if (userAddress) {
          profileQuery = profileQuery.eq('wallet_address', userAddress.toLowerCase());
        } else {
          profileQuery = profileQuery.eq('privy_did', userId!);
        }

        const { data: currentUserProfile } = await profileQuery.single();

        if (currentUserProfile) {
          const { data: followData } = await supabase
            .from('followers')
            .select('id')
            .eq('creator_id', profile.id)
            .eq('follower_id', currentUserProfile.id)
            .single();
          setIsFollowing(!!followData);
        }
      }

      // Calculate network-specific earnings
      const { data: tips } = await supabase
        .from('tips')
        .select('amount')
        .eq('to_address', profile.wallet_address.toLowerCase())
        .eq('chain_id', chainId);
      
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('total_paid')
        .eq('creator_address', profile.wallet_address.toLowerCase())
        .eq('chain_id', chainId);

      const tipsTotal = (tips || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      const subsTotal = (subs || []).reduce((acc, curr) => acc + (Number(curr.total_paid) || 0), 0);
      setTotalEarned(tipsTotal + subsTotal);
    }
    setLoading(false);
  }, [username, userAddress, userId, chainId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Always scroll to top when navigation happens within profile pages
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const handleFollow = async () => {
    if (!user?.id) return alert('Please login to follow creators');
    if (!creator) return;

    try {
      let profileQuery = supabase.from('user_profiles').select('id');
      
      if (userAddress) {
        profileQuery = profileQuery.eq('wallet_address', userAddress.toLowerCase());
      } else {
        profileQuery = profileQuery.eq('privy_did', user.id);
      }

      const { data: currentUserProfile } = await profileQuery.single();

      if (!currentUserProfile) return alert('Profile not found. Please complete onboarding.');

      if (isFollowing) {
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('creator_id', creator.id)
          .eq('follower_id', currentUserProfile.id);

        if (error) throw error;
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        const { error } = await supabase
          .from('followers')
          .insert({
            creator_id: creator.id,
            follower_id: currentUserProfile.id
          });

        if (error) throw error;
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);

        // Create notification for creator
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`
          },
          body: JSON.stringify({
            wallet: creator.wallet_address,
            did: creator.privy_did,
            action: 'create',
            type: 'follow',
            actor: userAddress || user.id
          }),
        });
      }
    } catch (err) {
      console.error('Follow error:', err);
      alert('Failed to follow. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19]">
        <ProfileHeaderSkeleton />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center pt-24 text-white">Profile not found.</div>;
  }

  const isOwner = userAddress && creator.wallet_address 
    ? userAddress.toLowerCase() === creator.wallet_address.toLowerCase()
    : false;
  const isHome = pathname === `/${username}`;

  // Tab logic based on pathname
  const activeTab =
    pathname === `/${username}` ? 'home' :
      pathname.includes('/members') ? 'members' :
        pathname.includes('/subscriptions') ? 'subscriptions' :
          pathname.includes('/posts') ? 'posts' : 'home';

  const getSocialIcon = (url: string) => {
    const l = url.toLowerCase();
    if (l.includes('x.com') || l.includes('twitter.com')) return <AtSign className="w-4 h-4" />;
    if (l.includes('github.com')) return <Code className="w-4 h-4" />;
    if (l.includes('discord.com')) return <MessageSquare className="w-4 h-4" />;
    if (l.includes('youtube.com')) return <Video className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <ProfileContext.Provider value={{ creator, loading, followersCount, postsCount, isFollowing, isOwner, totalEarned, handleFollow, fetchData }}>
      <div className="min-h-screen bg-[#000] text-white selection:bg-[#F7931A]/30 pb-20 pt-28">
        <div className="w-full space-y-8 px-4 md:px-6 lg:px-8">

          {/* Main Creator Card */}
          <motion.div
            layout
            className={`bg-[#0a0a0c] border border-white/5 md:rounded-3xl transition-all duration-500 ${!isHome ? 'sticky top-4 z-50 backdrop-blur-xl bg-[#0a0a0c]/80 border-b border-[#8A2BE2]/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'relative'}`}
          >
            <div className="relative">
              <motion.div
                animate={{ height: isHome ? (typeof window !== 'undefined' && window.innerWidth < 768 ? 225 : 500) : 0, opacity: isHome ? 1 : 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full relative bg-[#111113] overflow-hidden aspect-[16/9] md:aspect-[3/1] md:rounded-t-3xl"
              >
                {creator.banner_url ? (
                  <Image src={creator.banner_url as string} alt="Banner" fill className="object-cover object-center" unoptimized />
                ) : (
                  <Image src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000" alt="Banner" fill className="object-cover opacity-80" unoptimized />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-80"></div>
              </motion.div>

              {isHome && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -bottom-12 left-6 md:left-10 z-20"
                >
                  <div className="relative w-24 h-24 md:w-32 md:h-32 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#8A2BE2] to-[#F7931A] rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-full h-full rounded-full border-4 border-[#0a0a0c] overflow-hidden shadow-2xl bg-black">
                      <Image
                        src={(creator.avatar_url as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.display_name as string)}`}
                        alt={creator.display_name as string}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <motion.div
              layout
              className={`px-6 md:px-10 pb-8 relative transition-all duration-500 ${isHome ? 'pt-16' : 'py-6'}`}
            >
              <div className={`flex flex-col md:flex-row gap-8 justify-between ${isHome ? 'items-start' : 'items-center'}`}>
                <motion.div layout className="flex flex-col gap-2 max-w-2xl">
                  <div className="flex items-center gap-4">
                    {!isHome && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-10 h-10 rounded-full border-2 border-[#8A2BE2] overflow-hidden shrink-0 relative shadow-[0_0_10px_rgba(138,43,226,0.3)]"
                      >
                        <Image
                          src={(creator.avatar_url as string) || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.display_name as string)}`}
                          alt={creator.display_name as string}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </motion.div>
                    )}
                    <motion.div layout className="space-y-1">
                      <motion.h1 layout className={`${isHome ? 'text-4xl md:text-5xl' : 'text-xl'} font-black flex items-center gap-3`}>
                        {creator.display_name as string}
                        <CheckCircle2 className={`${isHome ? 'w-8 h-8' : 'w-4 h-4'} text-[#D8B4FE]`} />
                      </motion.h1>
                      {isHome && (
                        <p className="text-[#8A2BE2] font-black text-base tracking-wide">@{creator.username}</p>
                      )}
                    </motion.div>
                  </div>

                  {isHome && (
                    <div className="mt-4 space-y-6">
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed italic border-l-4 border-[#8A2BE2] pl-4">
                        {creator.creator_description as string || 'Content Creator'}
                      </motion.p>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-6 text-slate-400">
                        {creator.location && (
                          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                            <MapPin className="w-4 h-4 text-[#F7931A]" />
                            <span className="text-sm font-bold uppercase tracking-widest">{creator.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                          <Calendar className="w-4 h-4 text-[#8A2BE2]" />
                          <span className="text-sm font-bold uppercase tracking-widest">Joined {new Date(creator.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-3 pt-2">
                        {creator.social_links && (Array.isArray(creator.social_links) ?
                          creator.social_links.map((url, i) => (
                            <a key={i} href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#111113] hover:bg-[#8A2BE2]/20 border border-white/5 rounded-2xl transition-all text-slate-400 hover:text-white hover:scale-110 shadow-lg">
                              {getSocialIcon(url)}
                            </a>
                          )) :
                          Object.entries(creator.social_links).map(([, url], i) => (
                            url && (
                              <a key={i} href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#111113] hover:bg-[#8A2BE2]/20 border border-white/5 rounded-2xl transition-all text-slate-400 hover:text-white hover:scale-110 shadow-lg">
                                {getSocialIcon(url)}
                              </a>
                            )
                          ))
                        )}
                      </motion.div>
                    </div>
                  )}
                </motion.div>

                <motion.div layout className="flex flex-col md:flex-row items-center gap-8">
                  <motion.div layout className={`flex items-center gap-8 bg-white/5 backdrop-blur-md border border-white/5 px-6 py-3 rounded-2xl ${isHome ? '' : 'hidden md:flex'}`}>
                    <div className="text-center">
                      <p className="text-xl font-black text-white leading-tight">{followersCount}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Followers</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-xl font-black text-white leading-tight">{postsCount}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Posts</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <MUSDLogo className="w-4 h-4" />
                        <p className="text-xl font-black text-[#F7931A] leading-tight">{totalEarned}</p>
                      </div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Earned</p>
                    </div>
                  </motion.div>

                  <motion.div layout className="flex items-center gap-3">
                    {isOwner ? (
                      <Link href="/dashboard" className={`flex items-center justify-center gap-2 border border-[#8A2BE2] bg-[#8A2BE2]/10 text-[#8A2BE2] hover:bg-[#8A2BE2] hover:text-white font-bold rounded-2xl transition-all ${isHome ? 'py-3 px-8' : 'py-2 px-6 text-sm'}`}>
                        Dashboard
                      </Link>
                    ) : (
                      <button onClick={handleFollow} className={`flex items-center justify-center gap-2 border font-bold rounded-2xl transition-all shadow-lg ${isFollowing ? 'border-white/20 text-white bg-white/5 hover:bg-white/10' : 'border-[#8A2BE2] bg-[#8A2BE2] text-white shadow-[0_0_15px_rgba(138,43,226,0.3)] hover:bg-[#7828c8]'} ${isHome ? 'py-3 px-8' : 'py-2 px-6 text-sm'}`}>
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                    <button onClick={() => setIsShareModalOpen(true)} className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                </motion.div>
              </div>

              <div className={`flex items-center gap-8 mt-6 border-t border-white/5 pt-4 overflow-x-auto no-scrollbar`}>
                <Link href={`/${username}`} className={`pb-2 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'home' ? 'border-[#8A2BE2] text-white shadow-[0_4px_10px_rgba(138,43,226,0.3)]' : 'border-transparent text-slate-400 hover:text-white'}`}>Home</Link>
                {isOwner && (
                  <Link href={`/${username}/members`} className={`pb-2 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'members' ? 'border-[#8A2BE2] text-white shadow-[0_4px_10px_rgba(138,43,226,0.3)]' : 'border-transparent text-slate-400 hover:text-white'}`}>Members</Link>
                )}
                <Link href={`/${username}/subscriptions`} className={`pb-2 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'subscriptions' ? 'border-[#8A2BE2] text-white shadow-[0_4px_10px_rgba(138,43,226,0.3)]' : 'border-transparent text-slate-400 hover:text-white'}`}>Subscriptions</Link>
                <Link href={`/${username}/posts`} className={`pb-2 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'posts' ? 'border-[#8A2BE2] text-white shadow-[0_4px_10px_rgba(138,43,226,0.3)]' : 'border-transparent text-slate-400 hover:text-white'}`}>Posts</Link>
              </div>
            </motion.div>
          </motion.div>

          <div className="min-h-[50vh]">
            {children}
          </div>
        </div>
        <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${creator.username}`} title={`Check out ${creator.display_name} on TipHive!`} />
      </div>
    </ProfileContext.Provider>
  );
}
