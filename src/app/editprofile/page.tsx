'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import {
  AtSign,
  Crown,
  ExternalLink,
  Loader2,
  Pencil,
  Rocket,
  Save,
  ShieldCheck,
  Upload,
  UserRound,
  Globe,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import BannerCropper from '@/components/profile/BannerCropper';


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
  social_links?: string[] | null;
  banner_url?: string | null;
  location?: string | null;
}

export default function ConnectedProfilePage() {
  const { address } = useAccount();
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [origin, setOrigin] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    avatar_url: '',
    banner_url: '',
    social_links: [] as string[],
    creator_description: '',
    location: '',
  });

  const [tempBannerUrl, setTempBannerUrl] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);


  useEffect(() => {
    if (!user?.id && !address) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    let cancelled = false;
    setTimeout(() => {
      if (!cancelled) setLoading(true);
    }, 0);

    const loadProfile = async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch(`/api/auth?did=${encodeURIComponent(user?.id || '')}&wallet=${address || ''}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (cancelled) return;
        const nextProfile = data.user || null;
        setProfile(nextProfile);
        setFormData({
          username: nextProfile?.username || '',
          display_name: nextProfile?.display_name || '',
          bio: nextProfile?.bio || '',
          avatar_url: nextProfile?.avatar_url || '',
          banner_url: nextProfile?.banner_url || '',
          social_links: Array.isArray(nextProfile?.social_links) ? nextProfile.social_links : [],
          creator_description: nextProfile?.creator_description || '',
          location: nextProfile?.location || '',
        });
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [address, user?.id, getAccessToken]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.id && !address) return;

    setSaving(true);
    try {
      let avatarUrl = formData.avatar_url;
      let bannerUrl = formData.banner_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop() || 'png';
        const fileName = `${user?.id || address?.toLowerCase()}-avatar-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('tipmusd').upload(fileName, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('tipmusd').getPublicUrl(fileName);
        avatarUrl = data.publicUrl;
      }

      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop() || 'png';
        const fileName = `${user?.id || address?.toLowerCase()}-banner-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('tipmusd').upload(fileName, bannerFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('tipmusd').getPublicUrl(fileName);
        bannerUrl = data.publicUrl;
      }

      const token = await getAccessToken();
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          privy_did: user?.id,
          wallet_address: address || null,
          username: formData.username,
          display_name: formData.display_name,
          bio: formData.bio,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
          social_links: formData.social_links.filter(url => url.trim() !== ''),
          is_creator: profile?.is_creator,
          creator_description: formData.creator_description,
          location: formData.location,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Profile update failed');
      setProfile(data.profile);
      window.dispatchEvent(new CustomEvent('wallet-profile-updated', { detail: data.profile }));
      setAvatarFile(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  // Helper to extract specific socials from the array
  const getSocialValue = (platform: string) => {
    const link = formData.social_links.find(l => l.toLowerCase().includes(platform));
    if (!link) return '';
    // Handle handle extraction
    if (platform === 'x.com' || platform === 'twitter.com' || platform === 'github.com' || platform === 'discord.com') {
      const parts = link.split('/');
      return parts[parts.length - 1] || '';
    }
    return link;
  };

  const updateSpecificSocial = (platform: string, value: string, baseUrl: string) => {
    const newLinks = [...formData.social_links];
    const index = newLinks.findIndex(l => l.toLowerCase().includes(platform));
    const fullUrl = value ? (value.startsWith('http') ? value : `${baseUrl}${value.replace('@', '')}`) : '';
    
    if (index >= 0) {
      if (fullUrl) newLinks[index] = fullUrl;
      else newLinks.splice(index, 1);
    } else if (fullUrl) {
      newLinks.push(fullUrl);
    }
    setFormData({ ...formData, social_links: newLinks });
  };

  const twitterVal = getSocialValue('x.com') || getSocialValue('twitter.com');
  const githubVal = getSocialValue('github.com');
  const discordVal = getSocialValue('discord.com');
  const websiteVal = formData.social_links.find(l => !l.includes('x.com') && !l.includes('twitter.com') && !l.includes('github.com') && !l.includes('discord.com')) || '';

  const extraLinks = formData.social_links.filter(l => 
    !l.includes('x.com') && !l.includes('twitter.com') && !l.includes('github.com') && !l.includes('discord.com')
  );

  if (!ready) {
    return <div className="min-h-[70vh] bg-black" />;
  }

  if (!authenticated) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/5 bg-white/5 shadow-2xl shadow-orange-500/10">
          <UserRound className="h-10 w-10 text-[#F7931A]" />
        </div>
        <h1 className="font-outfit text-5xl font-black uppercase tracking-tighter text-white">Gateway Locked</h1>
        <p className="mt-4 max-w-lg text-lg font-medium text-slate-400">
          You must be logged in to access your universal profile.
        </p>
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
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between max-w-4xl mx-auto">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#F7931A]/25 bg-[#F7931A]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#F7931A]">
            <ShieldCheck className="h-4 w-4" />
            Universal profile settings
          </p>
          <h1 className="font-outfit text-5xl font-black uppercase tracking-tighter text-white">
            Profile <span className="text-[#F7931A]">Settings</span>
          </h1>
        </div>
        {profile?.username && (
          <Link href={`/${profile.username}`} target="_blank" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-4">
            <ExternalLink className="h-4 w-4" />
            View Public Profile
          </Link>
        )}
      </div>

      <div className="mx-auto max-w-4xl">
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

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <p className="text-xs font-bold text-slate-600 italic">Live URL: <span className="text-[#F7931A]">{origin}/{formData.username || 'username'}</span></p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Avatar">
                <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/5 bg-white/5 p-4 transition hover:border-[#F7931A]/50">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#F7931A]">
                      <Upload className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white truncate max-w-[120px]">{avatarFile ? avatarFile.name : 'Change Avatar'}</p>
                    </div>
                  </div>
                </div>
              </Field>

              <Field label="Banner">
                <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/5 bg-white/5 p-4 transition hover:border-[#F7931A]/50">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setTempBannerUrl(reader.result as string);
                          setIsCropping(true);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#F7931A]">
                      <Upload className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white truncate max-w-[120px]">{bannerFile ? 'New Banner' : 'Change Banner'}</p>
                    </div>
                  </div>
                </div>
              </Field>
            </div>

            {isCropping && tempBannerUrl && (
              <BannerCropper
                image={tempBannerUrl}
                onCancel={() => {
                  setIsCropping(false);
                  setTempBannerUrl(null);
                }}
                onCropComplete={(croppedBlob) => {
                  const file = new File([croppedBlob], 'banner.jpg', { type: 'image/jpeg' });
                  setBannerFile(file);
                  setIsCropping(false);
                  setTempBannerUrl(null);
                }}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Headline">
                <input
                  value={formData.creator_description}
                  onChange={(event) => setFormData({ ...formData, creator_description: event.target.value })}
                  className="profile-input"
                  maxLength={100}
                  placeholder="e.g. Piano Player"
                />
              </Field>

              <Field label="Location">
                <input
                  value={formData.location}
                  onChange={(event) => setFormData({ ...formData, location: event.target.value })}
                  className="profile-input"
                  maxLength={100}
                  placeholder="e.g. New York, USA"
                />
              </Field>
            </div>

            <Field label="About me">
              <textarea
                value={formData.bio}
                onChange={(event) => setFormData({ ...formData, bio: event.target.value })}
                className="profile-input min-h-24 resize-none"
                maxLength={500}
                placeholder="Tell your supporters more about yourself..."
              />
            </Field>

            <div className="pt-6 border-t border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Connect Socials</h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Optional</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xs uppercase">X</span>
                  <input
                    type="text"
                    value={twitterVal}
                    onChange={(e) => updateSpecificSocial('x.com', e.target.value, 'https://x.com/')}
                    className="profile-input pl-10 text-sm"
                    placeholder="@handle"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-[10px] uppercase">GH</span>
                  <input
                    type="text"
                    value={githubVal}
                    onChange={(e) => updateSpecificSocial('github.com', e.target.value, 'https://github.com/')}
                    className="profile-input pl-12 text-sm"
                    placeholder="username"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-[10px] uppercase">DS</span>
                  <input
                    type="text"
                    value={discordVal}
                    onChange={(e) => updateSpecificSocial('discord.com', e.target.value, 'https://discord.com/users/')}
                    className="profile-input pl-10 text-sm"
                    placeholder="ID"
                  />
                </div>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="url"
                    value={websiteVal}
                    onChange={(e) => {
                      const newLinks = [...formData.social_links];
                      const index = newLinks.findIndex(l => !l.includes('x.com') && !l.includes('twitter.com') && !l.includes('github.com') && !l.includes('discord.com'));
                      if (index >= 0) {
                        if (e.target.value) newLinks[index] = e.target.value;
                        else newLinks.splice(index, 1);
                      } else if (e.target.value) {
                        newLinks.push(e.target.value);
                      }
                      setFormData({ ...formData, social_links: newLinks });
                    }}
                    className="profile-input pl-12 text-sm"
                    placeholder="Website URL"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Extra Links</p>
                {extraLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input
                      value={link}
                      onChange={(e) => {
                        const actualIndex = formData.social_links.indexOf(link);
                        const newLinks = [...formData.social_links];
                        newLinks[actualIndex] = e.target.value;
                        setFormData({ ...formData, social_links: newLinks });
                      }}
                      className="profile-input pl-12 pr-10 text-sm"
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const actualIndex = formData.social_links.indexOf(link);
                        const newLinks = formData.social_links.filter((_, i) => i !== actualIndex);
                        setFormData({ ...formData, social_links: newLinks });
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 font-black text-xl"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, social_links: [...formData.social_links, ''] })}
                  className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-xs font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all w-full justify-center"
                >
                  <LinkIcon className="w-3 h-3" /> Add extra social link
                </button>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary flex w-full items-center justify-center gap-3 py-5 text-lg shadow-[0_20px_40px_rgba(247,147,26,0.2)]">
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saving ? 'Saving Profile...' : 'Save Profile'}
            </button>
          </form>
        </section>
      </div>

      <section className="mx-auto max-w-4xl glass-card mt-8 overflow-hidden p-8 relative flex flex-col items-center justify-center text-center">
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
            : 'Send value directly to your favorite creators. No middlemen, no waiting periods.'}
        </p>
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="btn-primary flex items-center justify-center gap-3 py-4 px-8"
          >
            <Rocket className="h-5 w-5" />
            Go to Dashboard
          </Link>
        </div>
      </section>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-md"
          >
            <div className="bg-[#111113]/90 backdrop-blur-2xl border border-[#F7931A]/30 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(247,147,26,0.2)] flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-[#F7931A] flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                <ShieldCheck className="w-8 h-8 text-black" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-black uppercase tracking-tight text-xl">Profile Saved</h4>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Changes are now live!</p>
              </div>
              <button 
                onClick={() => setShowSuccess(false)}
                className="text-slate-500 hover:text-white transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
