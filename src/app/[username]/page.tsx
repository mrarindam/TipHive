'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, ChevronRight, Lock, Video, Music2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAccount, useWriteContract, useReadContract, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { parseEther } from 'viem';
import SubscriptionSection from '@/components/profile/SubscriptionSection';
import CelebrationModal from '@/components/ui/CelebrationModal';
import { useProfile, TextThumbnail, extractFirstImage } from './layout';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TIPPING_CONTRACT || '0x0000000000000000000000000000000000000000';
const MUSD_ADDRESS = process.env.NEXT_PUBLIC_MUSD_ADDRESS || '0x0000000000000000000000000000000000000000';

const ERC20_ABI = [
  { "name": "approve", "type": "function", "stateMutability": "nonpayable", "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }], "outputs": [{ "name": "", "type": "bool" }] },
  { "name": "allowance", "type": "function", "stateMutability": "view", "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }], "outputs": [{ "name": "", "type": "uint256" }] }
];
const TIPPING_ABI = [
  { "name": "tip", "type": "function", "stateMutability": "nonpayable", "inputs": [{ "name": "_creator", "type": "address" }, { "name": "_amount", "type": "uint256" }], "outputs": [] }
];

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

interface Tip {
  id: string;
  from_address: string;
  amount: number;
  message: string;
  created_at: string;
  sender_profile?: {
    display_name: string;
    avatar_url: string;
    username: string;
  };
}

export default function CreatorHome() {
  const { creator, fetchData, isOwner } = useProfile();
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastTipAmount, setLastTipAmount] = useState('0');

  const { isConnected, address: userAddress } = useAccount();
  const config = useConfig();

  const [amount, setAmount] = useState('10');
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [tipStatus, setTipStatus] = useState<'idle' | 'approving' | 'tipping' | 'success' | 'error'>('idle');
  const [posts, setPosts] = useState<Post[]>([]);
  const [recentTips, setRecentTips] = useState<Tip[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { writeContractAsync } = useWriteContract();
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: MUSD_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [userAddress as `0x${string}`, CONTRACT_ADDRESS as `0x${string}`],
  });

  useEffect(() => {
    if (!creator) return;

    async function loadHomeData() {
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('creator_id', creator!.id)
        .order('created_at', { ascending: false });
        if (postsData) setPosts(postsData);

        // Check subscription
        if (userAddress && creator) {
          const { data: subs } = await supabase
            .from('subscriptions')
            .select('id, end_date')
            .eq('fan_address', userAddress.toLowerCase())
            .eq('creator_address', creator.wallet_address.toLowerCase())
            .eq('active', true);
          
          if (subs && subs.length > 0) {
            const now = new Date();
            const activeSub = subs.find(s => new Date(s.end_date) > now);
            if (activeSub) setIsSubscribed(true);
          }
        }

      const { data: tipsData } = await supabase
        .from('tips')
        .select('*')
        .eq('to_address', creator!.wallet_address.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(5);

      if (tipsData && tipsData.length > 0) {
        const tipAddresses = tipsData.map((t) => t.from_address);
        const { data: senderProfiles } = await supabase
          .from('user_profiles')
          .select('wallet_address, display_name, avatar_url, username')
          .in('wallet_address', tipAddresses);

        const combinedTips = tipsData.map((t) => ({
          ...t,
          sender_profile: senderProfiles?.find((p) => p.wallet_address.toLowerCase() === t.from_address.toLowerCase())
        }));
        setRecentTips(combinedTips as Tip[]);
      }
    }

    loadHomeData();
  }, [creator, fetchData, userAddress]);

  if (!creator) return null;

  const handleTip = async () => {
    if (!isConnected || !userAddress) return alert('Please connect your wallet');
    if (!creator) return;

    const val = customAmount || amount;
    const finalAmount = String(val || '0');
    
    if (!finalAmount || isNaN(Number(finalAmount)) || Number(finalAmount) <= 0) return alert('Enter a valid amount');

    try {
      const tipAmount = parseEther(finalAmount);
      if (!allowance || BigInt(allowance.toString()) < tipAmount) {
        setTipStatus('approving');
        const approveHash = await writeContractAsync({
          address: MUSD_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESS as `0x${string}`, tipAmount],
        });
        await waitForTransactionReceipt(config, { hash: approveHash });
        await refetchAllowance();
      }

      setTipStatus('tipping');
      const tipHash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TIPPING_ABI,
        functionName: 'tip',
        args: [creator.wallet_address as `0x${string}`, tipAmount],
      });
      await waitForTransactionReceipt(config, { hash: tipHash });

      await supabase.from('tips').insert({
        from_address: userAddress.toLowerCase(),
        to_address: creator.wallet_address.toLowerCase(),
        amount: parseFloat(finalAmount),
        tx_hash: tipHash,
        message: message
      });

      await supabase.rpc('increment_creator_earned', {
        creator_address: creator.wallet_address.toLowerCase(),
        amount_to_add: parseFloat(finalAmount)
      });

      // Create notification for creator
      try {
        const { data: senderProfile } = await supabase
          .from('user_profiles')
          .select('display_name, username')
          .eq('wallet_address', userAddress.toLowerCase())
          .single();
        
        const senderName = senderProfile?.display_name || (senderProfile?.username ? `@${senderProfile.username}` : `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`);
        
        const res = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: creator.wallet_address.toLowerCase(),
            action: 'create',
            type: 'tip',
            content: `You received a ${finalAmount} MUSD tip from ${senderName}! 💝`
          })
        });
        if (!res.ok) {
          console.warn('Failed to send tip notification:', res.status);
        }
      } catch (nErr) {
        console.error('Failed to send tip notification:', nErr);
      }

      setTipStatus('success');
      setLastTipAmount(finalAmount);
      setShowCelebration(true);
      setCustomAmount('');
      setMessage('');
    } catch (err) {
      console.error(err);
      setTipStatus('error');
      setTimeout(() => setTipStatus('idle'), 3000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 space-y-8">
          <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-8">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4">About Creator</h3>
            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{creator!.bio as string || 'This creator hasn\'t written a bio yet.'}</p>
          </div>

          <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-8">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" /> Recent Tips
            </h3>
            <div className="space-y-4">
              {recentTips.length > 0 ? recentTips.map((tip) => (
                <div key={tip.id} className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[#8A2BE2]/30 transition-colors">
                  <Link href={tip.sender_profile ? `/${tip.sender_profile.username}` : '#'} className="relative w-10 h-10 shrink-0">
                    <Image
                      src={tip.sender_profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(tip.sender_profile?.display_name || 'User')}`}
                      alt={tip.sender_profile?.display_name || 'User'}
                      fill
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Link href={tip.sender_profile ? `/${tip.sender_profile.username}` : '#'} className="font-bold text-sm text-white hover:text-[#8A2BE2] truncate transition-colors">
                        {tip.sender_profile?.display_name || 'Anonymous Supporter'}
                      </Link>
                      <span className="text-[#F7931A] font-black text-xs">${tip.amount}</span>
                    </div>
                    {tip.message && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 italic">&quot;{tip.message}&quot;</p>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-xs text-center py-4">No tips yet. Be the first!</p>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl p-5 md:p-8 shadow-xl flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-black uppercase tracking-tighter text-white font-outfit">SUBSCRIPTIONS</h3>
                <p className="text-slate-500 text-[10px] font-medium mt-1 uppercase tracking-widest">Exclusive Access</p>
              </div>
              <SubscriptionSection 
                limit={1} 
                creatorAddress={creator!.wallet_address as string} 
                creatorName={creator!.display_name as string} 
                onSuccess={fetchData}
              />
            </div>

            <div className="bg-gradient-to-b from-[#0a0a0c] to-[#111113] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#F7931A]/10 blur-[60px] rounded-full pointer-events-none" />
              <div className="relative z-10 flex flex-col">
                <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 font-outfit text-white/70">
                  <Heart className="w-4 h-4 text-red-500" /> Support with Tip
                </h3>
                
                <div className="space-y-8 py-6">
                  <div className={`grid gap-3 ${(creator.suggested_amounts?.length || 3) === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                    {(creator.suggested_amounts?.length ? creator.suggested_amounts : ['5', '25', '50']).slice(0, 4).map((val: string) => (
                      <button 
                        key={val} 
                        onClick={() => { setAmount(val); setCustomAmount(''); }} 
                        className={`py-3 rounded-2xl font-black transition-all text-xs border ${amount === val && !customAmount ? 'bg-[#F7931A] text-black border-[#F7931A] shadow-[0_10px_20px_rgba(247,147,26,0.2)]' : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10 hover:border-white/10'}`}
                      >
                        ${val}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-1.5 focus-within:ring-2 focus-within:ring-[#F7931A] transition-all">
                      <span className="text-slate-400 font-black mr-2">$</span>
                      <input 
                        type="number" 
                        placeholder="Custom" 
                        value={customAmount} 
                        onChange={e => setCustomAmount(e.target.value)} 
                        className="w-full bg-transparent border-none py-2 text-white outline-none text-base font-black placeholder:text-slate-600" 
                      />
                    </div>

                    <textarea 
                      placeholder="Leave a message..." 
                      value={message} 
                      onChange={e => setMessage(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-[#F7931A] outline-none resize-none h-32 text-sm font-medium placeholder:text-slate-600 transition-all" 
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={handleTip} 
                      disabled={tipStatus === 'approving' || tipStatus === 'tipping'} 
                      className="w-full bg-[#8A2BE2] text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-[#7828c8] hover:scale-[1.01] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(138,43,226,0.2)] text-xs uppercase tracking-[0.2em]"
                    >
                      {tipStatus === 'approving' ? 'Confirming Approval...' :
                    tipStatus === 'tipping' ? 'Sending Tip...' : `Send ${creator!.button_text || 'Tip'}`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="space-y-1">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white font-outfit">Recent Feed</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Latest updates from {creator!.display_name}</p>
          </div>
          <Link href={`/${creator!.username}/posts`} className="p-3 bg-[#0a0a0c] border border-white/5 rounded-2xl text-[#8A2BE2] text-xs font-bold hover:bg-[#8A2BE2] hover:text-white transition-all flex items-center gap-2 shadow-lg group">
            Explore All <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.slice(0, 4).map(post => {
            const isLocked = post.visibility !== 'public' && !isOwner && !isSubscribed;
            return (
              <Link href={`/${creator!.username}/posts/${encodeURIComponent(post.title as string)}`} key={post.id as string} className="bg-[#0a0a0c] border border-white/5 rounded-[2rem] overflow-hidden group hover:border-[#8A2BE2]/50 transition-all block shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                <div className="h-52 bg-[#111113] relative overflow-hidden">
                  {(() => {
                    const contentImage = extractFirstImage(post.content);
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

                    return <TextThumbnail title={post.title} />;
                  })()}
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-white border border-white/10">Post</div>
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-[#0a0a0c]/90 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-black text-white shadow-2xl">
                        <Lock className="w-3.5 h-3.5 text-[#F7931A]" /> 
                        <span className="uppercase tracking-widest">Locked</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h4 className="font-black text-lg mb-2 truncate group-hover:text-[#8A2BE2] transition-colors">{post.title as string}</h4>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{new Date(post.created_at as string).toLocaleDateString()}</p>
                    <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${
                        post.visibility === 'public' ? 'text-emerald-500 bg-emerald-500/10' : 
                        (post.visibility === 'followers' ? 'text-blue-400 bg-blue-400/10' : 'text-orange-500 bg-orange-500/10')
                      }`}>
                        {post.visibility === 'public' ? 'Public' : 'Members Only'}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <CelebrationModal 
        isOpen={showCelebration} 
        onClose={() => {
          setShowCelebration(false);
          setTipStatus('idle');
          fetchData();
        }}
        type="tip"
        amount={lastTipAmount}
        message={creator!.thank_you_message}
      />
    </motion.div>
  );
}
