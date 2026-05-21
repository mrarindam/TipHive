'use client';

import React from 'react';
import Image from 'next/image';
import UserSearch from './UserSearch';
import { motion } from 'framer-motion';

export interface ChatPreview {
  other_user_wallet_address: string;
  username: string;
  display_name: string;
  avatar_url: string;
  last_message: string;
  last_message_at: string;
  is_read: boolean;
}

export default function InboxSidebar({ 
  chats, 
  activeChatAddress, 
  onSelectChat
}: { 
  chats: ChatPreview[], 
  activeChatAddress: string | null, 
  onSelectChat: (walletAddress: string) => void
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-2">
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">Messages</h2>
        <UserSearch onSelect={(user) => onSelectChat(user.wallet_address)} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {chats.length === 0 ? (
          <div className="text-center py-12 px-6">
            <p className="text-slate-500 text-sm">No messages yet. Start a conversation by searching for a username!</p>
          </div>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.other_user_wallet_address}
              onClick={() => onSelectChat(chat.other_user_wallet_address)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group ${
                activeChatAddress === chat.other_user_wallet_address 
                  ? 'bg-[#f7931a]/10 border border-[#f7931a]/20' 
                  : 'hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                  <Image src={chat.avatar_url} alt={chat.username} width={48} height={48} className="w-full h-full object-cover" />
                </div>
                {!chat.is_read && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#f7931a] rounded-full border-2 border-black animate-pulse" />
                )}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-start mb-0.5">
                  <p className={`text-sm font-bold truncate ${activeChatAddress === chat.other_user_wallet_address ? 'text-[#f7931a]' : 'text-white'}`}>
                    {chat.display_name}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate leading-relaxed">
                  {chat.last_message}
                </p>
              </div>

              {activeChatAddress === chat.other_user_wallet_address && (
                <motion.div 
                  layoutId="active-chat-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#f7931a] rounded-r-full" 
                />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
