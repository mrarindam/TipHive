'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { useAccount, useWriteContract, useReadContract, useConfig } from 'wagmi';
import { useWalletAuth } from '@/lib/wallet-auth-shim';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { parseEther } from 'viem';
import { supabase } from '@/lib/supabase';
import { invalidateCreatorCache } from '@/lib/cache-invalidate';
import { useNetworkConfig } from '@/lib/hooks/useNetworkConfig';
import { TIPPING_ABI, ERC20_ABI } from '@/lib/contracts';
import CelebrationModal from '@/components/ui/CelebrationModal';

interface TipModalCreator {
  wallet_address: string;
  display_name?: string;
  username?: string;
  suggested_amounts?: string[];
  button_text?: string;
}

export default function TipModal({
  isOpen,
  onClose,
  creator,
}: {
  isOpen: boolean;
  onClose: () => void;
  creator: TipModalCreator;
}) {
  const { contracts, chainId } = useNetworkConfig();
  const { isConnected, address: userAddress } = useAccount();
  const { authenticated, login, getAccessToken } = useWalletAuth();
  const config = useConfig();

  const [amount, setAmount] = useState(creator.suggested_amounts?.[0] || '5');
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [tipStatus, setTipStatus] = useState<'idle' | 'approving' | 'tipping' | 'success' | 'error'>('idle');
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastTipAmount, setLastTipAmount] = useState('0');

  const { writeContractAsync } = useWriteContract();
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: contracts.MUSD,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [userAddress as `0x${string}`, contracts.TIPPING],
  });

  const handleTip = async () => {
    if (!authenticated) {
      login();
      return;
    }
    if (!isConnected || !userAddress) return alert('Please link a wallet to send tips');
    if (!creator?.wallet_address) return;

    if (userAddress.toLowerCase() === creator.wallet_address.toLowerCase()) {
      alert("Creators can't tip themselves! 🛡️");
      return;
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
        chain_id: chainId,
      });

      await supabase.rpc('increment_creator_earned', {
        creator_address: creator.wallet_address.toLowerCase(),
        amount_to_add: parseFloat(finalAmount),
      });

      await invalidateCreatorCache(creator.wallet_address, userAddress);

      try {
        const { data: senderProfile } = await supabase
          .from('user_profiles')
          .select('display_name, username')
          .eq('wallet_address', userAddress.toLowerCase())
          .single();

        const identifier = senderProfile?.username || `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAccessToken()}`,
          },
          body: JSON.stringify({
            wallet: creator.wallet_address.toLowerCase(),
            action: 'create',
            type: 'tip',
            content: `You received a ${finalAmount} MUSD tip from ${identifier}! 💝`,
          }),
        });
      } catch (nErr) {
        console.error('Failed to send tip notification:', nErr);
      }

      setTipStatus('success');
      setLastTipAmount(finalAmount);
      setShowCelebration(true);
      setCustomAmount('');
      setMessage('');
      window.dispatchEvent(new CustomEvent('tip-success', { detail: { creator: creator.wallet_address.toLowerCase() } }));
      onClose();
    } catch (err) {
      console.error(err);
      setTipStatus('error');
      setTimeout(() => setTipStatus('idle'), 3000);
    }
  };

  const suggested = creator.suggested_amounts?.length ? creator.suggested_amounts : ['5', '25', '50'];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-gradient-to-b from-[#0a0a0c] to-[#111113] border border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#F7931A]/10 blur-[60px] rounded-full pointer-events-none" />

              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10">
                <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 font-outfit text-white/70">
                  <Heart className="w-4 h-4 text-red-500" /> Support with Tip
                </h3>

                <div className="space-y-6">
                  <div className={`grid gap-3 ${suggested.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                    {suggested.slice(0, 4).map((val: string) => (
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
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-[#F7931A] outline-none resize-none h-28 text-sm font-medium placeholder:text-slate-600 transition-all"
                    />
                  </div>

                  <button
                    onClick={handleTip}
                    disabled={tipStatus === 'approving' || tipStatus === 'tipping'}
                    className="w-full bg-[#8A2BE2] text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-[#731cb3] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md hover:shadow-lg text-xs uppercase tracking-[0.2em] disabled:opacity-60"
                  >
                    {tipStatus === 'approving' ? 'Confirming Approval...' :
                      tipStatus === 'tipping' ? 'Sending Tip...' : `${creator.button_text || 'Tip'}`}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => { setShowCelebration(false); setTipStatus('idle'); }}
        amount={lastTipAmount}
        creatorName={creator.display_name || creator.username || 'Creator'}
      />
    </>
  );
}
