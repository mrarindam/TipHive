'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Hash, ArrowLeft, Coins, CheckCircle2, X as CloseIcon } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAccount, useWriteContract, useConfig } from 'wagmi';
import { useWalletAuth } from '@/lib/wallet-auth-shim';
import { parseEther } from 'viem';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { supabase } from '@/lib/supabase';
import { useNetworkConfig } from '@/lib/hooks/useNetworkConfig';
import { TIPPING_ABI, ERC20_ABI } from '@/lib/contracts';

export interface Message {
  id: string;
  sender_wallet_address: string;
  receiver_wallet_address: string;
  text: string;
  created_at: string;
  is_read: boolean;
}

export default function ChatWindow({ 
  messages, 
  currentUserId, 
  otherUser, 
  onSendMessage,
  onBack,
  onLoadMore,
  hasMore,
  isLoadingMore
}: { 
  messages: Message[], 
  currentUserId: string, 
  otherUser: { username: string, display_name: string, avatar_url: string, wallet_address?: string } | null,
  onSendMessage: (text: string) => void,
  onBack?: () => void,
  onLoadMore?: () => void,
  hasMore?: boolean,
  isLoadingMore?: boolean
}) {
  const [inputText, setInputText] = useState('');
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState('5');
  const [tipStatus, setTipStatus] = useState<'idle' | 'approving' | 'tipping' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);

  const { address: userAddress, isConnected } = useAccount();
  const { authenticated, login, getAccessToken } = useWalletAuth();
  const { writeContractAsync } = useWriteContract();
  const config = useConfig();
  const { contracts, chainId, explorerUrl } = useNetworkConfig();



  // Reset scroll state when switching users
  useEffect(() => {
    setPrevScrollHeight(0);
  }, [otherUser?.username]);

  // Handle scroll position preservation when loading more
  useEffect(() => {
    if (containerRef.current && prevScrollHeight > 0 && !isLoadingMore) {
      const newScrollHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
      setPrevScrollHeight(0);
    }
  }, [messages, isLoadingMore, prevScrollHeight]);

  const handleScroll = () => {
    if (containerRef.current && hasMore && !isLoadingMore) {
      // In flex-col-reverse, scrollTop is 0 at the bottom and negative as you scroll up
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtTop = Math.abs(scrollTop) + clientHeight >= scrollHeight - 10;
      
      if (isAtTop) {
        setPrevScrollHeight(scrollHeight);
        onLoadMore?.();
      }
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
    // In flex-col-reverse, 0 is the bottom
    setTimeout(() => {
      if (containerRef.current) containerRef.current.scrollTop = 0;
    }, 100);
  };

  const handleTip = async () => {
    if (!authenticated) return login();
    if (!isConnected || !userAddress) return alert('Please link a wallet to send tips');
    if (!otherUser?.wallet_address) return alert('Recipient has no wallet linked');

    if (userAddress.toLowerCase() === otherUser.wallet_address.toLowerCase()) {
      return alert("You can't tip yourself! 🛡️");
    }

    try {
      const amountParsed = parseEther(tipAmount);
      
      setTipStatus('approving');
      const approveHash = await writeContractAsync({
        address: contracts.MUSD,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contracts.TIPPING, amountParsed],
      });
      await waitForTransactionReceipt(config, { hash: approveHash });

      setTipStatus('tipping');
      const hash = await writeContractAsync({
        address: contracts.TIPPING,
        abi: TIPPING_ABI,
        functionName: 'tip',
        args: [otherUser.wallet_address as `0x${string}`, amountParsed],
      });
      setTxHash(hash);
      await waitForTransactionReceipt(config, { hash });

      // Record in DB
      await supabase.from('tips').insert({
        from_address: userAddress.toLowerCase(),
        to_address: otherUser.wallet_address.toLowerCase(),
        amount: parseFloat(tipAmount),
        tx_hash: hash,
        message: 'Tip from Inbox',
        chain_id: chainId
      });

      // Notify
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAccessToken()}`
        },
        body: JSON.stringify({
          wallet: otherUser.wallet_address.toLowerCase(),
          action: 'create',
          type: 'tip',
          content: `You received a ${tipAmount} MUSD tip from a fan in your Inbox! 💝`
        })
      });

      setTipStatus('success');
      setTimeout(() => {
        setIsTipModalOpen(false);
        setTipStatus('idle');
      }, 3000);
    } catch (err) {
      console.error(err);
      setTipStatus('error');
      setTimeout(() => setTipStatus('idle'), 3000);
    }
  };

  if (!otherUser) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#050507]">
        {onBack && (
          <button onClick={onBack} className="md:hidden absolute top-6 left-6 p-3 bg-white/5 rounded-2xl text-slate-400">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="w-24 h-24 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8">
          <Hash className="w-10 h-10 text-slate-700" />
        </div>
        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Your Inbox</h3>
        <p className="text-slate-500 max-w-xs mx-auto">Select a conversation from the sidebar or search for a user to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#050507] overflow-hidden">
      {/* Header - Fixed Height */}
      <div className="flex-none p-6 border-b border-white/5 flex items-center gap-4 backdrop-blur-md bg-black/20 z-10">
        {onBack && (
          <button onClick={onBack} className="md:hidden p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
        )}
        <Link href={`/${otherUser.username}`} className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group-hover:scale-105 transition-transform">
            <Image src={otherUser.avatar_url} alt={otherUser.username} width={48} height={48} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-bold text-white leading-none mb-1 group-hover:text-[#f7931a] transition-colors">{otherUser.display_name}</h4>
            <p className="text-xs text-slate-500 font-medium">@{otherUser.username}</p>
          </div>
        </Link>
      </div>

      {/* Messages - Scrollable area */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col-reverse min-h-0 overscroll-contain touch-pan-y"
      >
        <div ref={messagesEndRef} />
        
        {/* Use a temporary reversed array for mapping in flex-col-reverse */}
        {([...messages].reverse() as Message[]).map((msg, idx, revArray) => {
          const isMe = msg.sender_wallet_address === currentUserId;
          const showAvatar = idx === 0 || revArray[idx-1].sender_wallet_address !== msg.sender_wallet_address;

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-3`}
            >
              {!isMe && (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0 mb-1 opacity-60">
                  {showAvatar ? (
                    <Image src={otherUser.avatar_url} alt={otherUser.username} width={32} height={32} className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full bg-transparent" />}
                </div>
              )}
              
              <div className={`max-w-[70%] px-5 py-3 rounded-3xl text-sm leading-relaxed shadow-lg ${
                isMe 
                  ? 'bg-[#f7931a] text-black font-medium rounded-br-none' 
                  : 'bg-white/[0.05] text-white border border-white/5 rounded-bl-none'
              }`}>
                {msg.text}
                <div className={`text-[9px] mt-1.5 opacity-50 ${isMe ? 'text-black' : 'text-slate-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          );
        })}

        {!hasMore && messages.length > 0 && (
          <div className="text-center py-4">
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Beginning of conversation</p>
          </div>
        )}

        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-6 h-6 border-2 border-[#f7931a] border-t-transparent rounded-full"
            />
          </div>
        )}
      </div>

      {/* Input - Fixed Height */}
      <div className="flex-none p-6 pt-2">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message @${otherUser.username}...`}
              className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] py-5 pl-8 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#f7931a]/50 focus:bg-white/[0.05] transition-all shadow-2xl"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#f7931a] rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
            >
              <Send size={16} />
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => setIsTipModalOpen(true)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              otherUser.wallet_address 
                ? 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                : 'bg-white/5 text-slate-700 cursor-not-allowed opacity-40 blur-[0.5px]'
            }`}
            title={otherUser.wallet_address ? "Send Tip" : "Recipient has no wallet"}
          >
            <Coins size={24} />
          </button>
        </form>
        <p className="text-[10px] text-slate-600 mt-4 text-center font-bold uppercase tracking-widest">
          Press Enter to send message
        </p>
      </div>

      {/* Tip Modal */}
      <AnimatePresence>
        {isTipModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setIsTipModalOpen(false)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
              >
                <CloseIcon size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 text-red-500">
                  <Coins size={32} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Send Tip to {otherUser.display_name}</h3>
                <p className="text-slate-500 text-xs mb-8">Support your favorite creator with an on-chain tip.</p>

                {tipStatus === 'success' ? (
                  <div className="space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                    <p className="text-emerald-500 font-bold">Tip Sent Successfully!</p>
                    <a href={`${explorerUrl}/tx/${txHash}`} target="_blank" className="text-[10px] text-slate-500 hover:text-[#f7931a] block truncate underline">View Transaction</a>
                  </div>
                ) : (
                  <div className="w-full space-y-6">
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                      <span className="text-slate-400 font-black text-xl">$</span>
                      <input 
                        type="number"
                        value={tipAmount}
                        onChange={(e) => setTipAmount(e.target.value)}
                        className="w-full bg-transparent border-none text-white text-2xl font-black outline-none"
                      />
                    </div>
                    
                    <button
                      onClick={handleTip}
                      disabled={tipStatus !== 'idle'}
                      className="w-full py-5 bg-red-500 text-white font-black rounded-3xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(239,68,68,0.3)] disabled:opacity-50"
                    >
                      {tipStatus === 'approving' ? 'Approving MUSD...' : 
                       tipStatus === 'tipping' ? 'Sending Tip...' : 
                       tipStatus === 'error' ? 'Error!' : 'Confirm Tip'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
