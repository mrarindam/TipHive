'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Loader2, Zap, Clock, X, Power, PowerOff } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { supabase } from '@/lib/supabase';
import { SUBSCRIPTION_ABI, SUBSCRIPTION_CONTRACT } from '@/lib/contracts';
import MUSDLogo from '@/components/ui/MUSDLogo';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  perks: string[];
  active: boolean;
  chain_plan_id: number;
}

export default function SubscriptionManager() {
  const { address } = useAccount();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationDays: '30',
    description: '',
    perks: ['Exclusive Content', 'Direct Messaging']
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Read current plan counter from contract
  const { data: planCounter, refetch: refetchCounter } = useReadContract({
    address: SUBSCRIPTION_CONTRACT,
    abi: SUBSCRIPTION_ABI,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    functionName: 'planCounter' as any,
  });

  const fetchPlans = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('creator_address', address.toLowerCase())
        .order('created_at', { ascending: false });
      
      if (data) setPlans(data as Plan[]);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPlans();
  }, [address, fetchPlans]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setCreating(true);

    try {
      const priceWei = parseEther(formData.price);
      const durationSeconds = BigInt(parseInt(formData.durationDays) * 86400);

      writeContract({
        address: SUBSCRIPTION_CONTRACT,
        abi: SUBSCRIPTION_ABI,
        functionName: 'createPlan',
        args: [formData.name, priceWei, durationSeconds],
      });
    } catch (err) {
      console.error(err);
      setCreating(false);
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    setActiveActionId(plan.id);
    try {
      const priceWei = parseEther(plan.price.toString());
      writeContract({
        address: SUBSCRIPTION_CONTRACT,
        abi: SUBSCRIPTION_ABI,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        functionName: 'updatePlan' as any,
        args: [BigInt(plan.chain_plan_id), plan.name, priceWei, !plan.active],
      });
    } catch (err) {
      console.error(err);
      setActiveActionId(null);
    }
  };

  useEffect(() => {
    if (isConfirmed && hash && address) {
      if (creating) {
        const saveToDb = async () => {
          const { data: updatedCounter } = await refetchCounter();
          let chainId = 0;
          if (updatedCounter !== undefined) {
             chainId = Number(updatedCounter) - 1;
          }

          await supabase.from('subscription_plans').insert({
            creator_address: address.toLowerCase(),
            name: formData.name,
            price: parseFloat(formData.price),
            duration: parseInt(formData.durationDays) * 86400,
            description: formData.description,
            perks: formData.perks,
            active: true,
            chain_plan_id: chainId >= 0 ? chainId : 0
          });

          setCreating(false);
          setShowCreateModal(false);
          fetchPlans();
          setFormData({
              name: '',
              price: '',
              durationDays: '30',
              description: '',
              perks: ['Exclusive Content', 'Direct Messaging']
            });
        };
        saveToDb();
      } else if (activeActionId) {
        const updateDb = async () => {
          const plan = plans.find(p => p.id === activeActionId);
          if (!plan) return;

          await supabase
            .from('subscription_plans')
            .update({ active: !plan.active })
            .eq('id', plan.id);
          
          setActiveActionId(null);
          fetchPlans();
          refetchCounter();
        };
        updateDb();
      }
    }
  }, [isConfirmed, hash, creating, activeActionId, address, planCounter, refetchCounter, fetchPlans, formData, plans]);

  if (loading) return <div className="py-20 text-center animate-pulse text-slate-500 font-outfit uppercase tracking-widest font-black">Syncing Tiers with Mezo...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white font-outfit uppercase tracking-tighter">Subscription <span className="text-[#F7931A]">Management</span></h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Control your access tiers and fan rewards.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary px-8 py-3 flex items-center gap-2 self-start shadow-xl shadow-orange-500/20"
        >
          <Plus className="w-5 h-5" />
          Create New Tier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length > 0 ? plans.map((plan) => {
          const isProcessing = activeActionId === plan.id;
          return (
            <div key={plan.id} className={`glass-card p-6 border-white/5 hover:border-[#F7931A]/30 transition-all group relative overflow-hidden ${!plan.active ? 'opacity-70' : ''}`}>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  plan.active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {plan.active ? 'Live' : 'Hidden'}
                </div>
                <div className="flex items-center gap-1 font-black text-[#F7931A] text-xl">
                  {plan.price} <MUSDLogo className="w-5 h-5" />
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight font-outfit">{plan.name}</h3>
              <p className="text-slate-500 text-xs mb-6 line-clamp-2 leading-relaxed">{plan.description || 'Exclusive access for your most dedicated fans.'}</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Clock className="w-4 h-4 text-[#F7931A]" />
                  {plan.duration / 86400} Days Access
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Zap className="w-4 h-4 text-[#F7931A]" />
                  {plan.perks?.length || 0} Exclusive Perks
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-white/5 relative z-10">
                <button 
                  onClick={() => handleToggleActive(plan)}
                  disabled={isProcessing || isConfirming}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${
                    plan.active 
                      ? 'bg-white/5 hover:bg-red-500/10 text-white hover:text-red-500 border border-white/5 hover:border-red-500/30' 
                      : 'bg-[#F7931A]/10 hover:bg-[#F7931A]/20 text-[#F7931A] border border-[#F7931A]/30'
                  }`}
                >
                  {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : plan.active ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                  {plan.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-24 text-center glass-card border-dashed border-white/5">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">No Tiers Created</h3>
            <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">Create subscription tiers to start earning recurring revenue from your community.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-secondary px-10 py-4 mx-auto"
            >
              Set Up Your First Tier
            </button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card w-full max-w-xl p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-3xl font-black text-white mb-8 font-outfit uppercase tracking-tighter">New <span className="text-[#F7931A]">Access Tier</span></h2>

              <form onSubmit={handleCreatePlan} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tier Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Diamond Circle"
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Monthly Rate (MUSD)</label>
                    <div className="relative">
                      <input 
                        required
                        type="number" 
                        placeholder="10"
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none font-medium"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                      />
                      <MUSDLogo className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tier Duration</label>
                    <select 
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none appearance-none font-medium"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({...formData, durationDays: e.target.value})}
                    >
                      <option value="7" className="bg-[#1a1a1a]">Weekly Access</option>
                      <option value="30" className="bg-[#1a1a1a]">Monthly Access</option>
                      <option value="90" className="bg-[#1a1a1a]">90 Days Access</option>
                      <option value="365" className="bg-[#1a1a1a]">Annual Access</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="List the exclusive benefits for this tier..."
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none resize-none font-medium"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Included Perks</label>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, perks: [...formData.perks, '']})}
                      className="text-xs font-black text-[#F7931A] uppercase hover:text-white flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Perk
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.perks.map((perk, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#F7931A]/10 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-[#F7931A]" />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Early access to videos"
                          className="flex-1 bg-white/5 border border-white/5 rounded-lg py-2 px-3 text-sm text-white focus:ring-1 focus:ring-[#F7931A] focus:outline-none"
                          value={perk}
                          onChange={(e) => {
                            const newPerks = [...formData.perks];
                            newPerks[index] = e.target.value;
                            setFormData({...formData, perks: newPerks});
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newPerks = formData.perks.filter((_, i) => i !== index);
                            setFormData({...formData, perks: newPerks});
                          }}
                          className="p-2 text-slate-500 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.perks.length === 0 && (
                      <div className="text-sm text-slate-500 italic py-2">No perks added yet.</div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating || isConfirming}
                  className="w-full btn-primary py-5 text-xl font-black font-outfit uppercase tracking-tighter flex items-center justify-center gap-3 shadow-2xl shadow-orange-500/20"
                >
                  {creating || isConfirming ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
                  {creating ? 'Broadcasting to Mezo...' : isConfirming ? 'Securing on Ledger...' : 'Go Live with Tier'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
