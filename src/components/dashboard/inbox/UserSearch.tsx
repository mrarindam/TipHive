'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface UserProfile {
  privy_did: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

export default function UserSearch({ onSelect }: { onSelect: (user: UserProfile) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('privy_did, username, display_name, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(5);

      if (!error && data) {
        setResults(data);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#f7931a] transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username..."
          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#f7931a]/50 focus:bg-white/[0.05] transition-all"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f0f14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[70] backdrop-blur-xl">
          {results.map((user) => (
            <button
              key={user.privy_did}
              onClick={() => {
                onSelect(user);
                setQuery('');
                setResults([]);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                <Image src={user.avatar_url} alt={user.username} width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate group-hover:text-[#f7931a] transition-colors">{user.display_name}</p>
                <p className="text-xs text-slate-500 truncate">@{user.username}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
