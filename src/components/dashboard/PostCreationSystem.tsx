'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAccount } from 'wagmi';
import { Image as ImageIcon, Video, FileText, UploadCloud, X, Check, Globe2, Users, Lock, Tag, Save, Send, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import RichTextEditor from '@/components/ui/RichTextEditor';

interface PostCreationSystemProps {
  onSuccess?: () => void;
}

export default function PostCreationSystem({ onSuccess }: PostCreationSystemProps) {
  const { address } = useAccount();
  const [postType, setPostType] = useState<'text' | 'album' | 'video'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'supporters'>('public');
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');



  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        const optimizedUrl = data.url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
        setMediaUrl(optimizedUrl);
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Upload Error', err);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!address) return alert('Not connected');
    if (!title) return alert('Title is required');

    setStatus('saving');
    try {
      const { data: profile } = await supabase.from('user_profiles').select('id').eq('wallet_address', address.toLowerCase()).single();
      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase.from('posts').insert({
        creator_id: profile.id,
        title,
        content,
        image_url: postType !== 'video' ? mediaUrl : null,
        video_url: postType === 'video' ? mediaUrl : null,
        visibility,
        category,
      });

      if (error) throw error;

      setStatus('success');
      setTitle('');
      setContent('');
      setMediaUrl('');
      setCategory('');

      // Toast notification placeholder
      setTimeout(() => {
        setStatus('idle');
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="bg-[#0f0f14] border border-white/5 rounded-3xl p-6 md:p-8 relative">
      <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-4">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white flex-1">Create New Drop</h2>
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
          <button onClick={() => setPostType('text')} className={`p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${postType === 'text' ? 'bg-[#F7931A] text-black shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <FileText className="w-4 h-4" /> <span className="hidden sm:inline">Post</span>
          </button>
          <button onClick={() => setPostType('album')} className={`p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${postType === 'album' ? 'bg-[#8A2BE2] text-white shadow-[0_0_15px_rgba(138,43,226,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <ImageIcon className="w-4 h-4" /> <span className="hidden sm:inline">Album</span>
          </button>
          <button onClick={() => setPostType('video')} className={`p-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${postType === 'video' ? 'bg-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Video className="w-4 h-4" /> <span className="hidden sm:inline">Video</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 self-start">
          <RichTextEditor
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
          />

          {(postType === 'album' || postType === 'video') && (
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Media Upload</label>
              {!mediaUrl ? (
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative">
                  <input type="file" accept={postType === 'video' ? 'video/*' : 'image/*'} onChange={handleMediaUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <UploadCloud className="w-10 h-10 text-slate-500 mb-3" />
                  <p className="text-white font-bold mb-1">{isUploading ? 'Uploading to Cloudinary...' : 'Drag & Drop or Click to Upload'}</p>
                  <p className="text-xs text-slate-500">{postType === 'video' ? 'MP4, WebM up to 50MB' : 'JPG, PNG, GIF up to 10MB'}</p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video flex items-center justify-center">
                  {postType === 'video' ? (
                    <video src={mediaUrl} controls className="max-w-full max-h-full" />
                  ) : (
                    <Image src={mediaUrl} alt="Upload preview" fill className="object-contain" unoptimized />
                  )}
                  <button onClick={() => setMediaUrl('')} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors backdrop-blur-md">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Globe2 className="w-4 h-4" /> Visibility</label>
            <div className="space-y-2">
              {[{ id: 'public', label: 'Public', desc: 'Anyone can see this', icon: Globe2, color: 'text-green-400' },
              { id: 'followers', label: 'Followers Only', desc: 'People who follow you', icon: Users, color: 'text-blue-400' },
              { id: 'supporters', label: 'Supporters Only', desc: 'Paying members only', icon: Lock, color: 'text-[#F7931A]' }
              ].map(v => (
                <button key={v.id} onClick={() => setVisibility(v.id as 'public' | 'followers' | 'supporters')} className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${visibility === v.id ? 'border-[#F7931A] bg-[#F7931A]/10' : 'border-transparent hover:bg-white/5'}`}>
                  <div className={`p-2 rounded-lg bg-white/5 ${visibility === v.id ? v.color : 'text-slate-400'}`}>
                    <v.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-none">{v.label}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{v.desc}</p>
                  </div>
                  {visibility === v.id && <Check className="w-4 h-4 text-[#F7931A] ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-6">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Tag className="w-4 h-4" /> Custom Category</label>
            <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Type a category..." className="w-full bg-[#1A2234] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-[#F7931A] outline-none text-sm" />
          </div>


          <div className="pt-4 flex items-center gap-3">
            <button onClick={() => handleSave()} disabled={status !== 'idle'} className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm">
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button onClick={() => handleSave()} disabled={status !== 'idle'} className="flex-1 bg-[#F7931A] text-black font-black py-3 rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(247,147,26,0.3)] text-sm">
              {status === 'saving' ? <span className="animate-pulse">Publishing...</span> : status === 'success' ? <Check className="w-4 h-4" /> : <><Send className="w-4 h-4" /> Publish Now</>}
            </button>
          </div>
        </div>
      </div>

      {status === 'success' && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-6 right-6 bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-xl flex items-center gap-2 font-bold backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5" /> Drop Published Successfully!
        </motion.div>
      )}
    </div>
  );
}
