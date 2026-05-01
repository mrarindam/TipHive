'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import CreatorCard from '@/components/ui/CreatorCard';
import { Search, ChevronDown, LayoutGrid, Code2, Palette, PenTool, Music, Layout, Video, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Creator {
  address: string;
  username?: string;
  name: string;
  bio: string;
  avatar_url: string;
  category: string;
  total_earned: number;
}

export default function Discover() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const categories = [
    { name: 'All', icon: LayoutGrid },
    { name: 'Developer', icon: Code2 },
    { name: 'Artist', icon: Palette },
    { name: 'Writer', icon: PenTool },
    { name: 'Musician', icon: Music },
    { name: 'Designer', icon: Layout },
    { name: 'Content Creator', icon: Video },
  ];

  useEffect(() => {
    async function fetchCreators() {
      setLoading(true);
      let query = supabase
        .from('user_profiles')
        .select('wallet_address, username, display_name, bio, avatar_url, creator_category, creator_description, total_earned')
        .eq('is_creator', true);
      
      if (search) {
        query = query.or(`display_name.ilike.%${search}%,username.ilike.%${search}%`);
      }
      
      if (category !== 'All') {
        query = query.ilike('creator_category', `%${category}%`);
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await query.order('total_earned', { ascending: false } as any);
      
      if (!error && data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setCreators(data.map((profile: any) => ({
          address: profile.wallet_address,
          username: profile.username,
          name: profile.display_name,
          bio: profile.creator_description || profile.bio || '',
          avatar_url: profile.avatar_url,
          category: profile.creator_category || 'Creator',
          total_earned: profile.total_earned || 0,
        })));
      } else {
        // Fallback or empty state
        setCreators([]);
      }
      setLoading(false);
    }
    fetchCreators();
  }, [search, category]);

  return (
    <div className="w-full px-[5%] md:px-[8%] py-12 pt-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 font-outfit uppercase tracking-tighter">
            Discover <span className="text-[#F7931A]">Creators</span>
          </h1>
          <p className="text-slate-400">Support your favorite creators on the Bitcoin network.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#F7931A] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or @username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-[#F7931A]/50 transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Category Filter */}
          <div className="relative w-full sm:w-auto">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-56 flex items-center justify-between gap-3 bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-white hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-3 font-bold text-sm">
                {(() => {
                  const currentCat = categories.find(c => c.name === category);
                  const Icon = currentCat?.icon || LayoutGrid;
                  return <Icon className="w-4 h-4 text-[#F7931A]" />;
                })()}
                {category}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-full sm:w-56 bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl z-50 p-2 backdrop-blur-3xl"
                  >
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.name}
                          onClick={() => {
                            setCategory(cat.name);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            category === cat.name 
                              ? 'bg-[#F7931A] text-white shadow-lg shadow-orange-500/20' 
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {cat.name}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-[420px] rounded-[2.5rem] bg-white/5 border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : creators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {creators.map((creator, i) => (
            <motion.div
              key={creator.address}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <CreatorCard creator={creator} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center glass-card border-dashed border-white/5">
          <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-slate-800" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">No Creators Found</h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">Try adjusting your search or filters to find what you&apos;re looking for.</p>
        </div>
      )}
    </div>
  );
}
