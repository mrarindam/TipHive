'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

import { useAccount } from 'wagmi';
import { Rocket, Upload, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterCreator() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    bio: '',
    category: 'Developer',
    link: ''
  });
  const [file, setFile] = useState<File | null>(null);

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const checkUsername = async (username: string) => {
    if (!username) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    const { data } = await supabase
      .from('creators')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();
    
    setUsernameStatus(data ? 'taken' : 'available');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return alert('Please connect your wallet');
    if (usernameStatus === 'taken') return alert('Username is already taken');
    if (usernameStatus === 'checking') return;
    
    setLoading(true);
    try {
      let avatarUrl = '';
      
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${address}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('tipmusd')
          .upload(fileName, file);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('tipmusd')
          .getPublicUrl(fileName);
          
        avatarUrl = publicUrl;
      }

      const { error } = await supabase.from('creators').insert({
        address: address?.toLowerCase(),
        username: formData.username.toLowerCase(),
        name: formData.name,
        bio: formData.bio,
        category: formData.category,
        link: formData.link,
        avatar_url: avatarUrl,
        total_earned: 0
      });

      if (error) throw error;
      setSuccess(true);
      const profileSlug = formData.username || address;
      setTimeout(() => router.push(`/profile/${profileSlug}`), 2000);
    } catch (err) {
      console.error(err);
      alert('Registration failed. Make sure your wallet isn\'t already registered.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto py-32 text-center">
        <div className="bg-green-500/20 p-8 rounded-3xl border border-green-500/30">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Welcome aboard!</h2>
          <p className="text-slate-400">Redirecting to your new profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-white mb-4 font-outfit uppercase tracking-tighter">
          Join the <span className="text-[#F7931A]">Economy</span>
        </h1>
        <p className="text-slate-400 text-lg">Start receiving Bitcoin-backed tips from your fans today.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Username</label>
          <div className="relative">
            <input 
              required
              type="text" 
              placeholder="e.g. satochinakamoto"
              className={`w-full bg-white/5 border ${
                usernameStatus === 'taken' ? 'border-red-500' : 
                usernameStatus === 'available' ? 'border-green-500' : 'border-white/10'
              } rounded-xl py-4 px-6 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none transition-all`}
              value={formData.username}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                setFormData({ ...formData, username: val });
                checkUsername(val);
              }}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {usernameStatus === 'checking' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {usernameStatus === 'available' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {usernameStatus === 'taken' && <span className="text-xs text-red-500 font-bold">Taken</span>}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Your profile link: http://localhost:3000/profile/{formData.username || 'username'}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Display Name</label>
          <input 
            required
            type="text" 
            placeholder="e.g. Satoshi Nakamoto"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none transition-all"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Category</label>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none transition-all appearance-none"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Developer" className="bg-[#1a1a1a]">Developer</option>
              <option value="Artist" className="bg-[#1a1a1a]">Artist</option>
              <option value="Writer" className="bg-[#1a1a1a]">Writer</option>
              <option value="Musician" className="bg-[#1a1a1a]">Musician</option>
              <option value="Designer" className="bg-[#1a1a1a]">Designer</option>
              <option value="Content Creator" className="bg-[#1a1a1a]">Content Creator</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Website/Social</label>
            <input 
              type="url" 
              placeholder="https://"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none transition-all"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Bio</label>
          <textarea 
            rows={4}
            placeholder="Tell your fans what you're building..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 text-white focus:ring-2 focus:ring-[#F7931A] focus:outline-none transition-all resize-none"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Avatar</label>
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="w-full bg-white/5 border-2 border-dashed border-white/10 rounded-xl py-12 flex flex-col items-center justify-center group-hover:border-[#F7931A]/50 transition-all">
              <Upload className="w-8 h-8 text-slate-500 mb-4 group-hover:text-[#F7931A]" />
              <p className="text-slate-400 font-medium">{file ? file.name : 'Click to upload profile picture'}</p>
              <p className="text-xs text-slate-600 mt-2">Max size: 5MB (JPG, PNG)</p>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading || !isConnected}
          className="w-full btn-primary py-5 text-xl flex items-center justify-center gap-3 disabled:bg-slate-800 disabled:text-slate-500"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Registering...
            </span>
          ) : (
            <>
              <Rocket className="w-6 h-6" />
              Launch Profile
            </>
          )}
        </button>
        
        {!isConnected && (
          <p className="text-center text-red-500 text-sm font-bold">Connect your wallet to register</p>
        )}
      </form>
    </div>
  );
}
