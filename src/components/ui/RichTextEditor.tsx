'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { usePathname } from 'next/navigation';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { common, createLowlight } from 'lowlight';
import { useState, useRef, useMemo, useEffect } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Heading1, Heading2, Heading3, Quote, Undo, Redo, Strikethrough,
  Link as LinkIcon, Image as ImageIcon, Unlink, Code2, Share2,
  Maximize2, X, UploadCloud, Globe, Plus, Loader2, Type, Highlighter, Eraser
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  placeholder?: string;
}

type ModalType = 'link' | 'image' | 'embed' | 'color' | null;

const RichTextEditor = ({
  title,
  setTitle,
  content,
  setContent,
  placeholder = 'Write your story, description, or thoughts...'
}: RichTextEditorProps) => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalValue, setModalValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [toolbarHeight, setToolbarHeight] = useState(60);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isDropsPage = pathname?.includes('/dashboard/posts') || pathname?.includes('/dashboard/createposts');

  // Measure actual toolbar height for accurate padding
  useEffect(() => {
    if (toolbarRef.current) {
      setToolbarHeight(toolbarRef.current.offsetHeight);
    }
  }, []);

  const extensions = useMemo(() => [
    StarterKit.configure({
      codeBlock: false,
      heading: { levels: [1, 2, 3] },
      // Disable built-in extensions that we add separately below
      // to avoid the duplicate extension name warning
      link: false,
      underline: false,
    }),
    Underline,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-[#8A2BE2] underline cursor-pointer hover:text-[#F7931A] transition-colors font-bold',
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'rounded-3xl border border-white/10 max-w-full h-auto my-8 shadow-2xl mx-auto block',
      },
    }),
    Youtube.configure({
      width: 840,
      height: 480,
      HTMLAttributes: {
        class: 'rounded-3xl border border-white/10 max-w-full h-auto my-8 aspect-video w-full shadow-2xl',
      },
    }),
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: 'javascript',
      HTMLAttributes: {
        class: 'rounded-2xl bg-[#011627] p-6 font-mono text-sm leading-relaxed my-8 border border-white/5 shadow-inner',
      },
    }),
    Placeholder.configure({ placeholder }),
  ], [placeholder]);

  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] text-slate-300 font-medium px-8 sm:px-12 md:px-16 pb-16 text-lg leading-relaxed selection:bg-[#8A2BE2]/30',
      },
    },
  });

  const handleModalSubmit = () => {
    if (!editor || !modalValue) return;
    if (modalType === 'link') {
      editor.chain().focus().extendMarkRange('link').setLink({ href: modalValue }).run();
    } else if (modalType === 'image') {
      editor.chain().focus().setImage({ src: modalValue }).run();
    } else if (modalType === 'embed') {
      if (modalValue.includes('youtube.com') || modalValue.includes('youtu.be')) {
        editor.chain().focus().setYoutubeVideo({ src: modalValue }).run();
      } else if (modalValue.includes('spotify.com')) {
        const embedUrl = modalValue.replace('open.spotify.com/', 'open.spotify.com/embed/');
        editor.chain().focus().insertContent(`<iframe src="${embedUrl}" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="border-radius:24px; margin: 2rem 0;"></iframe>`).run();
      }
    } else if (modalType === 'color') {
      editor.chain().focus().setColor(modalValue).run();
    }
    setModalType(null);
    setModalValue('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        const optimizedUrl = data.url.replace('/upload/', '/upload/q_auto,f_auto,w_1200/');
        editor.chain().focus().setImage({ src: optimizedUrl }).run();
        setModalType(null);
      }
    } catch (err) {
      console.error('Upload Error', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (!editor) return null;

  // Fixed top offset: 0 on drops page (no navbar), 80px on other pages (navbar height)
  const fixedTop = isDropsPage ? 0 : 80;

  return (
    <div className="w-full bg-[#080B12] border border-white/5 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]">

      {/* =====================================================
          FIXED TOOLBAR — uses position:fixed, NOT sticky
          sticky doesn't work with Lenis SmoothScroll
          ===================================================== */}
      <div
        ref={toolbarRef}
        className="fixed left-0 right-0 z-[99] flex flex-wrap items-center gap-1 px-3 py-2 bg-[#080B12]/98 backdrop-blur-2xl border-b border-white/10 shadow-2xl"
        style={{ top: `${fixedTop}px` }}
      >
        {/* On desktop, offset by sidebar width */}
        <div className="md:ml-72 flex flex-wrap items-center gap-1 w-full">
          <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/5">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={<Bold size={14} />} label="Bold" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={<Italic size={14} />} label="Italic" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={<UnderlineIcon size={14} />} label="Underline" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} icon={<Strikethrough size={14} />} label="Strike" />
          </div>

          <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/5 ml-1">
            <ToolbarButton onClick={() => setModalType('color')} icon={<Type size={14} />} label="Color" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} icon={<Highlighter size={14} />} label="Highlight" />
            <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().setParagraph().run()} icon={<Eraser size={14} />} label="Clear Formatting" />
          </div>

          <div className="w-px h-5 bg-white/10 mx-1" />

          <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/5">
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} icon={<Heading1 size={14} />} label="H1" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} icon={<Heading2 size={14} />} label="H2" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} icon={<Heading3 size={14} />} label="H3" />
          </div>

          <div className="w-px h-5 bg-white/10 mx-1" />

          <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/5">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={<List size={14} />} label="List" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={<ListOrdered size={14} />} label="Ordered" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} icon={<Quote size={14} />} label="Quote" />
            <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} icon={<Code2 size={14} />} label="Code" />
          </div>

          <div className="w-px h-5 bg-white/10 mx-1" />

          <div className="flex items-center gap-0.5 bg-white/5 p-0.5 rounded-lg border border-white/5">
            <ToolbarButton onClick={() => setModalType('link')} active={editor.isActive('link')} icon={<LinkIcon size={14} />} label="Link" />
            <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} icon={<Unlink size={14} />} label="Unlink" />
            <ToolbarButton onClick={() => setModalType('image')} icon={<ImageIcon size={14} />} label="Image" />
            <ToolbarButton onClick={() => setModalType('embed')} icon={<Share2 size={14} />} label="Embed" />
          </div>

          <div className="flex-grow" />

          <div className="flex items-center gap-0.5">
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={<Undo size={14} />} label="Undo" />
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={<Redo size={14} />} label="Redo" />
          </div>
        </div>
      </div>

      {/* Spacer to push content below the fixed toolbar */}
      <div style={{ height: `${toolbarHeight}px` }} />

      {/* Title Area */}
      <div className="px-8 sm:px-12 md:px-16 pt-10 pb-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent rounded-t-[3rem]">
        <textarea
          rows={1}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
          placeholder="Give your post a catchy title..."
          className="w-full bg-transparent text-white font-outfit text-4xl md:text-5xl lg:text-6xl font-black focus:outline-none placeholder:text-slate-800 tracking-tighter resize-none overflow-hidden leading-tight"
        />
        <div className="w-20 h-1.5 bg-gradient-to-r from-[#8A2BE2] to-[#F7931A] rounded-full mt-6 opacity-50" />
      </div>

      {/* Editor Content */}
      <div className="relative bg-gradient-to-b from-[#080B12] to-[#0B0F19] rounded-b-[3rem]">
        <EditorContent editor={editor} />
        <div className="absolute bottom-6 right-8 text-slate-800 flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Markdown Enabled</span>
          <Maximize2 size={12} />
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111827] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold uppercase tracking-widest text-sm">
                  {modalType === 'link' ? 'Add Link' : modalType === 'image' ? 'Add Image' : modalType === 'color' ? 'Text Color' : 'Add Embed'}
                </h3>
                <button onClick={() => setModalType(null)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                {modalType === 'image' && (
                  <div className="grid grid-cols-1 gap-4 mb-2">
                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-dashed border-white/10 hover:bg-white/10 transition-all text-slate-300 hover:text-white">
                      {isUploading ? <Loader2 className="animate-spin" /> : <UploadCloud />}
                      <span className="font-bold text-sm uppercase tracking-wide">Upload from Gallery</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                      <div className="relative flex justify-center text-xs uppercase text-slate-500"><span className="bg-[#111827] px-2">OR USE URL</span></div>
                    </div>
                  </div>
                )}

                {modalType === 'color' && (
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {['#FFFFFF', '#8A2BE2', '#F7931A', '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#94A3B8'].map(color => (
                      <button key={color} onClick={() => { setModalValue(color); editor.chain().focus().setColor(color).run(); setModalType(null); }} className="w-full aspect-square rounded-lg border border-white/10 hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                )}

                {modalType !== 'color' && (
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Globe size={18} /></div>
                    <input
                      type="text"
                      value={modalValue}
                      onChange={(e) => setModalValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleModalSubmit()}
                      placeholder={modalType === 'link' ? 'https://example.com' : modalType === 'image' ? 'Paste image URL...' : 'Paste YouTube or Spotify URL...'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-[#8A2BE2] outline-none"
                      autoFocus
                    />
                  </div>
                )}

                <button onClick={handleModalSubmit} className="w-full bg-[#8A2BE2] text-white font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <Plus size={18} /> Confirm {modalType === 'link' ? 'Link' : modalType === 'image' ? 'Image' : modalType === 'color' ? 'Color' : 'Embed'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .ProseMirror { min-height: 500px; outline: none !important; padding-top: 2rem; }
        .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #1e293b; pointer-events: none; height: 0; }
        .ProseMirror h1 { font-size: 2.5rem; font-weight: 900; margin-bottom: 1.5rem; color: white; line-height: 1.2; }
        .ProseMirror h2 { font-size: 2rem; font-weight: 800; margin-bottom: 1.25rem; color: white; margin-top: 2rem; }
        .ProseMirror h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: rgba(255,255,255,0.9); margin-top: 1.5rem; }
        .ProseMirror p { margin-bottom: 1.5rem; font-size: 1.125rem; line-height: 1.75; color: #cbd5e1; }
        .ProseMirror blockquote { border-left: 4px solid #8A2BE2; padding-left: 1.5rem; font-style: italic; color: #94a3b8; background: rgba(255,255,255,0.05); padding-top: 0.5rem; padding-bottom: 0.5rem; border-radius: 0 0.75rem 0.75rem 0; margin: 2rem 0; }
        .ProseMirror ul { list-style-type: disc !important; padding-left: 2rem !important; margin-bottom: 1.5rem !important; }
        .ProseMirror ol { list-style-type: decimal !important; padding-left: 2rem !important; margin-bottom: 1.5rem !important; }
        .ProseMirror li { margin-bottom: 0.5rem; color: #cbd5e1; display: list-item !important; }
        .ProseMirror pre { background: #011627 !important; border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 1rem; margin: 2rem 0; }
        .ProseMirror a { color: #8A2BE2; text-decoration: underline; }
        .ProseMirror mark { background-color: #8A2BE2; color: white; border-radius: 4px; padding: 0 4px; }
      `}</style>
    </div>
  );
};

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}

const ToolbarButton = ({ onClick, active, disabled, icon, label }: ToolbarButtonProps) => (
  <button
    onClick={(e) => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    className={`flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${active ? 'bg-[#8A2BE2] text-white shadow-[0_0_15px_rgba(138,43,226,0.4)] scale-110' : 'text-slate-500 hover:text-white hover:bg-white/10'} ${disabled ? 'opacity-10 cursor-not-allowed' : ''}`}
    title={label}
  >
    {icon}
  </button>
);

export default RichTextEditor;
