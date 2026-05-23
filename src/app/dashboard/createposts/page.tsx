'use client';

import { useState, useRef, useMemo, Suspense } from 'react';
import { useDashboard } from '../layout';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import UnderlineExt from '@tiptap/extension-underline';
import LinkExt from '@tiptap/extension-link';
import ImageExt from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { common, createLowlight } from 'lowlight';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Heading1, Heading2, Heading3, Quote, Code2, Link as LinkIcon, Unlink,
  Image as ImageIcon, Share2, Undo, Redo, Type, Highlighter, Eraser,
  X, Globe, Plus, UploadCloud, Loader2, Send, ChevronDown,
  Globe2, Users, Lock, Music2, FileAudio, Clapperboard
} from 'lucide-react';
import FileUploadProgress from '@/components/ui/FileUploadProgress';

const lowlight = createLowlight(common);

function EditorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postType = searchParams.get('type') || 'text';
  const { address, creatorProfile, getAccessToken } = useDashboard();
  
  const displayAddress = address || creatorProfile?.address;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'supporters'>('public');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [modalType, setModalType] = useState<'link' | 'image' | 'embed' | 'color' | null>(null);
  const [modalValue, setModalValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const [showVisibility, setShowVisibility] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const extensions = useMemo(() => [
    StarterKit.configure({
      codeBlock: false,
      heading: { 
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: 'heading-node',
        },
      },
    }),
    UnderlineExt,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    LinkExt.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'text-[#8A2BE2] underline cursor-pointer hover:text-[#F7931A] transition-colors font-bold' },
    }),
    ImageExt.configure({
      HTMLAttributes: { class: 'rounded-2xl border border-white/10 max-w-full h-auto my-6 shadow-2xl mx-auto block' },
    }),
    Youtube.configure({
      width: 840, height: 480,
      HTMLAttributes: { class: 'rounded-2xl max-w-full h-auto my-6 aspect-video w-full shadow-2xl' },
    }),
    CodeBlockLowlight.configure({
      lowlight, defaultLanguage: 'javascript',
      HTMLAttributes: { class: 'rounded-xl bg-[#011627] p-5 font-mono text-sm leading-relaxed my-6 border border-white/5' },
    }),
    Placeholder.configure({ placeholder: 'Start writing something amazing...' }),
  ], []);

  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    content: '',
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[60vh] text-slate-300 leading-relaxed selection:bg-[#8A2BE2]/30 prose-h1:text-5xl prose-h1:font-black prose-h1:text-white prose-h1:mb-8 prose-h2:text-4xl prose-h2:font-extrabold prose-h2:text-white prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:font-bold prose-h3:text-slate-100 prose-h3:mt-8 prose-h3:mb-4',
      },
    },
  });

  const { user } = useDashboard();

  const handlePublish = async () => {
    if (!title) return alert('Title is required');
    setStatus('saving');
    try {
      let profileQuery = supabase.from('user_profiles').select('id');
      
      if (address) {
        profileQuery = profileQuery.eq('wallet_address', address.toLowerCase());
      } else if (user?.id) {
        profileQuery = profileQuery.eq('wallet_address', user.id);
      } else {
        throw new Error('Authentication required');
      }

      const { data: profile } = await profileQuery.single();
      if (!profile) throw new Error('Profile not found');

      const postData: {
        creator_id: string;
        title: string;
        content: string;
        visibility: string;
        image_url?: string | null;
        video_url?: string | null;
        audio_url?: string | null;
      } = {
        creator_id: profile.id,
        title,
        content,
        visibility,
      };

      if (postType === 'album') postData.image_url = mediaUrl;
      if (postType === 'video' || postType === 'audio') postData.video_url = mediaUrl;

      const { error } = await supabase.from('posts').insert(postData);
      if (error) throw error;
      setStatus('success');
      setTimeout(() => router.push('/dashboard/posts'), 1500);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 100MB Limit Check
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_SIZE) {
      alert('Reach limit max 100MB. Please upload a smaller file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadFileName(file.name);
    
    try {
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

      // 1. Get Signature from our backend
      const signFormData = new FormData();
      signFormData.append('action', 'sign');
      signFormData.append('upload_preset', uploadPreset);
      
      const token = await getAccessToken();
      const signRes = await fetch('/api/upload', { 
        method: 'POST', 
        body: signFormData,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const signData = await signRes.json();
      
      if (!signRes.ok) throw new Error(signData.error || 'Failed to get upload signature');

      const { signature, timestamp, apiKey, cloudName } = signData;

      // 2. Upload directly to Cloudinary using the signature
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('upload_preset', uploadPreset);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      const result = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error?.message || 'Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });

      const data = result as { secure_url: string };
      if (data.secure_url) {
        // Apply optimizations from Cloudinary URL (q_auto, f_auto)
        const optimizedUrl = data.secure_url.replace('/upload/', '/upload/q_auto,f_auto/');
        setMediaUrl(optimizedUrl);
      }
    } catch (err) { 
      console.error(err);
      alert(err instanceof Error ? err.message : 'Upload failed.');
    } finally { 
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleModalSubmit = () => {
    if (!editor || !modalValue) return;
    if (modalType === 'link') editor.chain().focus().extendMarkRange('link').setLink({ href: modalValue }).run();
    else if (modalType === 'image') editor.chain().focus().setImage({ src: modalValue }).run();
    else if (modalType === 'embed') {
      if (modalValue.includes('youtube.com') || modalValue.includes('youtu.be')) editor.chain().focus().setYoutubeVideo({ src: modalValue }).run();
      else if (modalValue.includes('spotify.com')) {
        const embedUrl = modalValue.replace('open.spotify.com/', 'open.spotify.com/embed/');
        editor.chain().focus().insertContent(`<iframe src="${embedUrl}" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius:16px; margin: 1.5rem 0;"></iframe>`).run();
      }
    } else if (modalType === 'color') editor.chain().focus().setColor(modalValue).run();
    setModalType(null);
    setModalValue('');
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    // 10MB limit for inline images
    if (file.size > 10 * 1024 * 1024) {
      alert('Inline images must be under 10MB.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadFileName(file.name);

    try {
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

      // 1. Get Signature
      const signFormData = new FormData();
      signFormData.append('action', 'sign');
      signFormData.append('upload_preset', uploadPreset);
      
      const token = await getAccessToken();
      const signRes = await fetch('/api/upload', { 
        method: 'POST', 
        body: signFormData,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData.error || 'Failed to get signature');

      const { signature, timestamp, apiKey, cloudName } = signData;

      // 2. Direct Upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('upload_preset', uploadPreset);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      const result = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error?.message || 'Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(formData);
      });

      const data = result as { secure_url: string };
      if (data.secure_url) {
        // Apply optimizations (q_auto, f_auto, w_1200)
        const optimizedUrl = data.secure_url.replace('/upload/', '/upload/q_auto,f_auto,w_1200/');
        editor.chain().focus().setImage({ src: optimizedUrl }).run();
        setModalType(null);
      }
    } catch (err) { 
      console.error(err);
      alert(err instanceof Error ? err.message : 'Upload failed.');
    } finally { 
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  if (!editor) return null;

  const visibilityOptions = [
    { id: 'public', label: 'Public', desc: 'Anyone can see this', icon: Globe2, color: 'text-green-500' },
    { id: 'followers', label: 'Supporters Only', desc: 'Tippers and members can view', icon: Users, color: 'text-blue-400' },
    { id: 'supporters', label: 'Members Only', desc: 'Paying members only', icon: Lock, color: 'text-amber-500' },
  ];

  const currentVis = visibilityOptions.find(v => v.id === visibility)!;

  return (
    <div className="min-h-screen bg-[#080B12] flex flex-col">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#080B12]/95 backdrop-blur-xl border-b border-white/5 px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/posts')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-semibold text-sm"
            >
              <ArrowLeft size={18} />
              Dashboard
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Visibility Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowVisibility(!showVisibility)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
              >
                <currentVis.icon size={14} className={currentVis.color} />
                {currentVis.label}
                <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {showVisibility && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-[#111827] border border-white/10 rounded-xl shadow-2xl p-2 z-50"
                  >
                    {visibilityOptions.map(v => {
                      const isDisabled = v.id === 'supporters' && !displayAddress;
                      return (
                        <button
                          key={v.id}
                          disabled={isDisabled}
                          onClick={() => { setVisibility(v.id as 'public' | 'followers' | 'supporters'); setShowVisibility(false); }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${visibility === v.id ? 'bg-white/5' : 'hover:bg-white/5'} ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                        >
                          <v.icon size={16} className={v.color} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white flex items-center gap-2">
                              {v.label}
                              {isDisabled && <Lock size={12} className="text-amber-500" />}
                            </p>
                            <p className="text-xs text-slate-500">{isDisabled ? 'Wallet connection required' : v.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Publish Button */}
            <button
              onClick={handlePublish}
              disabled={status === 'saving' || !title}
              className="flex items-center gap-2 bg-[#F7931A] hover:bg-[#e8850f] text-white px-5 py-2 rounded-full font-bold text-sm transition-all disabled:opacity-50 shadow-lg shadow-[#F7931A]/20 hover:shadow-[#F7931A]/40"
            >
              {status === 'saving' ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
              Publish now
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="fixed top-14 left-0 right-0 z-40 bg-[#080B12]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[850px] mx-auto flex flex-wrap items-center gap-0.5 px-4 py-1.5">
          <div className="flex items-center gap-0.5 bg-white/5 p-1 rounded-xl mr-1">
            <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={<Bold size={15} />} />
            <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={<Italic size={15} />} />
            <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={<Underline size={15} />} />
            <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} icon={<Strikethrough size={15} />} />
          </div>

          <div className="flex items-center gap-0.5 bg-white/5 p-1 rounded-xl mr-1">
            <ToolBtn onClick={() => setModalType('color')} icon={<Type size={15} />} />
            <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} icon={<Highlighter size={15} />} />
            <ToolBtn onClick={() => editor.chain().focus().unsetAllMarks().setParagraph().run()} icon={<Eraser size={15} />} />
          </div>

          <div className="flex items-center gap-0.5 bg-white/5 p-1 rounded-xl mr-1">
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} icon={<Heading1 size={15} />} />
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} icon={<Heading2 size={15} />} />
            <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} icon={<Heading3 size={15} />} />
          </div>

          <div className="flex items-center gap-0.5 bg-white/5 p-1 rounded-xl mr-1">
            <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={<List size={15} />} />
            <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={<ListOrdered size={15} />} />
            <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} icon={<Quote size={15} />} />
            <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} icon={<Code2 size={15} />} />
          </div>

          <div className="flex items-center gap-0.5 bg-white/5 p-1 rounded-xl">
            <ToolBtn onClick={() => setModalType('link')} active={editor.isActive('link')} icon={<LinkIcon size={15} />} />
            <ToolBtn onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} icon={<Unlink size={15} />} />
            <ToolBtn onClick={() => setModalType('image')} icon={<ImageIcon size={15} />} />
            <ToolBtn onClick={() => setModalType('embed')} icon={<Share2 size={15} />} />
          </div>

          <div className="flex-grow" />
          
          <div className="flex items-center gap-0.5">
            <ToolBtn onClick={() => editor.chain().focus().undo().run()} icon={<Undo size={15} />} />
            <ToolBtn onClick={() => editor.chain().focus().redo().run()} icon={<Redo size={15} />} />
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 pt-28 pb-20 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 md:px-8 mt-10">
          
          {/* Media Upload Area */}
          {(postType === 'album' || postType === 'audio' || postType === 'video') && (
            <div className="mb-10">
              {mediaUrl ? (
                <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 group">
                  {postType === 'album' && <img src={mediaUrl} alt="Cover" className="w-full aspect-video object-cover" />}
                  {postType === 'video' && (
                    <video 
                      src={mediaUrl} 
                      controls 
                      className="w-full aspect-video"
                      controlsList="nodownload"
                    />
                  )}
                  {postType === 'audio' && (
                    <div className="p-10 flex flex-col items-center gap-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 relative">
                      <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                        <Music2 className="text-blue-400 w-12 h-12 relative z-10" />
                      </div>
                      <div className="text-center">
                        <p className="text-white font-black text-xl mb-1">Audio Track Uploaded</p>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">{uploadFileName || 'Track 01'}</p>
                      </div>
                      <audio 
                        src={mediaUrl} 
                        controls 
                        className="w-full h-12 mt-2 opacity-90 hover:opacity-100 transition-opacity" 
                      />
                    </div>
                  )}
                  <button 
                    onClick={() => setMediaUrl(null)}
                    className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => mediaInputRef.current?.click()}
                  className="w-full aspect-video md:aspect-[21/9] rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:bg-white/[0.08] transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5">
                    {postType === 'album' && <ImageIcon className="text-purple-400 w-8 h-8" />}
                    {postType === 'audio' && <FileAudio className="text-blue-400 w-8 h-8" />}
                    {postType === 'video' && <Clapperboard className="text-red-400 w-8 h-8" />}
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-lg">Click to upload {postType === 'album' ? 'Photo' : postType === 'audio' ? 'Audio' : 'Video'}</p>
                    <p className="text-slate-500 text-sm mt-1">High quality files recommended</p>
                  </div>
                  <input 
                    type="file" 
                    ref={mediaInputRef} 
                    onChange={handleMediaUpload} 
                    className="hidden" 
                    accept={postType === 'album' ? 'image/*' : postType === 'audio' ? 'audio/*' : 'video/*'} 
                  />
                </button>
              )}
            </div>
          )}

          {/* Title */}
          <textarea
            rows={1}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = 'auto';
              t.style.height = `${t.scrollHeight}px`;
            }}
            placeholder="Give it a title..."
            className="w-full bg-transparent text-white text-4xl md:text-6xl font-black focus:outline-none placeholder:text-slate-800 tracking-tighter resize-none overflow-hidden leading-tight mb-8"
          />

          {/* Divider */}
          <div className="w-20 h-1.5 bg-gradient-to-r from-[#F7931A] to-[#8A2BE2] rounded-full mb-10 opacity-50" />

          {/* Editor */}
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111827] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-black uppercase tracking-widest text-sm">
                  {modalType === 'link' ? 'Add Link' : modalType === 'image' ? 'Add Image' : modalType === 'color' ? 'Text Color' : 'Add Embed'}
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                {modalType === 'image' && (
                  <>
                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex flex-col items-center justify-center gap-3 w-full p-6 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-white overflow-hidden relative">
                      <>
                        <UploadCloud size={32} />
                        <span className="font-bold text-sm uppercase tracking-wide">Upload from gallery</span>
                      </>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleInlineImageUpload} className="hidden" accept="image/*" />
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                      <div className="relative flex justify-center text-[10px] font-black uppercase text-slate-600"><span className="bg-[#111827] px-4 tracking-widest">or paste url</span></div>
                    </div>
                  </>
                )}

                {modalType === 'color' && (
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {['#FFFFFF', '#8A2BE2', '#F7931A', '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#94A3B8'].map(c => (
                      <button key={c} onClick={() => { editor.chain().focus().setColor(c).run(); setModalType(null); }} className="w-full aspect-square rounded-xl border-2 border-white/5 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                )}

                {modalType !== 'color' && (
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Globe size={18} /></div>
                    <input
                      type="text" value={modalValue} onChange={(e) => setModalValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleModalSubmit()}
                      placeholder={modalType === 'link' ? 'https://example.com' : modalType === 'image' ? 'Paste image URL...' : 'Paste YouTube or Spotify URL...'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none font-medium"
                      autoFocus
                    />
                  </div>
                )}

                <button onClick={handleModalSubmit} className="w-full bg-[#8A2BE2] text-white font-black py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm shadow-xl shadow-[#8A2BE2]/20">
                  <Plus size={18} /> Add {modalType === 'link' ? 'Link' : modalType === 'image' ? 'Image' : modalType === 'color' ? 'Color' : 'Embed'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Global Upload Progress Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <FileUploadProgress 
                progress={uploadProgress} 
                fileName={uploadFileName} 
                status={uploadProgress === 100 ? 'success' : 'uploading'} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .ProseMirror { min-height: 50vh; outline: none !important; }
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #1e293b; pointer-events: none; height: 0; font-style: italic; }
        
        /* Direct Headings Styling to override any prose conflicts */
        .ProseMirror h1 { font-size: 3.5rem !important; font-weight: 900 !important; margin-bottom: 2rem !important; color: white !important; line-height: 1.1 !important; display: block !important; margin-top: 2rem !important; }
        .ProseMirror h2 { font-size: 2.75rem !important; font-weight: 800 !important; margin-bottom: 1.5rem !important; color: white !important; margin-top: 3.5rem !important; display: block !important; line-height: 1.2 !important; }
        .ProseMirror h3 { font-size: 2rem !important; font-weight: 700 !important; margin-bottom: 1.25rem !important; color: #f1f5f9 !important; margin-top: 2.5rem !important; display: block !important; line-height: 1.3 !important; }
        
        .ProseMirror p { margin-bottom: 1.5rem; font-size: 1.25rem; line-height: 1.8; color: #cbd5e1; font-weight: 500; }
        .ProseMirror blockquote { border-left: 4px solid #8A2BE2; padding-left: 1.5rem; font-style: italic; color: #94a3b8; margin: 2.5rem 0; background: rgba(255,255,255,0.03); padding-top: 1.5rem; padding-bottom: 1.5rem; border-radius: 0 1rem 1rem 0; }
        .ProseMirror ul { list-style-type: disc !important; padding-left: 2rem !important; margin-bottom: 1.5rem !important; }
        .ProseMirror ol { list-style-type: decimal !important; padding-left: 2rem !important; margin-bottom: 1.5rem !important; }
        .ProseMirror li { margin-bottom: 0.5rem; color: #cbd5e1; display: list-item !important; }
        .ProseMirror pre { background: #011627 !important; color: #e2e8f0; padding: 1.5rem; border-radius: 1rem; margin: 2rem 0; border: 1px solid rgba(255,255,255,0.05); }
        .ProseMirror a { color: #8A2BE2; text-decoration: underline; font-weight: 700; }
        .ProseMirror mark { background-color: #8A2BE2; color: white; border-radius: 4px; padding: 0 4px; }
        .ProseMirror img { border-radius: 1.5rem; margin: 2.5rem 0; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
      `}</style>
    </div>
  );
}

interface ToolBtnProps {
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
}

function ToolBtn({ onClick, active, disabled, icon }: ToolBtnProps) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); onClick?.(); }}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all ${active ? 'bg-white/10 text-[#8A2BE2] scale-110 shadow-lg shadow-[#8A2BE2]/10' : 'text-slate-500 hover:text-white hover:bg-white/5'} ${disabled ? 'opacity-20 cursor-not-allowed' : ''}`}
    >
      {icon}
    </button>
  );
}

export default function NewDropPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080B12] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#F7931A]" /></div>}>
      <EditorInner />
    </Suspense>
  );
}
