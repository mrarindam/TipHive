'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDashboard } from '../layout';
import { supabase } from '@/lib/supabase';
import InboxSidebar, { ChatPreview } from '@/components/dashboard/inbox/InboxSidebar';
import ChatWindow, { Message } from '@/components/dashboard/inbox/ChatWindow';

export default function InboxPage() {
  const { user } = useDashboard();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [activeChatAddress, setActiveChatAddress] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<{ username: string, display_name: string, avatar_url: string } | null>(null);

  const currentAddress = user?.id;
  const searchParams = useSearchParams();
  const chatFromQuery = searchParams.get('chat');

  useEffect(() => {
    if (chatFromQuery) {
      setActiveChatAddress(chatFromQuery.toLowerCase());
    }
  }, [chatFromQuery]);

  const fetchConversations = useCallback(async () => {
    if (!currentAddress) return;

    // Pull a unified list of DMs involving the current user. Try the RPC first
    // (correct path when the DB function exists); fall back to a direct table
    // query so a missing/broken RPC doesn't kill the inbox UI.
    let messagesData: Message[] | null = null;

    const rpcResult = await supabase
      .rpc('fetch_direct_messages', { p_wallet_address: currentAddress });

    if (rpcResult.error) {
      const e = rpcResult.error;
      console.warn(
        `[inbox/fetchConversations] RPC fetch_direct_messages failed — falling back to direct query. ` +
        `code=${e.code} message=${e.message} details=${e.details} hint=${e.hint}`
      );

      const fallback = await supabase
        .from('direct_messages')
        .select('id, sender_wallet_address, receiver_wallet_address, text, created_at, is_read')
        .or(`sender_wallet_address.eq.${currentAddress},receiver_wallet_address.eq.${currentAddress}`)
        .order('created_at', { ascending: false });

      if (fallback.error) {
        const fe = fallback.error;
        console.error(
          `[inbox/fetchConversations] Fallback query failed too. ` +
          `code=${fe.code} message=${fe.message} details=${fe.details} hint=${fe.hint}`
        );
        return;
      }
      messagesData = fallback.data as Message[];
    } else {
      messagesData = (rpcResult.data || []) as Message[];
    }

    // Group by other user and get unique wallet addresses (preserve recency
    // order — `messagesData` is newest-first).
    const otherUserAddresses = Array.from(new Set(
      messagesData.map((m) => m.sender_wallet_address === currentAddress ? m.receiver_wallet_address : m.sender_wallet_address)
    ));

    if (otherUserAddresses.length === 0) {
      setChats([]);
      return;
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('wallet_address, username, display_name, avatar_url')
      .in('wallet_address', otherUserAddresses);

    if (profilesError) {
      const pe = profilesError;
      console.error(
        `[inbox/fetchConversations] Failed to load profiles. ` +
        `code=${pe.code} message=${pe.message} details=${pe.details} hint=${pe.hint}`
      );
      return;
    }

    const profileMap = new Map((profiles || []).map(p => [p.wallet_address, p]));

    const chatPreviews: ChatPreview[] = otherUserAddresses.map((walletAddress: string) => {
      const lastMsg = messagesData!.find((m) => m.sender_wallet_address === walletAddress || m.receiver_wallet_address === walletAddress);
      const profile = profileMap.get(walletAddress) as { username: string, display_name: string, avatar_url: string } | undefined;
      return {
        other_user_wallet_address: walletAddress,
        username: profile?.username || 'unknown',
        display_name: profile?.display_name || 'Unknown User',
        avatar_url: profile?.avatar_url || 'https://api.dicebear.com/9.x/shapes/svg?seed=unknown',
        last_message: lastMsg?.text || '',
        last_message_at: lastMsg?.created_at || new Date().toISOString(),
        is_read: lastMsg?.sender_wallet_address === currentAddress ? true : lastMsg?.is_read || false
      };
    });

    setChats(chatPreviews);
  }, [currentAddress]);

  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const PAGE_SIZE = 10;

  const fetchMessages = useCallback(async (otherAddress: string, beforeTimestamp?: string) => {
    if (!currentAddress) return;

    let data: Message[] | null = null;
    const rpcResult = await supabase
      .rpc('get_conversation_messages', {
        p_current_user: currentAddress,
        p_other_user: otherAddress,
        p_limit: PAGE_SIZE,
        p_before: beforeTimestamp || null
      });

    if (rpcResult.error) {
      const e = rpcResult.error;
      console.warn(
        `[inbox/fetchMessages] RPC get_conversation_messages failed — falling back. ` +
        `code=${e.code} message=${e.message} details=${e.details} hint=${e.hint}`
      );

      let q = supabase
        .from('direct_messages')
        .select('id, sender_wallet_address, receiver_wallet_address, text, created_at, is_read')
        .or(
          `and(sender_wallet_address.eq.${currentAddress},receiver_wallet_address.eq.${otherAddress}),` +
          `and(sender_wallet_address.eq.${otherAddress},receiver_wallet_address.eq.${currentAddress})`
        )
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (beforeTimestamp) q = q.lt('created_at', beforeTimestamp);

      const fallback = await q;
      if (fallback.error) {
        const fe = fallback.error;
        console.error(
          `[inbox/fetchMessages] Fallback failed. ` +
          `code=${fe.code} message=${fe.message} details=${fe.details} hint=${fe.hint}`
        );
      } else {
        data = fallback.data as Message[];
      }
    } else {
      data = (rpcResult.data || []) as Message[];
    }

    if (data) {
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
        .eq('wallet_address', otherAddress)
        .single();

      if (profile) {
        setOtherUser(profile);
      }

      // Mark as read
      await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('sender_wallet_address', otherAddress)
        .eq('receiver_wallet_address', currentAddress);
      
      setTimeout(fetchConversations, 500);
    }
  }, [currentAddress, fetchConversations]);

  const loadMoreMessages = async () => {
    if (!activeChatAddress || !hasMore || isLoadingMore || messages.length === 0) return;
    setIsLoadingMore(true);
    await fetchMessages(activeChatAddress, messages[0].created_at);
    setIsLoadingMore(false);
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeChatAddress) {
      setMessages([]);
      setHasMore(true);
      fetchMessages(activeChatAddress);
    }
  }, [activeChatAddress, fetchMessages]);

  // Keep latest activeChatAddress / fetchConversations accessible to the
  // realtime handler WITHOUT forcing the subscription to tear down and
  // re-subscribe every time the user clicks a different conversation.
  // Resubscribing rapidly on the same channel name caused Supabase to drop
  // events, which is why messages only appeared after a manual refresh.
  const activeChatRef = useRef(activeChatAddress);
  useEffect(() => { activeChatRef.current = activeChatAddress; }, [activeChatAddress]);

  const fetchConversationsRef = useRef(fetchConversations);
  useEffect(() => { fetchConversationsRef.current = fetchConversations; }, [fetchConversations]);

  // Real-time subscription — one channel per signed-in wallet, lifetime tied
  // to currentAddress only.
  useEffect(() => {
    if (!currentAddress) return;

    const channel = supabase
      .channel(`inbox-realtime:${currentAddress}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_wallet_address=eq.${currentAddress}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // ONLY add to UI if it's from the person I'm currently chatting with
          if (activeChatRef.current === newMsg.sender_wallet_address) {
            setMessages(prev => {
              // Prevent duplicate messages
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
          fetchConversationsRef.current();
        }
      )
      .subscribe((status, err) => {
        // Surfaces SUBSCRIBED / CHANNEL_ERROR / TIMED_OUT / CLOSED. If you
        // ever see anything other than SUBSCRIBED here, realtime is not
        // enabled on `public.direct_messages` in the Supabase dashboard
        // (Database → Replication → supabase_realtime) or RLS is blocking
        // the anon role from SELECTing the row.
        if (status !== 'SUBSCRIBED') {
          console.warn(`[inbox-realtime] status=${status}`, err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentAddress]);

  const handleSendMessage = async (text: string) => {
    if (!currentAddress || !activeChatAddress) return;

    const { data, error } = await supabase
      .rpc('send_direct_message', {
        p_sender_wallet_address: currentAddress,
        p_receiver_wallet_address: activeChatAddress,
        p_text: text
      });

    if (error) {
      console.error(
        `[inbox/handleSendMessage] RPC send_direct_message failed. ` +
        `code=${error.code} message=${error.message} details=${error.details} hint=${error.hint}`
      );
      return;
    }

    // RPC may return a single row or SETOF — accept both.
    const inserted: Message | undefined = Array.isArray(data) ? data[0] : data;
    if (inserted && inserted.id) {
      setMessages(prev => prev.find(m => m.id === inserted.id) ? prev : [...prev, inserted]);
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

  const handleSelectChat = async (walletAddress: string) => {
    const nextAddress = walletAddress.toLowerCase();
    setActiveChatAddress(nextAddress);
    setIsMobileChatOpen(true);
    // If it's a new chat (not in current list), we need to fetch profile first
    const existingChat = chats.find(c => c.other_user_wallet_address === nextAddress);
    if (!existingChat) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('username, display_name, avatar_url, wallet_address')
        .eq('wallet_address', nextAddress)
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
            activeChatAddress={activeChatAddress} 
            onSelectChat={handleSelectChat} 
          />
        </div>
      </div>

      {/* Main Chat Area - Flexible width, internal scroll managed by ChatWindow */}
      <div className={`${isMobileChatOpen ? 'block' : 'hidden md:block'} flex-1 h-full relative overflow-hidden bg-[#050507]`}>
        <ChatWindow 
          messages={messages} 
          currentUserId={currentAddress || ''} 
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
