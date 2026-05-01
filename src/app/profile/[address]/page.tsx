'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, Clock, ArrowLeft, History, Share2, Globe2, LayoutDashboard, Zap } from 'lucide-react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useAccount, useWriteContract, useReadContract, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { parseEther } from 'viem';
import ShareModal from '@/components/ui/ShareModal';
import MUSDLogo from '@/components/ui/MUSDLogo';
import SubscriptionSection from '@/components/profile/SubscriptionSection';

// Simplified ABIs
const TIPPING_ABI = [
  {
    "name": "tip",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "_creator", "type": "address" },
      { "name": "_amount", "type": "uint256" }
    ],
    "outputs": []
  }
];

const ERC20_ABI = [
  {
    "name": "approve",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool" }]
  },
  {
    "name": "allowance",
    "type": "function",
    "stateMutability": "view",
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256" }]
  }
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TIPPING_CONTRACT || '0x0000000000000000000000000000000000000000';
const MUSD_ADDRESS = process.env.NEXT_PUBLIC_MUSD_ADDRESS || '0x0000000000000000000000000000000000000000';

interface Profile {
  wallet_address: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  creator_category?: string;
  creator_description?: string;
  is_creator: boolean;
  total_earned: number;
  social_links?: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
}

interface Tip {
  id: string;
  from_address: string;
  amount: number;
  message?: string;
  created_at: string;
  sender?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export default function CreatorProfile() {
  const { address } = useParams();
  const { isConnected, address: userAddress } = useAccount();
  const [creator, setCreator] = useState<Profile | null>(null);
  const [recentTips, setRecentTips] = useState<Tip[]>([]);
  const [amount, setAmount] = useState('5');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'approving' | 'tipping' | 'success' | 'error'>('idle');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showTipCelebration, setShowTipCelebration] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const config = useConfig();
  const { writeContractAsync, error: writeError, reset: resetWrite } = useWriteContract();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: MUSD_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [userAddress as `0x${string}`, CONTRACT_ADDRESS as `0x${string}`],
  });

  const { data: contractBalance, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: [
      {
        "name": "getCreatorBalance",
        "type": "function",
        "stateMutability": "view",
        "inputs": [{ "name": "_creator", "type": "address" }],
        "outputs": [{ "name": "", "type": "uint256" }]
      }
    ],
    functionName: 'getCreatorBalance',
    args: [creator?.wallet_address as `0x${string}`],
  });

  const fetchData = useCallback(async () => {
    if (!address) return;
    const id = (address as string).toLowerCase();

    const isAddress = id.startsWith('0x');

    const { data: creatorData } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`wallet_address.eq.${id}${!isAddress ? `,username.eq.${id}` : ''}`)
      .single();

    if (creatorData) {
      setCreator(creatorData as Profile);

      const { data: tipsData } = await supabase
        .from('tips')
        .select('*')
        .eq('to_address', creatorData.wallet_address)
        .order('created_at', { ascending: false })
        .limit(5);

      if (tipsData) {
        // Fetch profiles for tip senders
        const senderAddresses = tipsData.map(t => t.from_address.toLowerCase());
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('wallet_address, username, display_name, avatar_url')
          .in('wallet_address', senderAddresses);

        const profileMap = new Map((profiles || []).map(p => [p.wallet_address.toLowerCase(), p]));

        const tipsWithSenders = tipsData.map(tip => ({
          ...tip,
          sender: profileMap.get(tip.from_address.toLowerCase())
        }));

        setRecentTips(tipsWithSenders);
      }
    }
  }, [address]);

  useEffect(() => {
    setTimeout(() => fetchData(), 0);
  }, [fetchData]);

  useEffect(() => {
    if (writeError) {
      setTimeout(() => setStatus('error'), 0);
      setTimeout(() => {
        setStatus('idle');
        resetWrite();
      }, 3000);
    }
  }, [writeError, resetWrite]);

  const handleTip = async () => {
    if (!isConnected) return alert('Please connect your wallet');
    if (!creator) return;
    if (!userAddress) return alert('Please connect your wallet');

    if (userAddress?.toLowerCase() === creator.wallet_address.toLowerCase()) {
      return alert("You can't tip yourself!");
    }

    if (!creator.is_creator) {
      return alert('This profile has not enabled creator mode yet.');
    }

    try {
      const tipAmount = parseEther(amount);

      if (!allowance || BigInt(allowance.toString()) < tipAmount) {
        setStatus('approving');
        const approveHash = await writeContractAsync({
          address: MUSD_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESS as `0x${string}`, tipAmount],
        });
        await waitForTransactionReceipt(config, { hash: approveHash });
        await refetchAllowance();
      }

      setStatus('tipping');
      const tipHash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TIPPING_ABI,
        functionName: 'tip',
        args: [creator.wallet_address as `0x${string}`, tipAmount],
      });
      await waitForTransactionReceipt(config, { hash: tipHash });

      const addr = creator.wallet_address.toLowerCase();
      const supporterAddress = userAddress.toLowerCase();
      await supabase.from('tips').insert({
        from_address: supporterAddress,
        to_address: addr,
        amount: parseFloat(amount),
        tx_hash: tipHash,
        message: message
      });

      await supabase.rpc('increment_creator_earned', {
        creator_address: addr,
        amount_to_add: parseFloat(amount)
      });

      // Create tip notification via API
      try {
        // Fetch sender's name for a better notification
        const { data: senderProfile } = await supabase
          .from('user_profiles')
          .select('display_name, username')
          .eq('wallet_address', supporterAddress)
          .single();

        const senderName = senderProfile?.display_name || (senderProfile?.username ? `@${senderProfile.username}` : `${supporterAddress.slice(0, 6)}...${supporterAddress.slice(-4)}`);

        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: addr,
            action: 'create',
            type: 'tip',
            content: `You received a ${amount} MUSD tip from ${senderName}! 💝`,
          })
        });
      } catch (err) {
        console.error('Failed to create notification:', err);
      }

      setStatus('success');
      setShowTipCelebration(true);
      fetchData();
      refetchBalance();
      setMessage('');
      setTimeout(() => {
        setStatus('idle');
        resetWrite();
      }, 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (!creator) return <div className="p-20 text-center text-slate-500 font-outfit animate-pulse">Loading Premium Profile...</div>;

  return (
    <div className="w-full px-[5%] md:px-[8%] py-12 pt-32">
      <Link href="/discover" className="inline-flex items-center gap-2 text-[#F7931A] hover:text-[#FFAB40] mb-8 font-bold transition-all group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Discover
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F7931A]/10 blur-[100px] rounded-full -mr-32 -mt-32" />

            {creator.is_creator && (
              <button
                onClick={() => setIsSubModalOpen(true)}
                className="hidden md:flex absolute top-10 right-10 z-20 group/sub items-center gap-2 bg-[#F7931A]/10 border border-[#F7931A]/30 hover:bg-[#F7931A]/20 px-6 py-3 rounded-2xl text-base font-black text-[#F7931A] transition-all backdrop-blur-md overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#F7931A]/20 to-transparent opacity-0 group-hover/sub:opacity-100 transition-opacity" />
                <Zap className="w-5 h-5 text-[#F7931A]" />
                Subscriptions
              </button>
            )}

            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <Image
                src={creator.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.display_name)}&background=random`}
                alt={creator.display_name}
                width={160}
                height={160}
                className="w-40 h-40 rounded-[2.5rem] border-4 border-[#F7931A]/20 bg-[#1a1a1a] shadow-2xl object-cover"
                unoptimized
              />
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-5xl font-black text-white font-outfit tracking-tighter uppercase">{creator.display_name}</h1>
                  {creator.is_creator && (
                    <span className="bg-[#F7931A]/20 text-[#F7931A] text-xs font-bold px-3 py-1 rounded-full border border-[#F7931A]/30">Creator</span>
                  )}
                </div>
                <p className="text-[#F7931A] font-bold text-sm mb-6 uppercase tracking-widest">
                  @{creator.username}{creator.is_creator && creator.creator_category ? ` / ${creator.creator_category.replace(/^(CREATOR\s*\/\s*|CATEGORY\s*\/\s*)/i, '')}` : ''}
                </p>
                <p className="text-slate-400 text-xl leading-relaxed max-w-xl italic font-medium">
                  &quot;{creator.creator_description || creator.bio || 'This wallet profile is getting warmed up.'}&quot;
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {creator.social_links?.twitter && (
                    <a href={`https://x.com/${creator.social_links.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" className="group/social flex items-center gap-2 bg-white/5 border border-white/5 hover:border-[#F7931A]/50 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all backdrop-blur-md relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#F7931A]/10 to-transparent opacity-0 group-hover/social:opacity-100 transition-opacity" />
                      <svg className="w-4 h-4 text-[#F7931A]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                      X
                    </a>
                  )}
                  {creator.social_links?.discord && (
                    <div className="group/social flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all backdrop-blur-md relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#5865F2]/10 to-transparent opacity-0 group-hover/social:opacity-100 transition-opacity" />
                      <svg className="w-4 h-4 text-[#F7931A]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                      Discord
                    </div>
                  )}
                  {creator.social_links?.website && (
                    <a
                      href={creator.social_links.website}
                      target="_blank"
                      rel="noreferrer"
                      className="group/social flex items-center gap-2 bg-white/5 border border-white/5 hover:border-[#F7931A]/50 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all backdrop-blur-md relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover/social:opacity-100 transition-opacity" />
                      <Globe2 className="w-4 h-4 text-[#F7931A]" />
                      Website
                    </a>
                  )}


                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="group/social flex items-center gap-2 bg-white/5 border border-white/5 hover:border-[#F7931A]/50 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all backdrop-blur-md relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#F7931A]/10 to-transparent opacity-0 group-hover/social:opacity-100 transition-opacity" />
                    <Share2 className="w-4 h-4 text-[#F7931A]" />
                    Share
                  </button>

                  {creator.is_creator && (
                    <button
                      onClick={() => setIsSubModalOpen(true)}
                      className="md:hidden group/social flex items-center gap-2 bg-[#F7931A]/10 border border-[#F7931A]/30 hover:bg-[#F7931A]/20 px-4 py-2.5 rounded-xl text-sm font-black text-[#F7931A] transition-all backdrop-blur-md relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#F7931A]/10 to-transparent opacity-0 group-hover/social:opacity-100 transition-opacity" />
                      <Zap className="w-4 h-4 text-[#F7931A]" />
                      Subscriptions
                    </button>
                  )}

                  {isConnected && userAddress?.toLowerCase() === creator.wallet_address.toLowerCase() && (
                    <Link
                      href="/dashboard"
                      className="group/social flex items-center gap-2 bg-[#F7931A]/20 border border-[#F7931A]/30 hover:bg-[#F7931A]/30 px-4 py-2.5 rounded-xl text-sm font-black text-[#F7931A] transition-all backdrop-blur-md relative overflow-hidden"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-12 pt-12 border-t border-white/5">
              <div className="text-center p-6 bg-white/5 rounded-3xl border border-white/5 group-hover:border-[#F7931A]/30 transition-all">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Earned (All-time)</p>
                <p className="text-4xl font-black text-white font-outfit tracking-tighter flex items-center justify-center gap-2">{creator.total_earned || 0} <MUSDLogo className="w-6 h-6 inline" /></p>
              </div>
              <div className="text-center p-6 bg-white/5 rounded-3xl border border-white/5 group-hover:border-[#F7931A]/30 transition-all">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">On-chain Balance</p>
                <p className="text-4xl font-black text-[#F7931A] font-outfit tracking-tighter flex items-center justify-center gap-2">
                  {contractBalance ? (Number(contractBalance) / 1e18).toFixed(1) : '0.0'} <MUSDLogo className="w-6 h-6 inline" />
                </p>
              </div>
            </div>
          </div>

          {creator.is_creator && (
            <div className="glass-card p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#F7931A]/5 blur-3xl rounded-full -ml-16 -mt-16" />
              <h2 className="text-3xl font-black text-white mb-8 font-outfit uppercase tracking-tighter">Send a <span className="text-[#F7931A]">Tip</span></h2>
              <div className="space-y-8 relative z-10">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><MUSDLogo className="w-4 h-4" /> Select Amount (MUSD)</label>
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    {['1', '5', '10', '50'].map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmount(val)}
                        className={`py-4 rounded-2xl font-black text-xl transition-all ${amount === val
                          ? 'bg-[#F7931A] text-white shadow-xl shadow-orange-500/20'
                          : 'bg-white/5 text-slate-400 border border-white/5 hover:border-[#F7931A]/50'
                          }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">Your Message (Optional)</label>
                  <textarea
                    placeholder="Leave a nice message for the creator..."
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none transition-all resize-none"
                  />
                </div>
                <button
                  onClick={handleTip}
                  disabled={status === 'approving' || status === 'tipping'}
                  className="w-full btn-primary py-6 flex items-center justify-center gap-3 text-2xl font-black font-outfit uppercase tracking-tighter"
                >
                  {status === 'approving' || status === 'tipping' ? (
                    <Clock className="w-6 h-6 animate-spin" />
                  ) : (
                    <Heart className="w-6 h-6 fill-current" />
                  )}
                  {status === 'approving' ? 'Confirming Approval...' :
                    status === 'tipping' ? 'Sending Tip...' : 'Send Tip Instantly'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="glass-card p-8">
            <h3 className="text-xl font-black text-white mb-6 font-outfit uppercase tracking-tighter flex items-center gap-2">
              <History className="w-5 h-5 text-[#F7931A]" />
              Recent Tips
            </h3>
            <div className="space-y-4">
              {recentTips.length > 0 ? recentTips.map((tip) => (
                <div key={tip.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-[#F7931A]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F7931A]/20 border border-white/5">
                      {tip.sender?.avatar_url ? (
                        <Image src={tip.sender.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-[#F7931A] text-xs">
                          {tip.sender?.display_name?.slice(0, 2).toUpperCase() || tip.from_address.slice(2, 4).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{tip.sender?.display_name || (tip.sender?.username ? `@${tip.sender.username}` : `${tip.from_address.slice(0, 6)}...`)}</p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase">{new Date(tip.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="font-black text-[#F7931A] flex items-center gap-1">+{tip.amount} <MUSDLogo className="w-4 h-4" /></p>
                </div>
              )) : (
                <div className="text-center py-12">
                  <Clock className="w-8 h-8 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500 text-sm font-medium">No tips received yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={`http://localhost:3000/profile/${creator.username || creator.wallet_address}`}
        title={`👋 Check out my profile on TipHive! If you enjoy my work, \n\nyou can now support me by tipping via MUSD on the Mezo Network. Every bit helps! 🚀💎`}
      />

      <AnimatePresence>
        {isSubModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 p-4 backdrop-blur-2xl"
            onClick={() => setIsSubModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card max-w-4xl w-full p-1 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-4xl font-black text-white font-outfit uppercase tracking-tighter">Support <span className="text-[#F7931A]">{creator.display_name}</span></h3>
                    <p className="text-slate-500 font-medium mt-1">Unlock exclusive content and join the inner circle.</p>
                  </div>
                  <button
                    onClick={() => setIsSubModalOpen(false)}
                    className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="w-6 h-6 rotate-90 md:rotate-0" />
                  </button>
                </div>

                <SubscriptionSection
                  creatorAddress={creator.wallet_address}
                  creatorName={creator.display_name}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTipCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xl"
            onClick={() => setShowTipCelebration(false)}
          >
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(18)].map((_, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.4],
                    x: Math.cos(index) * 260,
                    y: Math.sin(index * 1.7) * 220,
                  }}
                  transition={{ duration: 1.8, delay: index * 0.03 }}
                  className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-[#F7931A] shadow-[0_0_22px_rgba(247,147,26,0.9)]"
                />
              ))}
            </div>
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card relative max-w-lg p-10 text-center"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F7931A] shadow-2xl shadow-orange-500/40">
                <Heart className="h-10 w-10 fill-white text-white" />
              </div>
              <h3 className="font-outfit text-4xl font-black uppercase tracking-tighter text-white">Tip Sent</h3>
              <p className="mt-3 text-slate-400">
                You tipped <span className="font-black text-[#F7931A]">@{creator.username}</span> with {amount} MUSDC.
              </p>
              <button className="btn-primary mt-8 w-full" onClick={() => setShowTipCelebration(false)}>
                Nice
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
