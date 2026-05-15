'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Crown, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useProfile } from '../layout';
import Pagination from '@/components/ui/Pagination';
import { useNetworkConfig } from '@/lib/hooks/useNetworkConfig';

interface Member {
  privy_did: string;
  follower_address: string;
  created_at: string;
  display_name?: string;
  avatar_url?: string;
  total_tipped?: number;
}

interface ProfileResult {
  privy_did: string;
  wallet_address: string;
  display_name: string;
  avatar_url: string;
  username: string;
}

export default function CreatorMembers() {
  const { creator, isOwner, fetchData } = useProfile();
  const { chainId } = useNetworkConfig();

  const [memberFilter, setMemberFilter] = useState<'supporters' | 'followers' | 'following'>('supporters');
  const [members, setMembers] = useState<Member[]>([]);
  const [supporters, setSupporters] = useState<Member[]>([]);
  const [followingList, setFollowingList] = useState<Member[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!creator) return;

    async function loadMembersData() {
      // Followers
      const { data: membersData } = await supabase
        .from('followers')
        .select(`
          created_at,
          follower:user_profiles!follower_id (
            privy_did,
            wallet_address,
            display_name,
            avatar_url,
            username
          )
        `)
        .eq('creator_id', creator!.id);

      if (membersData) {
        setMembers(membersData.map(m => {
          const profile = m.follower as unknown as ProfileResult & { privy_did: string };
          return { 
            privy_did: profile?.privy_did || profile?.wallet_address || '',
            follower_address: profile?.wallet_address || '', 
            created_at: m.created_at, 
            display_name: profile?.display_name,
            avatar_url: profile?.avatar_url,
          };
        }));
      }

      const { data: tipsData } = await supabase
        .from('tips')
        .select('*')
        .eq('to_address', creator!.wallet_address.toLowerCase())
        .eq('chain_id', chainId)
        .order('created_at', { ascending: false });

      if (tipsData) {
        const uniqueAddrs = Array.from(new Set(tipsData.map(t => t.from_address)));
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('privy_did, wallet_address, display_name, avatar_url, username')
          .in('wallet_address', uniqueAddrs);

        setSupporters(uniqueAddrs.map(addr => {
          const p = profiles?.find(pr => pr.wallet_address.toLowerCase() === addr.toLowerCase());
          const totalTipped = tipsData.filter(t => t.from_address.toLowerCase() === addr.toLowerCase()).reduce((sum, t) => sum + (t.amount || 0), 0);
          return {
            privy_did: p?.privy_did || addr,
            follower_address: addr,
            created_at: tipsData.filter(t => t.from_address.toLowerCase() === addr.toLowerCase())[0].created_at,
            total_tipped: totalTipped,
            display_name: p?.display_name,
            avatar_url: p?.avatar_url
          };
        }));
      }

      // Following
      const { data: followingData } = await supabase
        .from('followers')
        .select(`
          created_at,
          following:user_profiles!creator_id (
            privy_did,
            wallet_address,
            display_name,
            avatar_url,
            username
          )
        `)
        .eq('follower_id', creator!.id);

      if (followingData) {
        setFollowingList(followingData.map(f => {
          const profile = f.following as unknown as ProfileResult & { privy_did: string };
          return { 
            privy_did: profile?.privy_did || profile?.wallet_address || '',
            follower_address: profile?.wallet_address || '', 
            created_at: f.created_at, 
            display_name: profile?.display_name,
            avatar_url: profile?.avatar_url,
          };
        }));
      }
    }

    loadMembersData();
  }, [creator, isOwner, fetchData, chainId]);

  if (!creator) return null;

  if (!isOwner) return <div className="py-20 text-center text-slate-500">Access denied.</div>;

  const filteredData = 
    memberFilter === 'supporters' ? supporters :
    memberFilter === 'followers' ? members :
    followingList;
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter font-outfit">Audience Insight</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Detailed view of your growing community</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-[#0a0a0c]/60 backdrop-blur-xl p-2 rounded-[1.5rem] border border-white/5 shadow-2xl">
          <button onClick={() => { setMemberFilter('supporters'); setCurrentPage(1); }} className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${memberFilter === 'supporters' ? 'bg-[#8A2BE2] text-white shadow-[0_0_20px_rgba(138,43,226,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Crown className="w-3.5 h-3.5" /> Supporters <span className="opacity-50 text-[10px] bg-black/30 px-2 py-0.5 rounded-full">{supporters.length}</span>
          </button>
          <button onClick={() => { setMemberFilter('followers'); setCurrentPage(1); }} className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${memberFilter === 'followers' ? 'bg-[#8A2BE2] text-white shadow-[0_0_20px_rgba(138,43,226,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Users className="w-3.5 h-3.5" /> Followers <span className="opacity-50 text-[10px] bg-black/30 px-2 py-0.5 rounded-full">{members.length}</span>
          </button>
          <button onClick={() => { setMemberFilter('following'); setCurrentPage(1); }} className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${memberFilter === 'following' ? 'bg-[#8A2BE2] text-white shadow-[0_0_20px_rgba(138,43,226,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            Following <span className="opacity-50 text-[10px] bg-black/30 px-2 py-0.5 rounded-full">{followingList.length}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {paginatedData.length > 0 ? (
          <>
            {paginatedData.map((member, i) => {
              const isSupporter = supporters.some(s => s.follower_address === member.follower_address);
              const tippedAmount = supporters.find(s => s.follower_address === member.follower_address)?.total_tipped;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  key={i} 
                  className="bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-6 flex flex-col items-center group hover:border-[#8A2BE2]/40 hover:bg-[#111113] transition-all duration-500 shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                  <div className="mb-6">
                    {memberFilter === 'following' ? (
                      <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Creator</span>
                    ) : isSupporter ? (
                      <span className="px-4 py-1.5 bg-[#8A2BE2]/10 text-[#D8B4FE] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#8A2BE2]/20 flex items-center gap-1.5">
                        <Crown className="w-3 h-3" /> Supporter
                      </span>
                    ) : (
                      <span className="px-4 py-1.5 bg-white/5 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-1.5">
                        <Users className="w-3 h-3" /> Follower
                      </span>
                    )}
                  </div>

                  <div className="relative mb-6">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#8A2BE2] to-[#F7931A] rounded-full blur-[2px] opacity-0 group-hover:opacity-40 transition-opacity"></div>
                    <div className="w-24 h-24 rounded-full border-4 border-[#0a0a0c] overflow-hidden relative shadow-2xl bg-black">
                      <Image
                        src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.display_name || 'User')}`}
                        alt="Member" fill className="rounded-full object-cover group-hover:scale-110 transition-transform duration-500" unoptimized
                      />
                    </div>
                  </div>

                  <div className="text-center w-full px-2 mb-6">
                    <h4 className="font-black text-base text-white mb-1 truncate group-hover:text-[#8A2BE2] transition-colors">{member.display_name || `${member.follower_address.slice(0, 6)}...${member.follower_address.slice(-4)}`}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Joined {new Date(member.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    {isSupporter && tippedAmount && <p className="text-xs text-[#F7931A] font-black mt-2 tracking-wide">${tippedAmount} tipped</p>}
                  </div>

                  <div className="w-full mt-auto">
                    <Link 
                      href={`/dashboard/inbox?chat=${member.privy_did}`}
                      className="w-full py-3.5 bg-white/5 border border-white/5 rounded-2xl text-slate-300 hover:text-white hover:bg-white/10 hover:border-[#8A2BE2]/30 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all group/msg"
                    >
                      <MessageSquare className="w-3.5 h-3.5 group-hover/msg:scale-110 transition-transform" /> Message
                    </Link>
                  </div>
                </motion.div>
              );
            })}

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              activeColorClass="bg-[#8A2BE2] text-white shadow-[0_0_20px_rgba(138,43,226,0.4)]"
            />
          </>
        ) : (
          <div className="col-span-full py-32 text-center bg-[#0a0a0c] border border-dashed border-white/10 rounded-[3rem]">
            <Users className="w-16 h-16 text-slate-700 mx-auto mb-4 opacity-20" />
            <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No members found in this category</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
