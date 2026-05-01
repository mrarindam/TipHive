'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import {
  AtSign,
  BadgeCheck,
  Bitcoin,
  CheckCircle2,
  Copy,
  Crown,
  ExternalLink,
  Loader2,
  Pencil,
  Rocket,
  Save,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Wallet,
} from 'lucide-react';
import { ERC20_ABI, MUSD_ADDRESS, SUBSCRIPTION_ABI, SUBSCRIPTION_CONTRACT, TIPPING_ABI, TIPPING_CONTRACT } from '@/lib/contracts';
import MUSDLogo from '@/components/ui/MUSDLogo';
import { supabase } from '@/lib/supabase';

const ZERO = BigInt(0);

interface Profile {
  wallet_address: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_creator: boolean;
  creator_category?: string | null;
  creator_description?: string | null;
  total_earned?: number | null;
  social_links?: {
    twitter?: string;
    discord?: string;
    website?: string;
  } | null;
}

function shortAddress(address?: string) {
  if (!address) return '';
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

function money(value?: bigint) {
  if (!value) return '0.00';
  return Number(formatEther(value)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ConnectedProfilePage() {
  const { address, isConnected } = useAccount();
  const { data: nativeBalance } = useBalance({ address });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: '',
    twitter: '',
    discord: '',
    website: '',
    creator_category: 'Content Creator',
    creator_description: '',
  });

  const { data: musdBalance } = useReadContract({
    address: MUSD_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: Boolean(isConnected && address && MUSD_ADDRESS) },
  });

  const { data: tipBalance } = useReadContract({
    address: TIPPING_CONTRACT,
    abi: TIPPING_ABI,
    functionName: 'getCreatorBalance',
    args: [address as `0x${string}`],
    query: { enabled: Boolean(isConnected && address && TIPPING_CONTRACT) },
  });

  const { data: subBalance } = useReadContract({
    address: SUBSCRIPTION_CONTRACT,
    abi: SUBSCRIPTION_ABI,
    functionName: 'getCreatorEarnings',
    args: [address as `0x${string}`],
    query: { enabled: Boolean(isConnected && address && SUBSCRIPTION_CONTRACT) },
  });

  const claimable = useMemo(() => {
    const tipValue = typeof tipBalance === 'bigint' ? tipBalance : ZERO;
    const subValue = typeof subBalance === 'bigint' ? subBalance : ZERO;
    return tipValue + subValue;
  }, [tipBalance, subBalance]);


  useEffect(() => {
    if (!address) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    let cancelled = false;
    setTimeout(() => {
      if (!cancelled) setLoading(true);
    }, 0);

    fetch(`/api/auth?wallet=${address}`)
      .then((res) => res.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((data: any) => {
        if (cancelled) return;
        const nextProfile = data.user || null;
        setProfile(nextProfile);
        setFormData({
          username: nextProfile?.username || '',
          display_name: nextProfile?.display_name || '',
          bio: nextProfile?.bio || '',
          avatar_url: nextProfile?.avatar_url || '',
          twitter: nextProfile?.social_links?.twitter || '',
          discord: nextProfile?.social_links?.discord || '',
          website: nextProfile?.social_links?.website || '',
          creator_category: nextProfile?.creator_category || 'Content Creator',
          creator_description: nextProfile?.creator_description || '',
        });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  const avatar = profile?.avatar_url || `https://api.dicebear.com/9.x/shapes/svg?seed=${address}`;
  const displayName = profile?.display_name || 'Wallet profile';
  const totalAssets = Number(formatEther(musdBalance || ZERO)) + Number(formatEther(claimable));

  const copyWallet = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!address) return;

    setSaving(true);
    try {
      let avatarUrl = formData.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop() || 'png';
        const fileName = `${address.toLowerCase()}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('tipmusd')
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('tipmusd').getPublicUrl(fileName);
        avatarUrl = data.publicUrl;
      }

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          username: formData.username,
          display_name: formData.display_name,
          bio: formData.bio,
          avatar_url: avatarUrl,
          social_links: {
            twitter: formData.twitter,
            discord: formData.discord,
            website: formData.website,
          },
          enable_creator: profile?.is_creator,
          creator_category: formData.creator_category,
          creator_description: formData.creator_description,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Profile update failed');
      setProfile(data.profile);
      window.dispatchEvent(new CustomEvent('wallet-profile-updated', { detail: data.profile }));
      setAvatarFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/5 bg-white/5 shadow-2xl shadow-orange-500/10">
          <Wallet className="h-10 w-10 text-[#F7931A]" />
        </div>
        <h1 className="font-outfit text-5xl font-black uppercase tracking-tighter text-white">Connect Your Identity</h1>
        <p className="mt-4 max-w-lg text-lg font-medium text-slate-400">
          Your EVM wallet is your SuperPay profile. Connect once and the profile is created automatically.
        </p>
        <div className="mt-10">
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="h-[520px] animate-pulse rounded-[2rem] border border-white/5 bg-white/5" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#F7931A]/25 bg-[#F7931A]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#F7931A]">
            <ShieldCheck className="h-4 w-4" />
            Universal wallet profile
          </p>
          <h1 className="font-outfit text-5xl font-black uppercase tracking-tighter text-white">
            Wallet <span className="text-[#F7931A]">Profile</span>
          </h1>
        </div>
        {profile?.username && (
          <Link href={`/profile/${profile.username}`} className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-4">
            <ExternalLink className="h-4 w-4" />
            View Public Profile
          </Link>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="glass-card overflow-hidden">
          <div className="relative p-8">
            <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_20%_20%,rgba(247,147,26,0.32),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.26),transparent_30%),radial-gradient(circle_at_55%_0%,rgba(217,70,239,0.18),transparent_32%)]" />
            <div className="relative">
              <img src={avatar} alt="" className="mb-6 h-28 w-28 rounded-[2rem] border-4 border-black bg-white object-cover shadow-2xl shadow-black/40" />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-outfit text-4xl font-black uppercase tracking-tighter text-white">{displayName}</h2>
                    <BadgeCheck className="h-6 w-6 shrink-0 fill-cyan-400 text-black" />
                  </div>
                  <p className="mt-2 font-mono text-sm font-bold text-slate-400">{shortAddress(address)}</p>
                  {profile?.username && (
                    <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#F7931A]/25 bg-[#F7931A]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#F7931A]">
                      <AtSign className="h-3 w-3" />
                      {profile.username}
                    </p>
                  )}
                </div>
                <button onClick={copyWallet} type="button" className="rounded-2xl border border-white/5 bg-white/5 p-3 text-slate-300 transition hover:border-[#F7931A]/40 hover:text-[#F7931A]">
                  {copied ? <CheckCircle2 className="h-5 w-5 text-lime-400" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>

              <p className="mt-6 min-h-16 text-base font-medium leading-relaxed text-slate-300">
                {profile?.bio || 'No bio yet. Add a sharp little intro so people know who owns this wallet.'}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <MetricCard icon={<MUSDLogo className="h-5 w-5" />} label="MUSD" value={`$${money(musdBalance as bigint | undefined)}`} />
                <MetricCard icon={<Bitcoin className="h-5 w-5" />} label="BTC" value={nativeBalance ? Number(formatEther(nativeBalance.value)).toFixed(5) : '0.00000'} />
                <MetricCard icon={<Sparkles className="h-5 w-5" />} label="Claimable" value={`$${money(claimable)}`} />
                <MetricCard icon={<UserRound className="h-5 w-5" />} label="Total Assets" value={`$${totalAssets.toFixed(2)}`} />
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7931A]/15 text-[#F7931A]">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-outfit text-2xl font-black uppercase tracking-tighter text-white">Profile Settings</h2>
              <p className="text-sm font-medium text-slate-500">Update your off-chain metadata for this wallet.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Username">
              <div className="relative">
                <AtSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                <input
                  value={formData.username}
                  onChange={(event) => {
                    const username = event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    setFormData({ ...formData, username });
                  }}
                  className="profile-input pl-11"
                  maxLength={24}
                  required
                />
              </div>
              <p className="text-xs font-bold text-slate-600">Share URL: http://localhost:3000/profile/{formData.username || 'username'}</p>
            </Field>
            <Field label="Display name">
              <input
                value={formData.display_name}
                onChange={(event) => setFormData({ ...formData, display_name: event.target.value })}
                className="profile-input"
                maxLength={80}
                required
              />
            </Field>
            <Field label="Avatar">
              <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/5 bg-white/5 p-5 transition hover:border-[#F7931A]/50">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                />
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#F7931A]">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-white">{avatarFile ? avatarFile.name : 'Upload or change avatar'}</p>
                    <p className="text-sm font-medium text-slate-500">JPG, PNG, GIF from your device</p>
                  </div>
                </div>
              </div>
            </Field>
            <Field label="Bio">
              <textarea
                value={formData.bio}
                onChange={(event) => setFormData({ ...formData, bio: event.target.value })}
                className="profile-input min-h-28 resize-none"
                maxLength={280}
                placeholder="What are you building, collecting, or supporting?"
              />
            </Field>

            <button type="submit" disabled={saving} className="btn-primary flex w-full items-center justify-center gap-3 py-5 text-lg">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saving ? 'Saving Profile...' : 'Save Wallet Profile'}
            </button>
          </form>
        </section>
      </div>

      <section className="glass-card mt-8 overflow-hidden p-8 relative flex flex-col items-center justify-center text-center">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#F7931A]/10 blur-3xl" />
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7931A]/15 text-[#F7931A]">
          <Crown className="h-8 w-8" />
        </div>
        <h2 className="font-outfit text-3xl font-black uppercase tracking-tighter text-white">
          {profile?.is_creator ? 'Creator Profile' : 'Become a Creator'}
        </h2>
        <p className="mt-4 max-w-xl text-sm font-medium text-slate-500">
          {profile?.is_creator 
            ? 'Manage your creator page, categories, and subscription settings.' 
            : 'Send value directly to your favorite creators. No middlemen, no waiting periods. 100% of your tip goes straight into the creator&apos;s wallet in real-time using Bitcoin-backed stablecoins.'}
        </p>
        <div className="mt-8">
          <Link
            href="/register"
            className="btn-primary flex items-center justify-center gap-3 py-4 px-8"
          >
            <Rocket className="h-5 w-5" />
            {profile?.is_creator ? 'Edit Creator Profile' : 'Become Creator'}
          </Link>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/35 p-4">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#F7931A]">{icon}</div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-xl font-black text-white">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}
