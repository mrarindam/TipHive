'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Clock, Loader2, X, CheckCircle2 } from 'lucide-react';
import { useAccount, useWriteContract, useReadContract, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { parseEther } from 'viem';
import { supabase } from '@/lib/supabase';
import { SUBSCRIPTION_ABI, SUBSCRIPTION_CONTRACT, MUSD_ADDRESS, ERC20_ABI } from '@/lib/contracts';
import MUSDLogo from '@/components/ui/MUSDLogo';
import CelebrationModal from '@/components/ui/CelebrationModal';

interface Plan {
  id: string;
  creator_address: string;
  name: string;
  price: number;
  duration: number; // in seconds
  description: string;
  perks: string[];
  active: boolean;
  chain_plan_id: number;
}

interface SubscriptionSectionProps {
  creatorAddress: string;
  creatorName: string;
  limit?: number;
  onSuccess?: () => void;
}

export default function SubscriptionSection({ creatorAddress, creatorName, limit, onSuccess }: SubscriptionSectionProps) {
  const { address: userAddress, isConnected } = useAccount();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'approving' | 'subscribing' | 'success' | 'error'>('idle');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [previewPlan, setPreviewPlan] = useState<Plan | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const config = useConfig();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const { writeContractAsync: approveWriteAsync } = useWriteContract();
  const { writeContractAsync: subscribeWriteAsync } = useWriteContract();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: MUSD_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [userAddress as `0x${string}`, SUBSCRIPTION_CONTRACT],
  });

  const { data: balance } = useReadContract({
    address: MUSD_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
  });

  useEffect(() => {
    async function fetchPlans() {
      setLoading(true);

      let query = supabase
        .from('subscription_plans')
        .select('*')
        .eq('creator_address', creatorAddress.toLowerCase())
        .eq('active', true)
        .order('duration', { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (!error && data) {
        setPlans(data as Plan[]);
      }
      setLoading(false);
    }

    if (creatorAddress) {
      fetchPlans();
    }
  }, [creatorAddress, limit]);

  const handleSubscribe = async (plan: Plan) => {
    if (!isConnected || !userAddress) {
      setNotification({ message: 'Please connect your wallet first! 🔌', type: 'error' });
      return;
    }
    if (userAddress.toLowerCase() === creatorAddress.toLowerCase()) {
      setNotification({ message: "Creators can't subscribe to themselves! 🛡️", type: 'error' });
      return;
    }

    // Check for existing active subscription
    try {
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id, end_date')
        .eq('fan_address', userAddress.toLowerCase())
        .eq('plan_id', plan.id)
        .eq('active', true)
        .maybeSingle();

      if (existingSub && new Date(existingSub.end_date) > new Date()) {
        setNotification({
          message: "You are already a member! One plan, one time you can buy. 🛡️",
          type: 'error'
        });
        return;
      }
    } catch (err) {
      console.error('Error checking existing sub:', err);
    }

    const amount = parseEther(plan.price.toString());

    // Balance check
    if (balance && BigInt(balance.toString()) < amount) {
      setNotification({ message: `Insufficient MUSD. This plan costs ${plan.price} MUSD. 💰`, type: 'error' });
      return;
    }

    setSelectedPlan(plan);
    setPreviewPlan(null);

    try {
      // 1. Check Allowance
      if (!allowance || BigInt(allowance.toString()) < amount) {
        setStatus('approving');
        const approveHash = await approveWriteAsync({
          address: MUSD_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [SUBSCRIPTION_CONTRACT, amount],
        });
        await waitForTransactionReceipt(config, { hash: approveHash });
        await refetchAllowance();
      }

      // 2. Already has allowance, go direct
      setStatus('subscribing');
      const subHash = await subscribeWriteAsync({
        address: SUBSCRIPTION_CONTRACT,
        abi: SUBSCRIPTION_ABI,
        functionName: 'subscribe',
        args: [BigInt(plan.chain_plan_id)],
      });
      await waitForTransactionReceipt(config, { hash: subHash });

      // 3. Record to Database
      setStatus('success');
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + (plan.duration * 1000));

      await supabase.from('subscriptions').insert({
        fan_address: userAddress.toLowerCase(),
        creator_address: creatorAddress.toLowerCase(),
        plan_id: plan.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        active: true,
        total_paid: plan.price,
        tx_hash: subHash,
        subscription_hash: subHash
      });

      await supabase.rpc('increment_creator_earned', {
        creator_address: creatorAddress.toLowerCase(),
        amount_to_add: parseFloat(plan.price.toString())
      });

      // Create subscription notification via API
      try {
        // Fetch subscriber's name
        const { data: subscriberProfile } = await supabase
          .from('user_profiles')
          .select('display_name, username')
          .eq('wallet_address', userAddress.toLowerCase())
          .single();

        const subscriberName = subscriberProfile?.display_name || (subscriberProfile?.username ? `@${subscriberProfile.username}` : `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`);

        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: creatorAddress.toLowerCase(),
            action: 'create',
            type: 'subscription',
            content: `New subscriber! ${subscriberName} joined your ${plan.name} circle. 🌟`,
          })
        });
      } catch (err) {
        console.error('Failed to create notification:', err);
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {[1, 2].map(i => (
        <div key={i} className="h-80 bg-white/5 rounded-[2rem] border border-white/5" />
      ))}
    </div>
  );

  if (plans.length === 0) return (
    <div className="py-12 text-center glass-card border-dashed border-white/5">
      <Zap className="w-10 h-10 text-slate-800 mx-auto mb-4 opacity-50" />
      <p className="text-slate-500 font-medium uppercase text-xs tracking-widest">No Exclusive Tiers Available Yet</p>
    </div>
  );

  return (
    <div className="space-y-8 relative">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-md:px-4"
          >
            <div className={`glass-card p-4 flex items-center justify-between border ${notification.type === 'error' ? 'border-red-500/50 bg-red-500/10' : 'border-green-500/50 bg-green-500/10'} shadow-[0_20px_40px_rgba(0,0,0,0.4)]`}>
              <div className="flex items-center gap-3">
                {notification.type === 'error' ? (
                  <X className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                <p className="text-sm font-bold text-white tracking-tight">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <div className={`grid gap-4 w-full mx-auto ${plans.length === 1 ? 'max-w-md grid-cols-1' :
        plans.length === 2 ? 'max-w-4xl grid-cols-1 md:grid-cols-2' :
          'max-w-[1300px] grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
        }`}>
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ y: -8, scale: 1.01 }}
            className="relative group p-[2px] rounded-[3.5rem] overflow-hidden"
          >
            {/* Animated Gradient Border */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#8A2BE2] via-white/10 to-[#F7931A] opacity-30 group-hover:opacity-100 transition-opacity duration-700 blur-[1px]" />

            <div className="relative h-full w-full bg-[#0B0F19] rounded-3xl p-6 flex flex-col z-10 overflow-hidden">
              {/* Decorative Background Glows */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#8A2BE2]/10 blur-[60px] rounded-full -ml-16 -mt-16 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#F7931A]/10 blur-[60px] rounded-full -mr-16 -mb-16 pointer-events-none" />

              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-white font-outfit uppercase tracking-tighter leading-none group-hover:text-[#F7931A] transition-colors duration-300">
                    {plan.name}
                  </h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 w-fit">
                    <Clock className="w-3 h-3 text-[#8A2BE2]" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{plan.duration / 86400} DAYS ACCESS</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-black text-white font-outfit tracking-tighter">{plan.price}</span>
                    <div className="relative">
                      <div className="absolute inset-0 bg-white blur-md opacity-20" />
                      <div className="relative bg-[#FF0055] p-1.5 rounded-full shadow-[0_0_15px_rgba(255,0,85,0.4)]">
                        <MUSDLogo className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">
                    {plan.duration / 86400 === 30 ? '1 Month Membership' :
                      plan.duration / 86400 === 365 ? 'Annual Membership' :
                        `${plan.duration / 86400} Days Membership`}
                  </span>
                </div>
              </div>

              <div className="flex-grow flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="min-h-[80px] flex items-center">
                    <p className="text-slate-400 leading-relaxed font-medium transition-all duration-300 text-[13px]">
                      {plan.description || `Elevate your experience with ${plan.name}—unlocking a universe of premium content and direct creator access.`}
                    </p>
                  </div>

                  <div className={`${plans.length === 1 ? 'space-y-3' : 'flex flex-wrap gap-2'} pb-8`}>
                    {(plan.perks?.length ? plan.perks : ['Exclusive Content Access', 'Direct Messaging', 'VIP Badge']).map((perk, i) => (
                      <div key={i} className={`flex items-center gap-3 transition-all duration-300 group/perk ${plans.length === 1 ? '' : 'px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10'
                        }`}>
                        <div className={`flex items-center justify-center text-[#8A2BE2] ${plans.length === 1 ? 'w-6 h-6 rounded-lg bg-[#8A2BE2]/10 border border-[#8A2BE2]/20' : ''
                          }`}>
                          <Check className={plans.length === 1 ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
                        </div>
                        <span className={`${plans.length === 1 ? 'text-xs' : 'text-[10px]'} font-bold text-slate-400 uppercase tracking-widest group-hover/perk:text-white transition-colors`}>
                          {perk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setPreviewPlan(plan)}
                  disabled={status === 'approving' || status === 'subscribing'}
                  className="relative w-full py-6 rounded-[2.5rem] bg-[#F7931A] text-black overflow-hidden group/btn transition-all duration-500 hover:shadow-[0_0_30px_rgba(247,147,26,0.3)] active:scale-[0.97]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                  <div className="relative flex items-center justify-center gap-3">
                    {(status === 'subscribing' && selectedPlan?.id === plan.id) ? (
                      <Loader2 className="w-6 h-6 animate-spin text-black" />
                    ) : (
                      <Zap className="w-6 h-6 fill-black" />
                    )}
                    <span className="font-black font-outfit uppercase tracking-[0.15em] text-base">
                      {(status === 'approving' && selectedPlan?.id === plan.id) ? 'Processing...' :
                        (status === 'subscribing' && selectedPlan?.id === plan.id) ? 'Subscribing...' :
                          'Join the Circle'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {previewPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xl"
            onClick={() => setPreviewPlan(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              className="glass-card max-w-lg w-full p-8 relative overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#F7931A]/20 blur-3xl" />
              <h3 className="relative font-outfit text-4xl font-black uppercase tracking-tighter text-white">{previewPlan.name}</h3>
              <p className="relative mt-2 text-slate-400">{previewPlan.description || `Support ${creatorName} and unlock this tier.`}</p>
              <div className="relative my-6 rounded-2xl border border-white/5 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Price</span>
                  <span className="flex items-center gap-2 text-2xl font-black text-[#F7931A]">{previewPlan.price} <MUSDLogo className="h-5 w-5" /></span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Duration</span>
                  <span className="text-sm font-black text-white">{previewPlan.duration / 86400} days</span>
                </div>
              </div>
              <div className="relative space-y-3">
                {(previewPlan.perks?.length ? previewPlan.perks : ['Exclusive Content Access']).map((perk, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                    <Check className="h-4 w-4 text-[#F7931A]" />
                    {perk}
                  </div>
                ))}
              </div>
              <button onClick={() => handleSubscribe(previewPlan)} className="btn-primary relative mt-8 w-full py-5">
                Confirm Subscription
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CelebrationModal
        isOpen={status === 'success'}
        onClose={() => {
          setStatus('idle');
          setSelectedPlan(null);
          if (onSuccess) onSuccess();
        }}
        type="subscription"
        creatorName={creatorName}
        planName={selectedPlan?.name}
      />
    </div>
  );
}
