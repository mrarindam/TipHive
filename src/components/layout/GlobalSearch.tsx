'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  username: string;
  display_name: string;
  avatar_url: string;
  wallet_address: string;
}

interface GlobalSearchProps {
  isMobile?: boolean;
  onSelect?: () => void;
}

export default function GlobalSearch({ isMobile, onSelect }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchCreators = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { data } = await supabase
        .from('user_profiles')
        .select('username, display_name, avatar_url, wallet_address')
        .eq('is_creator', true)
        .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(5);

      if (data) setResults(data as SearchResult[]);
      setLoading(false);
    };

    const debounce = setTimeout(searchCreators, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (username: string) => {
    router.push(`/${username}`);
    setIsOpen(false);
    setQuery('');
    if (onSelect) onSelect();
  };

  return (
    <div className={`relative ${isMobile ? 'w-full' : 'flex-1 max-w-md mx-8 hidden lg:block'}`} ref={searchRef}>
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#F7931A] transition-colors" />
        <input
          type="text"
          placeholder="Search creators..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#F7931A]/30 transition-all placeholder:text-slate-600 group-hover:bg-white/10"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-[#F7931A] animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 w-full bg-[#0B0F19] border border-white/10 rounded-[1.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[110] backdrop-blur-3xl"
          >
            <div className="p-2">
              {results.length > 0 ? (
                results.map((result) => (
                  <button
                    key={result.wallet_address}
                    onClick={() => handleSelect(result.username)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group text-left"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/5 relative shrink-0">
                      {result.avatar_url ? (
                        <Image
                          src={result.avatar_url}
                          alt={result.display_name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-700" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold text-sm text-white truncate group-hover:text-[#F7931A] transition-colors">
                        {result.display_name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
                        @{result.username}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                !loading && (
                  <div className="p-8 text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No creators found</p>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
