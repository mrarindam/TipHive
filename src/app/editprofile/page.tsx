'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useWalletAuth } from '@/lib/wallet-auth-shim';
import {
  AtSign,
  ExternalLink,
  Loader2,
  Pencil,
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
  const { ready, authenticated, user, getAccessToken } = useWalletAuth();
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

  const hasChanges = (() => {
    if (!profile) return false;
    if (avatarFile !== null || bannerFile !== null) return true;

    const socialLinksMatch = (() => {
      const formSocials = formData.social_links.filter(url => url.trim() !== '');
      const profileSocials = Array.isArray(profile.social_links) ? profile.social_links : [];
      if (formSocials.length !== profileSocials.length) return false;
      return formSocials.every((val, index) => val === profileSocials[index]);
    })();

    return (
      formData.username !== (profile.username || '') ||
      formData.display_name !== (profile.display_name || '') ||
      formData.bio !== (profile.bio || '') ||
      formData.avatar_url !== (profile.avatar_url || '') ||
      formData.banner_url !== (profile.banner_url || '') ||
      formData.creator_description !== (profile.creator_description || '') ||
      formData.location !== (profile.location || '') ||
      !socialLinksMatch
    );
  })();

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
        const res = await fetch(`/api/auth?wallet=${address || user?.id || ''}`, {
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

    // Validation logic
    if (formData.username.length < 3 || formData.username.length > 15) {
      return alert('Username must be between 3 and 15 characters.');
    }
    if (formData.display_name.length < 3 || formData.display_name.length > 20) {
      return alert('Display name must be between 3 and 20 characters.');
    }
    if (formData.creator_description && (formData.creator_description.length < 6 || formData.creator_description.length > 50)) {
      return alert('Headline must be between 6 and 50 characters.');
    }
    if (formData.bio && (formData.bio.length < 10 || formData.bio.length > 300)) {
      return alert('About me must be between 10 and 300 characters.');
    }

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
          wallet_address: address || user?.id || null,
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
      setFormData({
        username: data.profile?.username || '',
        display_name: data.profile?.display_name || '',
        bio: data.profile?.bio || '',
        avatar_url: data.profile?.avatar_url || '',
        banner_url: data.profile?.banner_url || '',
        social_links: Array.isArray(data.profile?.social_links) ? data.profile.social_links : [],
        creator_description: data.profile?.creator_description || '',
        location: data.profile?.location || '',
      });
      setAvatarFile(null);
      setBannerFile(null);
      window.dispatchEvent(new CustomEvent('wallet-profile-updated', { detail: data.profile }));
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
    return <div className="min-h-[70vh] bg-transparent" />;
  }

  if (!authenticated) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 shadow-2xl shadow-orange-500/10">
          <UserRound className="h-10 w-10 text-[#F7931A]" />
        </div>
        <h1 className="font-outfit text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Gateway Locked</h1>
        <p className="mt-4 max-w-lg text-lg font-medium text-slate-500 dark:text-slate-400">
          You must be logged in to access your universal profile.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="h-[520px] animate-pulse rounded-[2rem] border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 pt-28 pb-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between w-full">
        <div>
          <h1 className="font-outfit text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
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

      <div className="w-full">
        <section className="glass-card p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7931A]/15 text-[#F7931A]">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-outfit text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Profile Settings</h2>
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
                  maxLength={15}
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
                maxLength={12}
                required
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Avatar">
                <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 p-4 transition hover:border-[#F7931A]/50">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                  />
                  <div className="flex items-center gap-3">
                    {avatarFile ? (
                      <img
                        src={URL.createObjectURL(avatarFile)}
                        alt="Preview"
                        className="h-10 w-10 rounded-xl object-cover border border-[#F7931A]/30 shrink-0"
                      />
                    ) : formData.avatar_url ? (
                      <img
                        src={formData.avatar_url}
                        alt="Current Avatar"
                        className="h-10 w-10 rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-[#F7931A] shrink-0">
                        <Upload className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-black text-slate-950 dark:text-white truncate max-w-[120px]">{avatarFile ? avatarFile.name : 'Change Avatar'}</p>
                    </div>
                  </div>
                </div>
              </Field>

              <Field label="Banner">
                <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 p-4 transition hover:border-[#F7931A]/50">
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
                    {bannerFile ? (
                      <img
                        src={URL.createObjectURL(bannerFile)}
                        alt="Preview"
                        className="h-8 w-24 rounded-xl object-cover border border-[#F7931A]/30 shrink-0"
                      />
                    ) : formData.banner_url ? (
                      <img
                        src={formData.banner_url}
                        alt="Current Banner"
                        className="h-8 w-24 rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-[#F7931A] shrink-0">
                        <Upload className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-black text-slate-950 dark:text-white truncate max-w-[120px]">{bannerFile ? 'New Banner' : 'Change Banner'}</p>
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
                  maxLength={50}
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
                maxLength={300}
                placeholder="Tell your supporters more about yourself..."
              />
            </Field>

            <div className="pt-6 border-t border-slate-200 dark:border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Connect Socials</h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Optional</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-400">
                    <svg viewBox="0 0 24 24" className="w-full h-full fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </div>
                  <input
                    type="text"
                    value={twitterVal}
                    onChange={(e) => updateSpecificSocial('x.com', e.target.value, 'https://x.com/')}
                    className="profile-input pl-12 text-sm"
                    placeholder="@handle"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-400">
                    <svg viewBox="0 0 24 24" className="w-full h-full fill-current"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  </div>
                  <input
                    type="text"
                    value={githubVal}
                    onChange={(e) => updateSpecificSocial('github.com', e.target.value, 'https://github.com/')}
                    className="profile-input pl-12 text-sm"
                    placeholder="username"
                  />
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-400">
                    <svg viewBox="0 0 24 24" className="w-full h-full fill-current"><path d="M19.27 2.33a22.9 22.9 0 0 0-5.77-1.8 15.7 15.7 0 0 0-.82 1.68 21.6 21.6 0 0 0-6.36 0 15.7 15.7 0 0 0-.82-1.68 22.9 22.9 0 0 0-5.77 1.8A24.6 24.6 0 0 0 .25 19.34a23.3 23.3 0 0 0 7.14 3.59 18 18 0 0 0 1.5-2.43 15.3 15.3 0 0 1-3.4-1.66 11.4 11.4 0 0 0 .28-.22 16.5 16.5 0 0 0 12.46 0c.1 0 .19.14.28.22a15.3 15.3 0 0 1-3.4 1.66 18 18 0 0 0 1.5 2.43 23.3 23.3 0 0 0 7.14-3.59 24.6 24.6 0 0 0-3.38-17.01ZM8.24 16.63c-1.37 0-2.5-1.26-2.5-2.81s1.11-2.81 2.5-2.81 2.5 1.26 2.5 2.81-1.11 2.81-2.5 2.81Zm7.52 0c-1.37 0-2.5-1.26-2.5-2.81s1.11-2.81 2.5-2.81 2.5 1.26 2.5 2.81-1.11 2.81-2.5 2.81Z"/></svg>
                  </div>
                  <input
                    type="text"
                    value={discordVal}
                    onChange={(e) => updateSpecificSocial('discord.com', e.target.value, 'https://discord.com/users/')}
                    className="profile-input pl-12 text-sm"
                    placeholder="ID"
                  />
                </div>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-400" />
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
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 dark:text-slate-400" />
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
                  className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all w-full justify-center"
                >
                  <LinkIcon className="w-3 h-3" /> Add extra social link
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || !hasChanges}
              className={`btn-primary flex w-full items-center justify-center gap-3 py-5 text-lg shadow-[0_20px_40px_rgba(247,147,26,0.2)] transition-all duration-300 ${
                (!hasChanges || saving)
                  ? 'opacity-40 cursor-not-allowed filter grayscale shadow-none hover:translate-y-0'
                  : ''
              }`}
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {saving ? 'Saving Profile...' : 'Save Profile'}
            </button>
          </form>
        </section>
      </div>


      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-md"
          >
            <div className="bg-white/90 dark:bg-[#111113]/90 backdrop-blur-2xl border border-[#F7931A]/30 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(247,147,26,0.2)] flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-[#F7931A] flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                <ShieldCheck className="w-8 h-8 text-black" />
              </div>
              <div className="flex-1">
                <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-tight text-xl">Profile Saved</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">Changes are now live!</p>
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
