'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDashboard } from '../layout';
import { supabase } from '@/lib/supabase';
import InboxSidebar, { ChatPreview } from '@/components/dashboard/inbox/InboxSidebar';
import ChatWindow, { Message } from '@/components/dashboard/inbox/ChatWindow';

export default function InboxPage() {
  const { user } = useDashboard();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [activeChatDid, setActiveChatDid] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<{ username: string, display_name: string, avatar_url: string } | null>(null);

  const currentDid = user?.id;
  const searchParams = useSearchParams();
  const chatFromQuery = searchParams.get('chat');

  useEffect(() => {
    if (chatFromQuery) {
      setActiveChatDid(chatFromQuery);
    }
  }, [chatFromQuery]);

  const fetchConversations = useCallback(async () => {
    if (!currentDid) return;

    try {
      // Query messages where current user is sender or receiver via secure RPC
      const { data: messagesData, error: messagesError } = await supabase
        .rpc('fetch_direct_messages', { user_did: currentDid });

      if (messagesError) throw messagesError;

      // Group by other user and get unique DIDs
      const otherUserDids = Array.from(new Set(
        (messagesData as Message[]).map((m: Message) => m.sender_did === currentDid ? m.receiver_did : m.sender_did)
      )) as string[];

      if (otherUserDids.length === 0) {
        setChats([]);
        return;
      }

      // Fetch profile info for all other users
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('privy_did, username, display_name, avatar_url, wallet_address')
        .in('privy_did', otherUserDids);

      if (profilesError) throw profilesError;

      const profileMap = new Map(profiles.map(p => [p.privy_did, p]));

      // Build chat previews
      const chatPreviews: ChatPreview[] = otherUserDids.map((did: string) => {
        const lastMsg = (messagesData as Message[]).find((m: Message) => m.sender_did === did || m.receiver_did === did);
        const profile = profileMap.get(did) as { username: string, display_name: string, avatar_url: string };
        return {
          other_user_did: did,
          username: profile?.username || 'unknown',
          display_name: profile?.display_name || 'Unknown User',
          avatar_url: profile?.avatar_url || 'https://api.dicebear.com/9.x/shapes/svg?seed=unknown',
          last_message: lastMsg?.text || '',
          last_message_at: lastMsg?.created_at || new Date().toISOString(),
          is_read: lastMsg?.sender_did === currentDid ? true : lastMsg?.is_read || false
        };
      });

      setChats(chatPreviews);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  }, [currentDid]);

  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const PAGE_SIZE = 10;

  const fetchMessages = useCallback(async (otherDid: string, beforeTimestamp?: string) => {
    if (!currentDid) return;

    const { data, error } = await supabase
      .rpc('get_conversation_messages', { 
        p_current_user: currentDid,
        p_other_user: otherDid,
        p_limit: PAGE_SIZE,
        p_before: beforeTimestamp || null
      });

    if (!error && data) {
      // Sort oldest to newest for the array state
      const sortedData = [...data].sort((a: Message, b: Message) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      if (beforeTimestamp) {
        setMessages(prev => [...sortedData, ...prev]);
      } else {
        setMessages(sortedData);
      }
      setHasMore(data.length === PAGE_SIZE);
    }

    if (!beforeTimestamp) {
      // Fetch other user profile only on initial load
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('username, display_name, avatar_url, wallet_address')
        .eq('privy_did', otherDid)
        .single();

      if (profile) {
        setOtherUser(profile);
      }

      // Mark as read
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('sender_did', otherDid)
        .eq('receiver_did', currentDid);
      
      setTimeout(fetchConversations, 500);
    }
  }, [currentDid, fetchConversations]);

  const loadMoreMessages = async () => {
    if (!activeChatDid || !hasMore || isLoadingMore || messages.length === 0) return;
    setIsLoadingMore(true);
    await fetchMessages(activeChatDid, messages[0].created_at);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeChatDid) {
      setMessages([]);
      setHasMore(true);
      fetchMessages(activeChatDid);
    }
  }, [activeChatDid, fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!currentDid) return;

    const channel = supabase
      .channel('inbox-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_did=eq.${currentDid}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // ONLY add to UI if it's from the person I'm currently chatting with
          if (activeChatDid === newMsg.sender_did) {
            setMessages(prev => {
              // Prevent duplicate messages
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentDid, activeChatDid, fetchConversations]);

  const handleSendMessage = async (text: string) => {
    if (!currentDid || !activeChatDid) return;

    const { data, error } = await supabase
      .rpc('send_direct_message', {
        p_sender_did: currentDid,
        p_receiver_did: activeChatDid,
        p_text: text
      });

    if (!error && data) {
      setMessages(prev => [...prev, data]);
      fetchConversations();
    }
  };

  // Lock body scroll when inbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const handleSelectChat = async (did: string) => {
    setActiveChatDid(did);
    setIsMobileChatOpen(true);
    // If it's a new chat (not in current list), we need to fetch profile first
    const existingChat = chats.find(c => c.other_user_did === did);
    if (!existingChat) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('username, display_name, avatar_url, wallet_address')
        .eq('privy_did', did)
        .single();
      if (profile) {
        setOtherUser(profile);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] md:h-[calc(100vh-200px)] flex bg-[#0a0a0f] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative mb-[-40px] md:mb-0">
      {/* Sidebar - Fixed width, internal scroll */}
      <div className={`${isMobileChatOpen ? 'hidden md:block' : 'block'} w-full md:w-96 flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-sm`}>
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar">
          <InboxSidebar 
            chats={chats} 
            activeChatDid={activeChatDid} 
            onSelectChat={handleSelectChat} 
          />
        </div>
      </div>

      {/* Main Chat Area - Flexible width, internal scroll managed by ChatWindow */}
      <div className={`${isMobileChatOpen ? 'block' : 'hidden md:block'} flex-1 h-full relative overflow-hidden bg-[#050507]`}>
        <ChatWindow 
          messages={messages} 
          currentUserId={currentDid || ''} 
          otherUser={otherUser}
          onSendMessage={handleSendMessage}
          onBack={() => setIsMobileChatOpen(false)}
          onLoadMore={loadMoreMessages}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
        />
      </div>
    </div>
  );
}
