'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, BellRing, Info, Zap, Star, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';

interface Notification {
  id: string;
  type: 'welcome' | 'subscription' | 'tip' | 'like' | 'comment' | 'follow';
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const { address } = useAccount();
  const { authenticated, user, getAccessToken } = usePrivy();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const displayCount = unreadCount > 9 ? '9+' : unreadCount;

  const userId = user?.id;

  const fetchNotifications = useCallback(async () => {
    if (!authenticated || (!address && !userId)) return;
    try {
      const params = new URLSearchParams();
      if (address) params.set('wallet', address);
      if (userId) params.set('did', userId);
      const token = await getAccessToken();
      const res = await fetch(`/api/notifications?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error(`Notifications API failed: ${res.status}`);
      }
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [address, userId, authenticated, getAccessToken]);

  useEffect(() => {
    if (authenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [authenticated, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    // Use wallet if available, otherwise use privy_did
    const identifier = address || user?.id;
    if (!identifier) return;
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAccessToken()}`
        },
        body: JSON.stringify({ 
          wallet: address, 
          did: user?.id, 
          action: 'markAllRead' 
        }),
      });
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  if (!authenticated) return null;

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 text-[#F7931A] animate-pulse" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#F7931A] px-1 text-[10px] font-black text-white shadow-[0_0_12px_rgba(247,147,26,0.6)]">
            {displayCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-20 z-[150] w-[95vw] -translate-x-1/2 overflow-hidden rounded-b-[2rem] border border-white/5 bg-[#070707] text-white shadow-2xl shadow-black/60 backdrop-blur-3xl md:absolute md:left-auto md:right-0 md:top-full md:mt-3 md:w-[380px] md:translate-x-0 md:rounded-[2rem]"
          >
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Notifications</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  {unreadCount} Unread Messages
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-black text-[#F7931A] uppercase tracking-widest hover:text-white transition-colors"
                >
                  Mark All Read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {notifications.map((notification) => {
                    const displayType = notification.content.startsWith('❤️') ? 'like' : 
                                        notification.content.startsWith('💬') ? 'comment' :
                                        notification.content.startsWith('👤') ? 'follow' : 
                                        notification.type;
                    return (
                      <div
                        key={notification.id}
                        className={`p-5 transition-colors hover:bg-white/[0.03] relative ${
                          !notification.is_read ? 'bg-[#F7931A]/5' : ''
                        }`}
                      >
                        {!notification.is_read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F7931A]" />
                        )}
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            displayType === 'welcome' ? 'bg-blue-500/10 text-blue-400' :
                            displayType === 'tip' ? 'bg-[#F7931A]/10 text-[#F7931A]' :
                            displayType === 'like' ? 'bg-red-500/10 text-red-400' :
                            displayType === 'comment' ? 'bg-green-500/10 text-green-400' :
                            displayType === 'follow' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-purple-500/10 text-purple-400'
                          }`}>
                            {displayType === 'welcome' ? <Info className="w-5 h-5" /> :
                             displayType === 'tip' ? <Zap className="w-5 h-5" /> :
                             displayType === 'like' ? <Heart className="w-5 h-5" /> :
                             displayType === 'comment' ? <MessageCircle className="w-5 h-5" /> :
                             displayType === 'follow' ? <UserPlus className="w-5 h-5" /> :
                             <Star className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-300 leading-relaxed">
                              {notification.content}
                            </p>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2">
                              {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 px-6 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <Bell className="w-8 h-8 text-slate-700" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">All caught up! No new notifications.</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">End of feed</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
