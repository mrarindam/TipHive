'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, BellRing, Info, Zap, Star, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletAuth } from '@/lib/wallet-auth-shim';

interface Notification {
  id: string;
  type: 'welcome' | 'subscription' | 'tip' | 'like' | 'comment' | 'follow';
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const { ready, authenticated, user } = useWalletAuth();
  const address = user?.wallet?.address;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.is_read !== true).length;
  const displayCount = unreadCount > 9 ? '9+' : unreadCount;

  const fetchNotifications = useCallback(async (isLoadMore = false) => {
    if (!ready || !authenticated || !address) return;
    if (isLoadMore) setLoading(true);
    
    try {
      const currentOffset = isLoadMore ? offset + 10 : 0;
      const params = new URLSearchParams();
      if (address) params.set('wallet', address);
      params.set('limit', '10');
      params.set('offset', currentOffset.toString());

      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Notifications API failed: ${res.status}`);
      }
      const data = await res.json();
      
      if (data.notifications) {
        const newNotifications = data.notifications;
        
        if (isLoadMore) {
          setNotifications(prev => {
            // Filter out any duplicates just in case
            const existingIds = new Set(prev.map(n => n.id));
            const filteredNew = newNotifications.filter((n: Notification) => !existingIds.has(n.id));
            return [...prev, ...filteredNew];
          });
          setOffset(currentOffset);
        } else {
          setNotifications(prev => {
            // If polling, merge with existing notifications to preserve those loaded via "Load More"
            const notificationById = new Map(prev.map(n => [n.id, n]));
            newNotifications.forEach((notification: Notification) => {
              notificationById.set(notification.id, notification);
            });
            return Array.from(notificationById.values()).sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          });
        }

        if (newNotifications.length < 10) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      if (isLoadMore) setLoading(false);
    }
  }, [address, authenticated, offset, ready]);

  const handleLoadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    fetchNotifications(true);
  };

  useEffect(() => {
    if (ready && authenticated && address) {
      fetchNotifications();
      const interval = setInterval(() => fetchNotifications(false), 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [address, authenticated, fetchNotifications, ready]);

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
    if (!address) return;
    setMarkingRead(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          wallet: address, 
          action: 'markAllRead' 
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Notifications API failed: ${res.status}`);
      }

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setOffset(0);
      await fetchNotifications(false);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingRead(false);
    }
  };

  if (!ready) {
    return (
      <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl animate-pulse">
        <div className="w-5 h-5" />
      </div>
    );
  }
  if (!authenticated || !address) return null;

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
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed left-1/2 top-20 z-[150] w-[95vw] -translate-x-1/2 overflow-hidden rounded-b-[2rem] border border-white/5 bg-[#070707] text-white shadow-2xl shadow-black/60 backdrop-blur-3xl md:absolute md:left-auto md:right-0 md:top-full md:mt-3 md:w-[380px] md:translate-x-0 md:rounded-[2rem] transform-gpu"
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
                  disabled={markingRead}
                  className="text-[10px] font-black text-[#F7931A] uppercase tracking-widest hover:text-white transition-colors"
                >
                  {markingRead ? 'Marking...' : 'Mark All Read'}
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
                {hasMore ? (
                  <button 
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="text-[10px] font-black text-[#F7931A] uppercase tracking-[0.2em] hover:text-white transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Read More'}
                  </button>
                ) : (
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">End of feed</p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
