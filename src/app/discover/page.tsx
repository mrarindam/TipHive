'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import CreatorCard from '@/components/ui/CreatorCard';
import { Search, ChevronDown, LayoutGrid, Code2, Palette, PenTool, Music, Layout, Video, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Creator {
  address: string;
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
      let query = supabase.from('creators').select('*');
      
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      
      if (category !== 'All') {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('total_earned', { ascending: false });
      
      if (!error && data) {
        setCreators(data as Creator[]);
      } else {
        // Fallback mock data if Supabase isn't setup yet
        setCreators([
          { address: '0x1234...', name: 'Satoshi Nakamoto', bio: 'Creating the future of money.', avatar_url: '', category: 'Developer', total_earned: 150 },
          { address: '0x5678...', name: 'Alice Wonders', bio: 'Digital artist exploring Bitcoin.', avatar_url: '', category: 'Artist', total_earned: 85 },
          { address: '0x9012...', name: 'Bob Builder', bio: 'Building open-source tools on Mezo.', avatar_url: '', category: 'Developer', total_earned: 42 },
        ]);
      }
      setLoading(false);
    }
    fetchCreators();
  }, [search, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 font-outfit uppercase tracking-tighter">
            Discover <span className="text-[#F7931A]">Creators</span>
          </h1>
          <p className="text-slate-400">Support your favorite creators on the Bitcoin network.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="relative w-full md:w-64">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 flex items-center justify-between text-white hover:bg-white/10 hover:border-[#F7931A]/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F7931A]/10 flex items-center justify-center">
                  {(() => {
                    const Icon = categories.find(c => c.name === category)?.icon || LayoutGrid;
                    return <Icon className="w-4 h-4 text-[#F7931A]" />;
                  })()}
                </div>
                <span className="font-bold text-sm tracking-tight">{category}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-2 z-[50] bg-[#0a0a0c]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => {
                          setCategory(cat.name);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
                          category === cat.name 
                            ? 'bg-[#F7931A] text-white shadow-lg shadow-[#F7931A]/20' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <cat.icon className={`w-4 h-4 ${category === cat.name ? 'text-white' : 'text-[#F7931A]'}`} />
                        <span className="text-sm font-bold">{cat.name}</span>
                        {category === cat.name && <Sparkles className="w-3 h-3 ml-auto text-white animate-pulse" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card h-[400px] animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {creators.map((creator) => (
            <CreatorCard key={creator.address} creator={creator} />
          ))}
        </motion.div>
      )}

      {!loading && creators.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-500 text-xl">No creators found matching your search.</p>
        </div>
      )}
    </div>
  );
}
