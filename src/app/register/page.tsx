'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Rocket, CheckCircle2, Crown, Loader2, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterCreator() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const isAlreadyCreator = profile?.is_creator === true;
  const [formData, setFormData] = useState({
    creator_category: 'Developer',
    creator_description: '',
    twitter: '',
    discord: '',
    website: '',
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isConnected || !address) return alert('Please connect your wallet');
    if (!profile?.username) return alert('Your wallet profile is still loading');

    setLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          username: profile.username,
          display_name: profile.display_name,
          bio: profile.bio || '',
          avatar_url: profile.avatar_url,
          social_links: {
            twitter: formData.twitter,
            discord: formData.discord,
            website: formData.website,
          },
          is_creator: true,
          creator_category: formData.creator_category,
          creator_description: formData.creator_description,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Creator setup failed');

      // Create creator milestone notification via API
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: address.toLowerCase(),
            action: 'create',
            type: 'welcome',
            content: `Congratulations! You are now a verified Creator on TipHive. Time to share your profile! 🏆`,
          })
        });
      } catch (err) {
        console.error('Failed to create milestone notification:', err);
      }

      setSuccess(true);
      setTimeout(() => router.push(`/profile/${data.profile.username}`), 1200);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Creator setup failed';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!address) return;

    fetch(`/api/auth?wallet=${address}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) return;
        setProfile(data.user);
        setFormData({
          creator_category: data.user.creator_category || 'Developer',
          creator_description: data.user.creator_description || data.user.bio || '',
          twitter: data.user.social_links?.twitter || '',
          discord: data.user.social_links?.discord || '',
          website: data.user.social_links?.website || '',
        });
      })
      .catch(() => undefined);
  }, [address]);

  if (success) {
    return (
      <div className="w-full px-[5%] md:px-[8%] py-32 text-center">
        <div className="bg-green-500/20 p-8 rounded-3xl border border-green-500/30">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Creator profile enabled!</h2>
          <p className="text-slate-400">Redirecting to your public profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-[5%] md:px-[8%] py-20 pt-32">
      <div className="text-center mb-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#F7931A]/25 bg-[#F7931A]/10 text-[#F7931A]">
          <Crown className="h-7 w-7" />
        </div>
        <h1 className="text-5xl font-black text-white mb-4 font-outfit uppercase tracking-tighter">
          {isAlreadyCreator ? 'Already a' : 'Become'} <span className="text-[#F7931A]">Creator</span>
        </h1>
        <p className="text-slate-400 text-lg">
          {isAlreadyCreator 
            ? 'You have already enabled creator mode. You can update your settings below or go to your dashboard.' 
            : 'Your display name, username, avatar, and wallet stay from your main profile and you can edit everything later.'}
        </p>
        
        {isAlreadyCreator && (
          <div className="mt-8">
            <Link href="/dashboard" className="btn-primary px-8 py-4 inline-flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        {profile && (
          <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Current identity</p>
            <div className="mt-3 flex items-center gap-4">
              <img src={profile.avatar_url} alt="" className="h-14 w-14 rounded-2xl object-cover" />
              <div>
                <p className="text-xl font-black text-white">{profile.display_name}</p>
                <p className="text-sm font-bold text-[#F7931A]">@{profile.username}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Creator Category</label>
              <span className="text-xs font-medium text-slate-500">Select 1 to 3</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Developer', 'Artist', 'Writer', 'Musician', 'Designer', 'Content Creator', 'Community'].map((cat) => {
                const selectedCats = formData.creator_category.split(',').map(c => c.trim()).filter(Boolean);
                const isSelected = selectedCats.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      let newCats = [...selectedCats];
                      if (isSelected) {
                        if (newCats.length > 1) {
                          newCats = newCats.filter(c => c !== cat);
                        }
                      } else {
                        if (newCats.length < 3) {
                          newCats.push(cat);
                        }
                      }
                      setFormData({ ...formData, creator_category: newCats.join(', ') });
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                      isSelected 
                        ? 'bg-[#F7931A]/20 border-[#F7931A] text-[#F7931A]' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">X / Twitter</label>
            <input
              type="text"
              placeholder="@handle"
              className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-6 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none transition-all"
              value={formData.twitter}
              onChange={(event) => setFormData({ ...formData, twitter: event.target.value })}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Discord</label>
            <input
              type="text"
              placeholder="username"
              className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-6 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none transition-all"
              value={formData.discord}
              onChange={(event) => setFormData({ ...formData, discord: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Website</label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-6 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none transition-all"
              value={formData.website}
              onChange={(event) => setFormData({ ...formData, website: event.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Creator Description</label>
          <textarea
            rows={4}
            required
            placeholder="Tell supporters what you create..."
            className="w-full bg-white/5 border border-white/5 rounded-xl py-4 px-6 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none transition-all resize-none"
            value={formData.creator_description}
            onChange={(event) => setFormData({ ...formData, creator_description: event.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !isConnected}
          className="w-full btn-primary py-5 text-xl flex items-center justify-center gap-3 disabled:bg-slate-800 disabled:text-slate-500"
        >
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Rocket className="w-6 h-6" />}
          {loading ? 'Processing...' : isAlreadyCreator ? 'Update Settings' : 'Become Creator'}
        </button>

        {!isConnected && (
          <p className="text-center text-red-500 text-sm font-bold">Connect your wallet to continue</p>
        )}
      </form>
    </div>
  );
}
