'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWalletAuth } from '@/lib/wallet-auth-shim';
import {
  Home,
  LayoutDashboard,
  Users,
  Calendar,
  Edit3,
  Settings,
  UserCog,
  Wallet,
  History,
  TrendingUp,
  Heart,
  Bookmark,
  BookOpen,
} from 'lucide-react';
interface UserProfile {
  username?: string;
  avatar_url?: string;
  name?: string;
  display_name?: string;
  wallet_address?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { ready, authenticated, user, login } = useWalletAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAuthenticated = mounted && authenticated;

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

    const handleProfileUpdate = (event: Event) => {
      const detail = (event as CustomEvent<UserProfile>).detail;
      const matchAddress = user?.id && detail?.wallet_address && detail.wallet_address.toLowerCase() === user.id.toLowerCase();
      if (matchAddress) {
        setProfile(detail);
      } else {
        loadProfile();
      }
    };

    window.addEventListener('wallet-profile-updated', handleProfileUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener('wallet-profile-updated', handleProfileUpdate);
    };
  }, [ready, authenticated, user?.id]);

  // Do not render sidebar on embed pages or post writing pages
  if (pathname?.startsWith('/embed/') || pathname?.includes('/createposts')) {
    return null;
  }

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/dashboard') return pathname === '/dashboard' || pathname?.startsWith('/dashboard?');
    return pathname === href || pathname?.startsWith(href + '/');
  };

  interface SidebarItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    auth?: boolean;
    target?: string;
  }

  interface SidebarSection {
    title: string;
    items: SidebarItem[];
  }

  const sections: SidebarSection[] = [
    {
      title: 'Main Menu',
      items: [
        { name: 'Home', href: '/', icon: <Home size={18} /> },
      ],
    },
    {
      title: 'Creator Suite',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} />, auth: true },
        { name: 'Tip Circles', href: '/tipcircle', icon: <Users size={18} />, auth: true },
        { name: 'Subscriptions', href: '/subscriptions', icon: <Calendar size={18} />, auth: true },
        { name: 'Posting', href: '/posts', icon: <Edit3 size={18} />, auth: true },
      ],
    },
    {
      title: 'Activity & Logs',
      items: [
        { name: 'Activity Feed', href: '/activityfeed', icon: <History size={18} />, auth: true },
        { name: 'Analytics', href: '/earninganalysis', icon: <TrendingUp size={18} />, auth: true },
        { name: 'Sent Support', href: '/sentsupport', icon: <Heart size={18} />, auth: true },
        { name: 'My Subscriptions', href: '/mysubsriptions', icon: <Bookmark size={18} />, auth: true },
      ],
    },
    {
      title: 'Settings',
      items: [
        { name: 'Visual Toolkit', href: '/visual-toolkit', icon: <Settings size={18} />, auth: true },
        { name: 'Edit Profile', href: '/editprofile', icon: <UserCog size={18} />, auth: true },
      ],
    },
    {
      title: 'Resources',
      items: [
        { name: 'Docs', href: '/docs', icon: <BookOpen size={18} />, target: '_blank' },
      ],
    },
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed top-0 left-0 h-screen bg-white/95 dark:bg-[#050508]/95 backdrop-blur-lg border-r border-slate-200 dark:border-white/5 z-[130] hidden lg:flex flex-col justify-between select-none transition-all duration-300 ease-in-out ${
        isHovered ? 'w-64 shadow-xl dark:shadow-[20px_0_40px_rgba(0,0,0,0.8)] border-slate-200 dark:border-white/10' : 'w-[76px] shadow-none'
      }`}
    >
      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar">
        {/* Logo Section */}
        <div className={`flex items-center border-b border-slate-200 dark:border-white/5 shrink-0 transition-all duration-300 ${
          isHovered ? 'px-5.5 h-20 gap-3 justify-start' : 'px-0 h-20 justify-center mx-auto'
        }`}>
          <Link href="/" className="flex items-center gap-3.5 group">
            <img
              src="/logo.png"
              alt="TipHive"
              className={`transition-all duration-300 group-hover:rotate-12 shrink-0 ${
                isHovered ? 'w-10 h-10' : 'w-9 h-9'
              }`}
            />
            <span className={`text-xl font-black tracking-tighter text-slate-800 dark:text-white font-outfit uppercase transition-all duration-300 select-none ${
              isHovered
                ? 'opacity-100 max-w-[200px] ml-1'
                : 'opacity-0 max-w-0 overflow-hidden ml-0 pointer-events-none'
            }`}>
              TIP<span className="text-[#F7931A]">HIVE</span>
            </span>
          </Link>
        </div>

        {/* Navigation items wrapper */}
        <div className={`space-y-6 py-6 transition-all duration-300 ${isHovered ? 'px-4' : 'px-3'}`}>
          {sections.map((section, sIdx) => (
            <div key={section.title} className="space-y-1">
              {sIdx > 0 && <div className={`border-t border-slate-200 dark:border-white/5 transition-all duration-300 ${isHovered ? 'my-4' : 'my-2'}`} />}
              <span className={`text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2 block transition-all duration-300 px-3 truncate ${
                isHovered
                  ? 'opacity-100 max-h-5 overflow-visible'
                  : 'opacity-0 max-h-0 overflow-hidden mb-0'
              }`}>
                {section.title}
              </span>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = isLinkActive(item.href);
                  const needsAuth = item.auth && !showAuthenticated;

                  return (
                    <Link
                      key={item.name}
                      href={needsAuth ? '#' : item.href}
                      target={item.target}
                      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                      onClick={(e) => {
                        if (needsAuth) {
                          e.preventDefault();
                          login();
                        }
                      }}
                      className={`group relative flex items-center rounded-xl transition-all duration-300 border border-transparent ${
                        isHovered
                          ? 'w-full px-3.5 py-2.5 justify-start'
                          : 'w-11 h-11 justify-center px-0 py-0 mx-auto'
                      } ${
                        isActive
                          ? 'bg-[#f7931a] text-black shadow-[0_0_20px_rgba(247,147,26,0.3)]'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.03] hover:border-slate-200 dark:hover:border-white/5'
                      }`}
                    >
                      <span className={`shrink-0 flex items-center justify-center transition-transform duration-300 ${isHovered ? 'scale-100' : 'scale-110'} ${isActive ? 'text-black' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors'}`}>
                        {item.icon}
                      </span>
                      <span className={`transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-black uppercase tracking-wider select-none ${
                        isHovered
                          ? 'opacity-100 max-w-[200px] ml-3.5'
                          : 'opacity-0 max-w-0 overflow-hidden ml-0 pointer-events-none'
                      }`}>
                        {item.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className={`mt-auto space-y-4 shrink-0 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#050508]/95 transition-all duration-300 ${
        isHovered ? 'p-4' : 'p-3'
      }`}>
        {showAuthenticated ? (
          <Link
            href={profile?.username ? `/${profile.username}` : '#'}
            className={`group flex items-center rounded-xl transition-all duration-300 border border-transparent ${
              isHovered
                ? 'w-full px-3.5 py-3 justify-start'
                : 'w-11 h-11 justify-center px-0 py-0 mx-auto'
            } ${
              pathname === `/${profile?.username}`
                ? 'bg-[#f7931a] text-black shadow-[0_0_20px_rgba(247,147,26,0.3)]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.03] hover:border-slate-200 dark:hover:border-white/5'
            }`}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-white/10 shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#f7931a]/20 border border-[#f7931a]/50 flex items-center justify-center text-[11px] font-black text-[#f7931a] shrink-0">
                {profile?.username ? profile.username[0].toUpperCase() : 'P'}
              </div>
            )}
            <div className={`truncate flex-1 text-left transition-all duration-300 ${
              isHovered
                ? 'opacity-100 max-w-[200px] ml-3.5'
                : 'opacity-0 max-w-0 overflow-hidden ml-0 pointer-events-none'
            }`}>
              <span className="block truncate text-slate-800 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white leading-tight font-black">
                {profile?.display_name || profile?.name || 'Profile'}
              </span>
              <span className="block text-[9px] text-slate-500 font-bold lowercase truncate tracking-normal">
                @{profile?.username || 'creator'}
              </span>
            </div>
          </Link>
        ) : (
          <div className="relative">
            {/* Collapsed Wallet Connect Icon */}
            <button
              onClick={login}
              title="Connect Wallet"
              className={`flex items-center justify-center rounded-xl bg-[#f7931a] hover:bg-[#e08215] text-white transition-all duration-300 shadow-[0_0_20px_rgba(247,147,26,0.2)] active:scale-95 cursor-pointer w-11 h-11 mx-auto ${
                isHovered ? 'opacity-0 scale-75 pointer-events-none absolute inset-0' : 'opacity-100 scale-100'
              }`}
            >
              <Wallet size={18} />
            </button>

            {/* Expanded Wallet Connect Card */}
            <div className={`bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl transition-all duration-300 space-y-3 ${
              isHovered ? 'p-4 opacity-100 scale-100 static' : 'p-0 opacity-0 scale-95 h-0 overflow-hidden absolute pointer-events-none'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-[#f7931a]">
                <Wallet size={18} />
              </div>
              <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 leading-normal uppercase tracking-wide">
                Sign in with your wallet to access dashboard metrics, vault loans, and custom tools.
              </p>
              <button
                onClick={login}
                className="w-full py-2.5 bg-[#f7931a] hover:bg-[#e08215] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(247,147,26,0.2)] active:scale-95 cursor-pointer"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
