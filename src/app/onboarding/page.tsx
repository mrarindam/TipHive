'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Camera, CheckCircle2, ChevronRight, Loader2, Rocket, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [origin, setOrigin] = useState('');
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [discord, setDiscord] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    
    if (!isConnected || !address) {
      router.replace('/');
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/auth?wallet=${address}`);
        const data = await res.json();
        if (data?.user) {
          if (data.user.is_creator === true) {
            router.replace('/dashboard');
            return;
          }
          setProfile(data.user);
          // Do not prepopulate username and display name if they haven't completed onboarding
          setUsername('');
          setDisplayName('');
          setAvatarUrl(data.user.avatar_url || '');
          setBio('');
          setWebsite(data.user.social_links?.website || '');
          setTwitter(data.user.social_links?.twitter || '');
          setGithub(data.user.social_links?.github || '');
          setDiscord(data.user.social_links?.discord || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [address, isConnected, router]);

  const checkUsername = useCallback(async (val: string) => {
    if (!val || val.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setIsCheckingUsername(true);
    try {
      const res = await fetch(`/api/profile/check-username?username=${encodeURIComponent(val)}`);
      const data = await res.json();
      
      // If the available username is actually our own current username, it's valid
      if (!data.available && profile?.username === val) {
        setUsernameAvailable(true);
      } else {
        setUsernameAvailable(data.available);
      }
    } catch (err) {
      console.error(err);
      setUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  }, [profile]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      checkUsername(username);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [username, checkUsername]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitProfile = async () => {
    if (!address) return;
    setIsSubmitting(true);
    try {
      // Build social links array
      const links: string[] = [];
      if (twitter) links.push(twitter.startsWith('http') ? twitter : `https://x.com/${twitter.replace('@', '')}`);
      if (github) links.push(github.startsWith('http') ? github : `https://github.com/${github}`);
      if (discord) links.push(discord.startsWith('http') ? discord : `https://discord.com/users/${discord}`);
      if (website) links.push(website.startsWith('http') ? website : `https://${website}`);

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          username,
          display_name: displayName,
          bio,
          avatar_url: avatarUrl,
          social_links: links,
          enable_creator: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to complete profile');

      setStep(3); // Success step
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to complete profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0b0b0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#f7931a]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#0b0b0f] overflow-y-auto">
      {/* Ambient glowing backgrounds */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#f7931a]/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#8b5cf6]/20 blur-[120px]" />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-6">
        
        {/* Progress Indicator */}
        {step < 3 && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-slate-500">
              <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-[#f7931a] shadow-[0_0_10px_#f7931a]' : 'bg-white/20'}`} />
              <div className="w-12 h-px bg-white/20 relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-[#f7931a] transition-all duration-500" 
                  style={{ width: step >= 2 ? '100%' : '0%' }}
                />
              </div>
              <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-[#f7931a] shadow-[0_0_10px_#f7931a]' : 'bg-white/20'}`} />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Step {step} of 2</span>
          </div>
        )}

        <div className="w-full max-w-[540px] relative z-10">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: USERNAME */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Choose your username
                  </h1>
                  <p className="text-slate-400 text-lg">This will be your public creator page.</p>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.08] p-8 rounded-3xl backdrop-blur-sm">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                      <span className="text-slate-500 font-medium text-lg">{origin.replace(/^https?:\/\//, '')}/</span>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 pl-[calc(1.25rem+10ch)] pr-6 text-xl text-white focus:outline-none focus:ring-2 focus:ring-[#f7931a] focus:border-[#f7931a] transition-all font-bold placeholder:text-slate-700"
                      placeholder="username"
                    />
                  </div>

                  <div className="mt-4 h-6 flex items-center px-2">
                    {isCheckingUsername ? (
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking availability...
                      </div>
                    ) : username.length < 3 ? (
                      <div className="text-slate-500 text-sm font-medium">
                        Minimum 3 characters
                      </div>
                    ) : usernameAvailable === true ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-500 text-sm font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Available
                      </motion.div>
                    ) : usernameAvailable === false ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-500 text-sm font-bold">
                        <XCircle className="w-4 h-4" /> Already taken
                      </motion.div>
                    ) : null}
                  </div>

                  {usernameAvailable && username.length >= 3 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 pt-6 border-t border-white/5"
                    >
                      <p className="text-sm text-slate-400 mb-2 font-medium">Your page will be live at:</p>
                      <div className="bg-[#f7931a]/10 border border-[#f7931a]/30 rounded-xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(247,147,26,0.1)]">
                        <span className="text-[#f7931a] font-bold truncate">
                          {origin}/{username}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!usernameAvailable || username.length < 3 || isCheckingUsername}
                    className="group relative flex items-center gap-2 bg-[#f7931a] text-black px-8 py-4 rounded-full font-black text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    Next Step
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 rounded-full shadow-[0_0_20px_#f7931a] opacity-50 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PROFILE SETUP */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Complete your page
                  </h1>
                  <p className="text-slate-400 text-lg">Add details to help supporters know you better.</p>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.08] p-6 md:p-8 rounded-3xl backdrop-blur-sm space-y-8">
                  
                  {/* Avatar Upload */}
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-dashed border-white/20 overflow-hidden flex items-center justify-center relative transition-colors group-hover:border-[#f7931a]/50 shadow-xl">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                        ) : (
                          <Camera className="w-8 h-8 text-slate-500 group-hover:text-[#f7931a] transition-colors" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="text-center mt-4 text-sm font-medium text-slate-400 group-hover:text-white transition-colors">
                        Upload photo
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                    
                    <div className="flex-1 w-full space-y-6">
                      <div>
                        <label className="text-xs font-bold tracking-widest uppercase text-slate-500 ml-1 mb-2 block">Display Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-[#f7931a] focus:border-[#f7931a] transition-all text-lg"
                          placeholder="Your Name"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold tracking-widest uppercase text-slate-500 ml-1 mb-2 block">About (Bio) <span className="text-red-500">*</span></label>
                        <textarea
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-[#f7931a] focus:border-[#f7931a] transition-all resize-none text-lg"
                          placeholder="What are you creating?"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="pt-8 border-t border-white/5 space-y-6">
                    <h3 className="text-sm font-bold text-white mb-4">Connect Socials <span className="text-slate-500 font-normal">(Optional)</span></h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#f7931a] transition-all text-sm"
                          placeholder="Twitter (@handle)"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={github}
                          onChange={(e) => setGithub(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#f7931a] transition-all text-sm"
                          placeholder="GitHub Username"
                        />
                      </div>
                      <div>
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#f7931a] transition-all text-sm"
                          placeholder="Website URL"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={discord}
                          onChange={(e) => setDiscord(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#f7931a] transition-all text-sm"
                          placeholder="Discord ID"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="text-slate-400 hover:text-white font-bold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={submitProfile}
                    disabled={!displayName || !bio || !avatarUrl || isSubmitting}
                    className="group relative flex items-center gap-2 bg-[#f7931a] text-black px-8 py-4 rounded-full font-black text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                    {isSubmitting ? 'Creating...' : 'Create My Page 🚀'}
                    <div className="absolute inset-0 rounded-full shadow-[0_0_20px_#f7931a] opacity-50 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SUCCESS */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="text-center space-y-8"
              >
                <div className="w-24 h-24 mx-auto bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    Your creator page is live! 🎉
                  </h1>
                  <p className="text-slate-400 text-lg">You can now start accepting Bitcoin tips natively.</p>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-2xl backdrop-blur-sm inline-block">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Your public link</p>
                  <a 
                    href={`/${username}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xl md:text-2xl font-black text-[#f7931a] hover:underline"
                  >
                    {origin}/{username}
                  </a>
                </div>

                <div className="pt-8">
                  <Link 
                    href="/dashboard"
                    className="inline-flex items-center gap-2 bg-white text-black px-10 py-5 rounded-full font-black text-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                  >
                    Go to Dashboard
                    <ChevronRight className="w-6 h-6" />
                  </Link>
                </div>
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
