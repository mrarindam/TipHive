'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Camera, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Rocket, XCircle, Globe, Copy, Check } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);

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
        if (!res.ok) {
          throw new Error(`Auth API failed: ${res.status}`);
        }
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
      if (!res.ok) {
        throw new Error(`Check username API failed: ${res.status}`);
      }
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
      const links = {
        twitter: twitter.startsWith('http') ? twitter : (twitter ? `https://x.com/${twitter.replace('@', '')}` : ''),
        github: github.startsWith('http') ? github : (github ? `https://github.com/${github}` : ''),
        discord: discord.startsWith('http') ? discord : (discord ? `https://discord.com/users/${discord}` : ''),
        website: website.startsWith('http') ? website : (website ? `https://${website}` : ''),
      };

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
          is_creator: true,
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
    <div className="fixed inset-0 z-[100] bg-[#0b0b0f] overflow-y-auto overflow-x-hidden">


      <AnimatePresence mode="wait">

        {/* STEP 1: SPLIT SCREEN LAYOUT */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row min-h-screen w-full"
          >
            {/* Left Side: Full Screen Image Content */}
            <div className="hidden lg:block w-1/2 bg-black overflow-hidden h-screen sticky top-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="w-full h-full"
              >
                <img
                  src="/images/username.webp"
                  alt="Onboarding"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>


            {/* Mobile Background: Fullscreen with blur and overlay */}
            <div className="lg:hidden absolute inset-0 z-0">
              <img
                src="/images/username.webp"
                alt="Background"
                className="w-full h-full object-cover object-center blur-[3px] scale-110"
              />
              <div className="absolute inset-0 bg-black/70" />
            </div>

            {/* Right Side: Form Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 lg:p-20 relative z-10">

              {/* Progress for Step 1 */}
              <div className="absolute top-10 right-10 lg:top-12 lg:right-12 flex items-center gap-3">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">Step 1 of 2</span>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f7931a] shadow-[0_0_10px_#f7931a]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                </div>
              </div>

              <div className="w-full max-w-[540px] space-y-12">
                <div className="space-y-6 text-center lg:text-left">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none uppercase">
                    Create Your<span className="text-[#f7931a]"> USERNAME</span>
                  </h1>
                  <p className="text-slate-400 text-lg lg:text-xl font-medium">This will be your public creator page.</p>
                </div>


                <div className="space-y-6">
                  <div className={`bg-slate-100 bg-white/[0.02] border border-white/[0.06] p-10 rounded-[2.5rem] backdrop-blur-md transition-all duration-300 ${usernameAvailable === false ? 'border-red-500/30' : ''}`}>
                    <div className={`flex items-center w-full bg-black/60 border rounded-2xl focus-within:ring-4 transition-all overflow-hidden group ${usernameAvailable === false
                      ? 'border-red-500/50 focus-within:ring-red-500/10 animate-shake'
                      : usernameAvailable === true
                        ? 'border-green-500/50 focus-within:ring-green-500/10'
                        : 'border-white/10 focus-within:ring-[#f7931a]/20 focus-within:border-[#f7931a]'
                      }`}>
                      <div className="pl-6 pr-2 flex items-center bg-slate-100 bg-white/[0.02] h-[80px] self-stretch border-r border-white/5 whitespace-nowrap">
                        <span className="text-slate-500 font-bold text-lg">{origin.replace(/^https?:\/\//, '')}/</span>
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="flex-1 bg-transparent py-6 px-5 text-2xl text-white focus:outline-none font-black placeholder:text-slate-800 h-[80px]"
                        placeholder="username"
                      />
                    </div>

                    <div className="mt-5 h-6 flex items-center px-2">
                      {isCheckingUsername ? (
                        <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
                          <Loader2 className="w-4 h-4 animate-spin text-[#f7931a]" />
                          Verifying...
                        </div>
                      ) : username.length < 3 ? (
                        <div className="text-slate-600 text-sm font-bold uppercase tracking-widest">
                          Minimum 3 characters
                        </div>
                      ) : usernameAvailable === true ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-green-500 text-sm font-black uppercase tracking-widest">
                          <CheckCircle2 className="w-4 h-4" /> Available
                        </motion.div>
                      ) : usernameAvailable === false ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-500 text-sm font-black uppercase tracking-widest">
                          <XCircle className="w-4 h-4" /> Already taken
                        </motion.div>
                      ) : null}
                    </div>

                    {usernameAvailable && username.length >= 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-10 pt-8 border-t border-white/5"
                      >
                        <p className="text-xs text-slate-500 mb-3 font-black uppercase tracking-[0.2em]">Your public URL</p>
                        <div className="bg-[#f7931a]/5 border border-[#f7931a]/20 rounded-2xl p-5 flex items-center justify-between">
                          <span className="text-[#f7931a] text-lg font-black truncate">
                            {origin.replace(/^https?:\/\//, '')}/{username}
                          </span>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_15px_#22c55e]" />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!usernameAvailable || username.length < 3 || isCheckingUsername}
                      className="group relative flex items-center gap-3 bg-[#f7931a] text-black px-10 py-5 rounded-full font-black text-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-[0_20px_40px_rgba(247,147,26,0.2)]"
                    >
                      Next Step
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: PROFILE SETUP SPLIT LAYOUT (35/65) */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row min-h-screen w-full relative"
          >
            {/* Left Side: 35% Full Screen Image Content */}
            <div className="hidden lg:block lg:w-[35%] bg-black overflow-hidden h-screen sticky top-0 border-r border-white/5">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="w-full h-full"
              >
                <img
                  src="/images/newUserprofile.webp"
                  alt="Profile Setup"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>

            {/* Mobile Background for Step 2 */}
            <div className="lg:hidden absolute inset-0 z-0">
              <img
                src="/images/newUserprofile.webp"
                alt="Background"
                className="w-full h-full object-cover object-center blur-[3px] scale-110"
              />
              <div className="absolute inset-0 bg-black/70" />
            </div>

            {/* Right Side: 65% Form Content */}
            <div className="flex-1 lg:w-[65%] flex flex-col items-center justify-center p-6 md:p-12 lg:p-16 relative z-10">
              {/* Progress for Step 2 */}
              <div className="absolute top-6 right-6 lg:top-12 lg:right-12 flex items-center gap-3">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">Step 2 of 2</span>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f7931a] shadow-[0_0_10px_#f7931a]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f7931a] shadow-[0_0_10px_#f7931a]" />
                </div>
              </div>

              <div className="w-full max-w-[640px] space-y-8 pt-12 lg:pt-0">
                <div className="text-center lg:text-left space-y-3">
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
                    Complete Your <span className="text-[#f7931a]">Profile</span>
                  </h1>
                  <p className="text-slate-400 text-base md:text-lg font-medium">Add details to help supporters know you better.</p>
                </div>


                <div className="bg-slate-100 bg-white/[0.02] border border-white/[0.06] p-6 md:p-10 rounded-[2.5rem] backdrop-blur-md space-y-8">

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
                      <div className="text-center mt-4 text-sm font-bold text-slate-400 group-hover:text-white transition-colors">
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
                        <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 ml-1 mb-2 block">Display Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:ring-4 focus:ring-[#f7931a]/20 focus:border-[#f7931a] transition-all text-lg font-bold"
                          placeholder="Your Name"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 ml-1 mb-2 block">About (Bio) <span className="text-red-500">*</span></label>
                        <textarea
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:ring-4 focus:ring-[#f7931a]/20 focus:border-[#f7931a] transition-all resize-none text-lg font-medium"
                          placeholder="What are you creating?"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="pt-8 border-t border-white/5 space-y-6">
                    <h3 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 ml-1 mb-2 block">Connect Socials <span className="text-slate-600 font-normal lowercase">(Optional)</span></h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-[#f7931a]/30 transition-all text-sm font-bold"
                        placeholder="Twitter (@handle)"
                      />
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-[#f7931a]/30 transition-all text-sm font-bold"
                        placeholder="GitHub Username"
                      />
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-[#f7931a]/30 transition-all text-sm font-bold"
                        placeholder="Website URL"
                      />
                      <input
                        type="text"
                        value={discord}
                        onChange={(e) => setDiscord(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-[#f7931a]/30 transition-all text-sm font-bold"
                        placeholder="Discord ID"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="group w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-all hover:bg-white/5"
                    title="Back to Step 1"
                  >
                    <ChevronLeft className="w-7 h-7 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                  <button
                    onClick={submitProfile}
                    disabled={!displayName || !bio || !avatarUrl || isSubmitting}
                    className="group relative flex items-center gap-3 bg-[#f7931a] text-black px-12 py-5 rounded-full font-black text-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-[0_20px_40px_rgba(247,147,26,0.2)]"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Rocket className="w-6 h-6" />}
                    {isSubmitting ? 'Finalizing...' : 'Launch My Page'}
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: PREMIUM SUCCESS LAYOUT */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6"
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src="/images/congo.webp"
                alt="Celebration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
              
              {/* Animated Glows */}
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
            </div>

            <div className="relative z-10 w-full max-w-[640px] flex flex-col items-center text-center">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="space-y-4 mb-10"
              >
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
                  Welcome to <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
                    TipHive Creator Era
                  </span>
                </h1>
                <p className="text-slate-300 text-lg md:text-xl font-medium max-w-[500px] mx-auto">
                  Your identity is now live on the network. Share your link, accept tips, and grow your audience.
                </p>
              </motion.div>

              {/* Glassmorphic Link Card */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", damping: 15 }}
                className="w-full bg-white/[0.03] border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-2xl shadow-2xl space-y-8"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500">Your Public Link</span>
                  <div className="relative group">
                    <div className="flex items-center bg-black/60 border border-white/10 rounded-2xl p-4 md:p-5 gap-4 transition-all group-hover:border-purple-500/50 group-hover:bg-black/80">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                        <Globe className="w-6 h-6 md:w-7 md:h-7" />
                      </div>
                      <div className="flex-1 text-left overflow-hidden">
                        <p className="text-white font-black text-lg md:text-xl truncate">
                          {origin.replace(/^https?:\/\//, '')}/<span className="text-purple-400">{username}</span>
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${origin}/${username}`);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all font-black uppercase tracking-wider text-xs md:text-sm ${
                          copied 
                            ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                  <span className="text-green-500 font-black text-xs md:text-sm uppercase tracking-[0.3em]">
                    Live on Network
                  </span>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12"
              >
                <Link
                  href="/dashboard"
                  className="group relative flex items-center gap-3 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white px-14 py-6 rounded-full font-black text-xl md:text-2xl transition-all hover:scale-105 hover:shadow-[0_20px_60px_rgba(124,58,237,0.4)] active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                >
                  <Rocket className="w-7 h-7 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
                  Go to Dashboard
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

