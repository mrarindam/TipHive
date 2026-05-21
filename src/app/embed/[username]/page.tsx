'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, Check, Sparkles, Loader2 } from 'lucide-react';
import { useAccount, useWriteContract, useReadContract, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { parseEther } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import CelebrationModal from '@/components/ui/CelebrationModal';
import { useSearchParams } from 'next/navigation';
import { useNetworkConfig } from '@/lib/hooks/useNetworkConfig';
import { TIPPING_ABI, ERC20_ABI } from '@/lib/contracts';

interface CreatorProfile {
  username: string;
  wallet_address: string;
  theme_color: string;
  bio: string;
  suggested_amounts: string[];
  thank_you_message: string;
}

export default function EmbedPage({ params: paramsPromise }: { params: Promise<{ username: string }> }) {
  const params = use(paramsPromise);
  const { username } = params;
  const searchParams = useSearchParams();
  const { contracts, chainId } = useNetworkConfig();
  
  const overrideTitle = searchParams.get('title');
  const overrideDesc = searchParams.get('desc');
  const overrideColor = searchParams.get('color');

  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('10');
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [tipStatus, setTipStatus] = useState<'idle' | 'approving' | 'tipping' | 'success' | 'error'>('idle');
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastTipAmount, setLastTipAmount] = useState('0');

  const { isConnected, address: userAddress } = useAccount();
  const config = useConfig();
  const { writeContractAsync } = useWriteContract();
  
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: contracts.MUSD,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [userAddress as `0x${string}`, contracts.TIPPING],
  });

  useEffect(() => {
    async function fetchCreator() {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      setCreator(data);
      setLoading(false);
    }
    fetchCreator();
  }, [username]);

  const handleTip = async () => {
    if (!isConnected || !userAddress) return;
    if (!creator) return;

    if (userAddress.toLowerCase() === creator.wallet_address.toLowerCase()) {
      return alert("Creators can't tip themselves! 🛡️");
    }

    const val = customAmount || amount;
    const finalAmount = String(val || '0');
    
    if (!finalAmount || isNaN(Number(finalAmount)) || Number(finalAmount) <= 0) return alert('Enter a valid amount');

    try {
      const tipAmount = parseEther(finalAmount);
      if (!allowance || BigInt(allowance.toString()) < tipAmount) {
        setTipStatus('approving');
        const approveHash = await writeContractAsync({
          address: contracts.MUSD,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [contracts.TIPPING, tipAmount],
        });
        await waitForTransactionReceipt(config, { hash: approveHash });
        await refetchAllowance();
      }

      setTipStatus('tipping');
      const tipHash = await writeContractAsync({
        address: contracts.TIPPING,
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
        message: message,
        chain_id: chainId
      });

      await supabase.rpc('increment_creator_earned', {
        creator_address: creator.wallet_address.toLowerCase(),
        amount_to_add: parseFloat(finalAmount)
      });

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px] text-[#f7931a]">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );

  if (!creator) return (
    <div className="p-8 text-center text-slate-500">
      Creator not found.
    </div>
  );

  const brandColor = overrideColor ? `#${overrideColor}` : (creator.theme_color || '#f7931a');
  const displayTitle = overrideTitle || 'Support with Tip';
  const displayDesc = overrideDesc || (creator.bio as string);

  return (
    <div className="bg-transparent font-outfit min-h-screen flex flex-col items-center">
      <div className="w-full max-w-md bg-[#111116] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl mt-4">
        <div className="p-5 md:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Heart className="w-4 h-4 text-red-500" />
               <h3 className="text-sm font-black uppercase tracking-widest text-white/70">Widget</h3>
            </div>
            {!isConnected && <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button onClick={openConnectModal} className="text-[10px] font-black uppercase tracking-widest text-[#f7931a] hover:text-white transition-colors">Connect Wallet</button>
              )}
            </ConnectButton.Custom>}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
               <h4 className="text-xl font-black text-white">{displayTitle}</h4>
               <p className="text-xs text-slate-500 font-medium leading-relaxed">{displayDesc}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(creator.suggested_amounts || ['5', '10', '15']).map((val: string) => (
                <button 
                  key={val} 
                  onClick={() => { setAmount(val); setCustomAmount(''); }} 
                  className={`py-3 rounded-xl font-black transition-all text-xs border ${amount === val && !customAmount ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                  style={amount === val && !customAmount ? { backgroundColor: brandColor, color: '#000', borderColor: brandColor } : {}}
                >
                  ${val}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
                <span className="text-slate-400 font-black mr-2 text-sm">$</span>
                <input 
                  type="number" 
                  placeholder="Custom amount" 
                  value={customAmount} 
                  onChange={e => setCustomAmount(e.target.value)} 
                  className="w-full bg-transparent border-none py-2 text-white outline-none text-sm font-black placeholder:text-slate-600" 
                />
              </div>

              <textarea 
                placeholder="Leave a message..." 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none resize-none h-24 text-xs font-medium placeholder:text-slate-600 transition-all focus:border-white/20" 
              />
            </div>

            <button 
              onClick={handleTip} 
              disabled={!isConnected || tipStatus === 'approving' || tipStatus === 'tipping'} 
              style={{ backgroundColor: isConnected ? brandColor : '#333' }}
              className="w-full text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isConnected ? 'Connect Wallet to Tip' :
               tipStatus === 'approving' ? 'Confirming Approval...' :
               tipStatus === 'tipping' ? 'Sending Tip...' : 
               tipStatus === 'success' ? <span className="flex items-center gap-2"><Check size={16} /> Tip Sent!</span> :
               `Send Support ⚡`}
            </button>

            <div className="text-center pb-2">
               <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] flex items-center justify-center gap-1">
                 Powered by <Sparkles size={8} /> TipHive
               </span>
            </div>
          </div>
        </div>
      </div>


      <CelebrationModal 
        isOpen={showCelebration} 
        onClose={() => {
          setShowCelebration(false);
          setTipStatus('idle');
        }}
        type="tip"
        amount={lastTipAmount}
        message={creator.thank_you_message}
      />
    </div>
  );
}
