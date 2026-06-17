'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletAuth } from '@/lib/wallet-auth-shim';
import {
  Home,
  LayoutDashboard,
  Settings,
  Gift,
  Users,
  Calendar,
  Edit3,
  History,
  TrendingUp,
  Heart,
  Bookmark,
  User,
  UserCog,
} from 'lucide-react';

interface SubLink {
  name: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}

interface FloatingLink {
  name: string;
  href?: string;
  icon: React.ReactNode;
  type: string;
  subLinks?: SubLink[];
}

interface UserProfile {
  username?: string;
  avatar_url?: string;
}

export default function FloatingDock() {
  const pathname = usePathname();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hoveredSubIdx, setHoveredSubIdx] = useState<number | null>(null);
  const [openRadialIdx, setOpenRadialIdx] = useState<number | null>(null);
  const { ready, authenticated, user, login } = useWalletAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Sync profile to get dynamic username
  useEffect(() => {
    if (!ready || !authenticated || !user?.id) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/auth?wallet=${user.id}&t=${Date.now()}`);
        const data = await res.json();
        if (cancelled) return;
        setProfile(data.user || null);
      } catch {
        // Silent fail
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [ready, authenticated, user?.id]);

  const links = [
    { name: 'Home', href: '/', icon: <Home className="w-6.5 h-6.5" />, type: 'direct' },
    {
      name: 'Dashboard',
      icon: <LayoutDashboard className="w-6.5 h-6.5" />,
      type: 'category',
      subLinks: [
        { name: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="w-6.5 h-6.5" strokeWidth={2.5} /> },
        { name: 'Referrals', href: '/dashboard/referrals', icon: <Gift className="w-6.5 h-6.5" strokeWidth={2.5} /> },
      ],
    },
    {
      name: 'Earn',
      icon: <CoinsIcon className="w-6.5 h-6.5" />,
      type: 'category',
      subLinks: [
        { name: 'Tip Circles', href: '/dashboard/tipcircle', icon: <Users className="w-6.5 h-6.5" strokeWidth={2.5} /> },
        { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: <Calendar className="w-6.5 h-6.5" strokeWidth={2.5} /> },
        { name: 'Posting', href: '/dashboard/posts', icon: <Edit3 className="w-6.5 h-6.5" strokeWidth={2.5} /> },
      ],
    },
    {
      name: 'Activity',
      icon: <History className="w-6.5 h-6.5" />,
      type: 'category',
      subLinks: [
        { name: 'Activity Feed', href: '/dashboard/activityfeed', icon: <History className="w-6.5 h-6.5" strokeWidth={2.5} /> },
        { name: 'Analytics', href: '/dashboard/earninganalysis', icon: <TrendingUp className="w-6.5 h-6.5" strokeWidth={2.5} /> },
        { name: 'Sent Support', href: '/dashboard/sentsupport', icon: <Heart className="w-6.5 h-6.5" strokeWidth={2.5} /> },
        { name: 'My Subscriptions', href: '/dashboard/mysubsriptions', icon: <Bookmark className="w-6.5 h-6.5" strokeWidth={2.5} /> },
      ],
    },
    {
      name: 'Settings',
      icon: <Settings className="w-6.5 h-6.5" />,
      type: 'category',
      subLinks: [
        { name: 'Visual Toolkit', href: '/dashboard/visual-toolkit', icon: <Settings className="w-6.5 h-6.5" strokeWidth={2.5} /> },
        { name: 'Edit Profile', href: '/editprofile', icon: <UserCog className="w-6.5 h-6.5" strokeWidth={2.5} /> },
      ],
    },
    {
      name: 'Profile',
      href: profile?.username ? `/${profile.username}` : '#',
      icon: authenticated ? (
        profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Profile"
            className="w-7 h-7 rounded-full object-cover border border-[#f7931a]/50 shadow-sm"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#f7931a]/20 border border-[#f7931a]/50 flex items-center justify-center text-xs font-black text-[#f7931a]">
            {profile?.username ? profile.username[0].toUpperCase() : 'P'}
          </div>
        )
      ) : (
        <User className="w-6.5 h-6.5" />
      ),
      type: authenticated ? 'direct' : 'auth-direct',
    },
  ];

  // Do not render floating dock on embed pages or post writing pages
  if (pathname?.startsWith('/embed/') || pathname?.includes('/dashboard/createposts')) {
    return null;
  }

  const isLinkActive = (link: FloatingLink) => {
    if (link.name === 'Profile' && profile?.username) {
      return pathname === `/${profile.username}` || pathname?.startsWith(`/${profile.username}/`);
    }
    if (link.type === 'direct' || link.type === 'auth-direct') {
      return pathname === link.href;
    }
    if (link.type === 'category' && link.subLinks) {
      return link.subLinks.some((sub: SubLink) => {
        if (sub.href === '/dashboard') {
          return pathname === '/dashboard';
        }
        return pathname === sub.href || (sub.href !== '#' && pathname?.startsWith(sub.href));
      });
    }
    return false;
  };

  const handleMainLinkClick = (e: React.MouseEvent, link: FloatingLink, idx: number) => {
    if (link.type === 'auth-direct') {
      if (!authenticated) {
        e.preventDefault();
        login();
      }
      return;
    }

    if (link.type === 'category') {
      e.preventDefault();
      setOpenRadialIdx(openRadialIdx === idx ? null : idx);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] flex items-center lg:hidden w-full">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        className="w-full flex items-center justify-around px-2 pt-2.5 pb-6 bg-white dark:bg-black border-t border-slate-200 dark:border-white/10 shadow-[0_-5px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-5px_25px_rgba(0,0,0,0.55)]"
      >
        {links.map((link, idx) => {
          const isActive = isLinkActive(link);
          const isCategory = link.type === 'category';

          return (
            <div
              key={link.name}
              className="relative flex items-center justify-center flex-1"
              onMouseEnter={() => isCategory && setOpenRadialIdx(idx)}
              onMouseLeave={() => isCategory && setOpenRadialIdx(null)}
            >
              <Link
                href={isCategory ? '#' : (link.href || '#')}
                className="relative w-14 h-14 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 flex items-center justify-center hover:scale-110 z-10 flex-shrink-0 p-0"
                onClick={(e) => handleMainLinkClick(e, link, idx)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Active Highlight Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeDockHighlight"
                    className="absolute inset-0 bg-[#F7931A] rounded-full shadow-[0_0_15px_rgba(247,147,26,0.4)] dark:shadow-[0_0_20px_rgba(247,147,26,0.6)] z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Icon Container */}
                <span className={`relative z-10 flex items-center justify-center ${isActive ? 'text-black font-bold' : ''}`}>
                  {link.icon}
                </span>

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredIdx === idx && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -50, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute px-3.5 py-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-xl whitespace-nowrap z-20 pointer-events-none"
                    >
                      {link.name}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>

              {/* Category-Specific Radial Arch Menu */}
              {isCategory && link.subLinks && (
                <AnimatePresence>
                  {openRadialIdx === idx && (
                    <div className="absolute bottom-1/2 left-1/2 w-0 h-0 pointer-events-none z-50">
                      {link.subLinks.map((sub: SubLink, subIdx: number) => {
                        const N = link.subLinks.length;
                        // Spacing calculations based on number of items to make it compact
                        let angle = 90;
                        if (N === 2) {
                          angle = 120 - subIdx * 60; // 120, 60
                        } else if (N === 3) {
                          angle = 135 - subIdx * 45; // 135, 90, 45
                        } else if (N >= 4) {
                          angle = 145 - subIdx * (110 / (N - 1)); // 145 to 35 range
                        }

                        const rad = (angle * Math.PI) / 180;
                        const radius = N >= 4 ? 120 : 105; // Slightly larger radius for larger buttons
                        const x = radius * Math.cos(rad);
                        const y = -radius * Math.sin(rad);

                        const isSubActive = pathname === sub.href;
                        const isSubHovered = hoveredSubIdx === subIdx;
                        const isAnySubHovered = hoveredSubIdx !== null;

                        return (
                          <motion.div
                            key={sub.name}
                            initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                            animate={{
                              x,
                              y,
                              opacity: isAnySubHovered ? (isSubHovered ? 1 : 0.6) : 1,
                              scale: isSubHovered ? 1.25 : 1,
                              zIndex: isSubHovered ? 60 : 50,
                              transition: {
                                type: 'spring',
                                stiffness: 320,
                                damping: 22,
                                delay: subIdx * 0.03,
                              },
                            }}
                            exit={{
                              x: 0,
                              y: 0,
                              opacity: 0,
                              scale: 0.5,
                              transition: {
                                duration: 0.2,
                                delay: (link.subLinks.length - 1 - subIdx) * 0.02,
                              },
                            }}
                            className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2"
                          >
                            <Link
                              href={sub.href}
                              onClick={(e) => {
                                setOpenRadialIdx(null);
                                if (sub.href === '#') {
                                  e.preventDefault();
                                  login();
                                }
                              }}
                              target={sub.href !== '#' && sub.external ? '_blank' : undefined}
                              className={`relative w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-2xl transition-all duration-300 ${isSubActive
                                  ? 'bg-[#F7931A] text-black border-[#e07f12] shadow-[0_0_20px_rgba(247,147,26,0.5)]'
                                  : 'bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-zinc-800 hover:border-[#F7931A] dark:hover:border-[#F7931A] shadow-lg'
                                }`}
                              onMouseEnter={() => setHoveredSubIdx(subIdx)}
                              onMouseLeave={() => setHoveredSubIdx(null)}
                            >
                              {sub.icon}

                              <AnimatePresence>
                                {isSubHovered && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 5, scale: 0.9 }}
                                    animate={{ opacity: 1, y: -40, scale: 1 }}
                                    exit={{ opacity: 0, y: 5, scale: 0.9 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute px-3 py-1.5 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-xl whitespace-nowrap pointer-events-none z-50"
                                  >
                                    {sub.name}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

// Custom CoinsIcon wrapper using lucide custom shapes
function CoinsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="8" cy="8" r="6" />
      <circle cx="18" cy="18" r="4" />
      <path d="M12 18a6 6 0 0 0-6-6" />
    </svg>
  );
}
