'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, Clock, CheckCircle2, AlertCircle, ArrowLeft, History, Share2, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import ShareModal from '@/components/ui/ShareModal';
import MUSDLogo from '@/components/ui/MUSDLogo';

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

interface Creator {
  address: string;
  username: string;
  name: string;
  bio: string;
  avatar_url: string;
  category: string;
  total_earned: number;
}

interface Tip {
  id: string;
  from_address: string;
  amount: number;
  message?: string;
  created_at: string;
}

export default function CreatorProfile() {
  const { address } = useParams();
  const { isConnected, address: userAddress } = useAccount();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [recentTips, setRecentTips] = useState<Tip[]>([]);
  const [amount, setAmount] = useState('5');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'approving' | 'tipping' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { writeContract, data: hash, error: writeError, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

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
    args: [creator?.address as `0x${string}`],
  });

  const fetchData = useCallback(async () => {
    if (!address) return;
    const id = (address as string).toLowerCase();
    
    // Check if it's a wallet address (starts with 0x)
    const isAddress = id.startsWith('0x');

    const { data: creatorData } = await supabase
      .from('creators')
      .select('*')
      .or(`address.eq.${id}${!isAddress ? `,username.eq.${id}` : ''}`)
      .single();

    if (creatorData) {
      setCreator(creatorData as Creator);
      
      const { data: tipsData } = await supabase
        .from('tips')
        .select('*')
        .eq('to_address', creatorData.address)
        .order('created_at', { ascending: false })
        .limit(5);

      if (tipsData) setRecentTips(tipsData);
    }
  }, [address]);

  useEffect(() => {
    setTimeout(() => fetchData(), 0);
  }, [fetchData]);

  useEffect(() => {
    if (writeError) {
      // Small delay to avoid synchronous state update in effect
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
    
    if (userAddress?.toLowerCase() === creator.address.toLowerCase()) {
      return alert("You can't tip yourself!");
    }

    try {
      const tipAmount = parseEther(amount);

      if (!allowance || BigInt(allowance.toString()) < tipAmount) {
        setStatus('approving');
        writeContract({
          address: MUSD_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESS as `0x${string}`, tipAmount],
        });
        return;
      }

      setStatus('tipping');
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: TIPPING_ABI,
        functionName: 'tip',
        args: [creator.address as `0x${string}`, tipAmount],
      });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (isConfirmed && userAddress && address && hash && status === 'tipping') {
      const recordTip = async () => {
        if (!creator) return;
        setStatus('success');
        const addr = creator.address.toLowerCase();
        await supabase.from('tips').insert({
          from_address: userAddress.toLowerCase(),
          to_address: addr,
          amount: parseFloat(amount),
          tx_hash: hash,
          message: message
        });

        await supabase.rpc('increment_creator_earned', {
          creator_address: addr,
          amount_to_add: parseFloat(amount)
        });

        // Refresh all data
        fetchData();
        refetchBalance();
        
        // Clear inputs after success
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
          resetWrite();
        }, 5000);
      };
      recordTip();
    } else if (isConfirmed && status === 'approving') {
      refetchAllowance();
      // Use a small delay to avoid cascading render error in lint
      setTimeout(() => setStatus('idle'), 0);
    }
  }, [isConfirmed, hash, userAddress, creator, amount, status, refetchAllowance, refetchBalance, fetchData, message, resetWrite, address]);

  if (!creator) return <div className="p-20 text-center text-slate-500 font-outfit animate-pulse">Loading Premium Profile...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link href="/discover" className="inline-flex items-center gap-2 text-[#F7931A] hover:text-[#FFAB40] mb-8 font-bold transition-all group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Discover
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Profile Card */}
          <div className="glass-card p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F7931A]/10 blur-[100px] rounded-full -mr-32 -mt-32" />

            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <Image
                src={creator.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=random`}
                alt={creator.name}
                width={160}
                height={160}
                className="w-40 h-40 rounded-[2.5rem] border-4 border-[#F7931A]/20 bg-[#1a1a1a] shadow-2xl object-cover"
                unoptimized
              />
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-5xl font-black text-white font-outfit tracking-tighter uppercase">{creator.name}</h1>
                  <span className="bg-[#F7931A]/20 text-[#F7931A] text-xs font-bold px-3 py-1 rounded-full border border-[#F7931A]/30">Top Creator</span>
                </div>
                <p className="text-[#F7931A] font-bold text-sm mb-6 uppercase tracking-widest">{creator.category}</p>
                <p className="text-slate-400 text-xl leading-relaxed max-w-xl italic font-medium">
                  &quot;{creator.bio}&quot;
                </p>
                
                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => {
                      const link = `http://localhost:3000/profile/${creator.username || creator.address}`;
                      navigator.clipboard.writeText(link);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-[#F7931A]/50 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[#F7931A]" />}
                    {copied ? 'Link Copied!' : 'Copy Profile Link'}
                  </button>
                  
                  <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-[#F7931A]/50 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
                  >
                    <Share2 className="w-4 h-4 text-[#F7931A]" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-12 pt-12 border-t border-white/5">
              <div className="text-center p-6 bg-white/5 rounded-3xl border border-white/10 group-hover:border-[#F7931A]/30 transition-all">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Earned (All-time)</p>
                <p className="text-4xl font-black text-white font-outfit tracking-tighter flex items-center justify-center gap-2">{creator.total_earned || 0} <MUSDLogo className="w-6 h-6 inline" /></p>
              </div>
              <div className="text-center p-6 bg-white/5 rounded-3xl border border-white/10 group-hover:border-[#F7931A]/30 transition-all">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">On-chain Balance</p>
                <p className="text-4xl font-black text-[#F7931A] font-outfit tracking-tighter flex items-center justify-center gap-2">
                  {contractBalance ? (Number(contractBalance) / 1e18).toFixed(1) : '0.0'} <MUSDLogo className="w-6 h-6 inline" />
                </p>
              </div>
            </div>
          </div>

          {/* Tipping Section */}
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
                        : 'bg-white/5 text-slate-400 border border-white/10 hover:border-[#F7931A]/50'
                        }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>

                <div className="relative pt-4">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">
                    <span>Custom</span>
                    <span className="text-[#F7931A] text-xl font-black flex items-center gap-1">{amount} <MUSDLogo className="w-5 h-5" /></span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-3 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#F7931A] border border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">Your Message (Optional)</label>
                <textarea
                  placeholder="Leave a nice message for the creator..."
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none transition-all resize-none"
                />
              </div>

              <button
                onClick={handleTip}
                disabled={status === 'approving' || status === 'tipping' || isConfirming}
                className="w-full btn-primary py-6 flex items-center justify-center gap-3 text-2xl font-black font-outfit uppercase tracking-tighter"
              >
                {status === 'approving' || status === 'tipping' || isConfirming ? (
                  <Clock className="w-6 h-6 animate-spin" />
                ) : (
                  <Heart className="w-6 h-6 fill-current" />
                )}
                {status === 'approving' ? 'Confirming Approval...' :
                  isConfirming ? 'Confirming Tip...' : 'Send Tip Instantly'}
              </button>

              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 text-green-400 bg-green-500/10 p-5 rounded-2xl border border-green-500/20 justify-center font-bold"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6" />
                      Awesome! Your tip has been sent to {creator.name}.
                    </div>
                    {hash && (
                      <a 
                        href={`https://testnet.mezoscan.io/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline hover:text-white transition-colors"
                      >
                        View Transaction on MezoScan
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Recent Tips Sidebar */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-black text-white mb-6 font-outfit uppercase tracking-tighter flex items-center gap-2">
              <History className="w-5 h-5 text-[#F7931A]" />
              Recent Tips
            </h3>
            <div className="space-y-4">
              {recentTips.length > 0 ? recentTips.map((tip) => (
                <div key={tip.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:border-[#F7931A]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F7931A]/20 flex items-center justify-center font-bold text-[#F7931A]">
                      {tip.from_address.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-mono text-slate-500">{tip.from_address.slice(0, 6)}...{tip.from_address.slice(-4)}</p>
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

          <div className="glass-card p-8 bg-gradient-to-br from-[#F7931A]/10 to-transparent border-[#F7931A]/20">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-[#F7931A]" />
              <h4 className="font-bold text-white uppercase tracking-widest text-xs">How it works</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              TIPHIVE uses the Mezo Bitcoin Layer-2 network. All tips are powered by MUSD, a stablecoin backed by Bitcoin. Your support goes directly to the creator&apos;s secure vault on-chain.
            </p>
          </div>
        </div>
      </div>

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={`http://localhost:3000/profile/${creator.username || creator.address}`}
        title={`👋 Check out my profile on TipHive! If you enjoy my work, \n\nyou can now support me by tipping via MUSD on the Mezo Network. Every bit helps! 🚀💎`}
      />
    </div>
  );
}
