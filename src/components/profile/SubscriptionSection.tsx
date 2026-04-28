'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Shield, Star, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useAccount, useWriteContract, useReadContract, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { parseEther, formatEther } from 'viem';
import { supabase } from '@/lib/supabase';
import { SUBSCRIPTION_ABI, SUBSCRIPTION_CONTRACT, MUSD_ADDRESS, ERC20_ABI } from '@/lib/contracts';
import MUSDLogo from '@/components/ui/MUSDLogo';

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
}

export default function SubscriptionSection({ creatorAddress, creatorName }: SubscriptionSectionProps) {
  const { address: userAddress, isConnected } = useAccount();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'approving' | 'subscribing' | 'success' | 'error'>('idle');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const config = useConfig();

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
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('creator_address', creatorAddress.toLowerCase())
        .eq('active', true)
        .order('price', { ascending: true });

      if (!error && data) {
        setPlans(data as Plan[]);
      }
      setLoading(false);
    }

    if (creatorAddress) {
      fetchPlans();
    }
  }, [creatorAddress]);

  const handleSubscribe = async (plan: Plan) => {
    if (!isConnected || !userAddress) return alert('Please connect your wallet');
    if (userAddress.toLowerCase() === creatorAddress.toLowerCase()) {
      return alert("You can't subscribe to yourself!");
    }

    const amount = parseEther(plan.price.toString());
    
    // Balance check
    if (balance && BigInt(balance.toString()) < amount) {
      return alert(`Insufficient MUSD balance. This plan costs ${plan.price} MUSD, but you only have ${formatEther(BigInt(balance.toString()))} MUSD.`);
    }

    setSelectedPlan(plan);

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

      setTimeout(() => {
        setStatus('idle');
        setSelectedPlan(null);
      }, 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {[1, 2].map(i => (
        <div key={i} className="h-80 bg-white/5 rounded-[2rem] border border-white/10" />
      ))}
    </div>
  );

  if (plans.length === 0) return (
    <div className="py-12 text-center glass-card border-dashed border-white/10">
      <Zap className="w-10 h-10 text-slate-800 mx-auto mb-4 opacity-50" />
      <p className="text-slate-500 font-medium uppercase text-xs tracking-widest">No Exclusive Tiers Available Yet</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white font-outfit uppercase tracking-tighter">
          Exclusive <span className="text-[#F7931A]">Plans</span>
        </h2>
        <div className="flex items-center gap-2 bg-[#F7931A]/10 px-4 py-2 rounded-full border border-[#F7931A]/20">
          <Shield className="w-4 h-4 text-[#F7931A]" />
          <span className="text-[10px] font-black text-[#F7931A] uppercase tracking-widest">On-chain Protected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative group rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden ${
              index === 1 
                ? 'bg-gradient-to-br from-[#F7931A]/20 via-black to-black border-[#F7931A]/40 hover:border-[#F7931A]' 
                : 'bg-white/5 border-white/10 hover:border-white/30'
            }`}
          >
            <div className={`absolute top-0 inset-x-0 h-40 opacity-20 blur-3xl pointer-events-none ${
              index === 1 ? 'bg-[#F7931A]' : 'bg-blue-500'
            }`} />

            <div className="p-8 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-white font-outfit uppercase tracking-tighter mb-1">{plan.name}</h3>
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    {plan.duration / 86400} Days Access
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-3xl font-black text-white font-outfit tracking-tighter">
                    {plan.price} <MUSDLogo className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Monthly Support</div>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-8 line-clamp-2 leading-relaxed">
                {plan.description || `Support ${creatorName} and unlock exclusive content, perks, and direct interactions.`}
              </p>

              <div className="space-y-4 mb-8">
                {plan.perks && plan.perks.length > 0 ? (
                   plan.perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        index === 1 ? 'bg-[#F7931A]/20 text-[#F7931A]' : 'bg-white/10 text-white'
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-medium text-slate-300">{perk}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white">
                        <Zap className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-medium text-slate-300">Exclusive Content Access</span>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={status === 'approving' || status === 'subscribing'}
                className={`w-full py-5 rounded-2xl font-black font-outfit uppercase tracking-tighter flex items-center justify-center gap-3 transition-all ${
                  index === 1 
                    ? 'bg-[#F7931A] text-white hover:bg-[#FFAB40] shadow-xl shadow-orange-500/20' 
                    : 'bg-white text-black hover:bg-slate-200'
                }`}
              >
                {(status === 'subscribing' && selectedPlan?.id === plan.id) ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5 fill-current" />
                )}
                {(status === 'approving' && selectedPlan?.id === plan.id) ? 'Approving MUSD...' :
                 (status === 'subscribing' && selectedPlan?.id === plan.id) ? 'Subscribing...' :
                 'Join Circle'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <div className="glass-card max-w-md w-full p-10 text-center relative overflow-hidden">
               <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#F7931A] to-transparent" />
               
               <div className="w-24 h-24 bg-[#F7931A] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-500/40">
                 <Check className="w-12 h-12 text-white stroke-[4px]" />
               </div>
               
               <h3 className="text-4xl font-black text-white font-outfit uppercase tracking-tighter mb-4">Welcome Aboard!</h3>
               <p className="text-slate-400 font-medium mb-8">
                 You are now officially subscribed to <span className="text-white font-bold">{selectedPlan?.name}</span>. 
               </p>
               
               <button 
                onClick={() => setStatus('idle')}
                className="btn-primary w-full py-4 text-lg"
               >
                 Close
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
