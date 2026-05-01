'use client';

import { motion } from 'framer-motion';
import { 
  Send, Mail, MessageCircle, Globe, 
  Heart, Sparkles, ArrowUpRight
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function ContactPage() {
  const channels = [
    {
      icon: MessageCircle,
      platform: 'Telegram',
      handle: '@MrxArindam',
      href: 'https://t.me/MrxArindam',
      color: '#0088cc',
      description: 'Best for quick questions and real-time chat.',
    },
    {
      icon: Mail,
      platform: 'Email',
      handle: 'marindam342@gmail.com',
      href: 'mailto:marindam342@gmail.com',
      color: '#F7931A',
      description: 'For partnerships, collaborations, and detailed inquiries.',
    },
    {
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      platform: 'Twitter / X',
      handle: '@ExeArindam',
      href: 'https://x.com/ExeArindam',
      color: '#1DA1F2',
      description: 'Follow for updates, announcements, and project news.',
    },
    {
      icon: Globe,
      platform: 'Portfolio',
      handle: 'mrarindam.vercel.app',
      href: 'https://mrarindam.vercel.app/',
      color: '#FFAB40',
      description: 'Explore more projects and work by Arindam.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7931A]/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#F7931A]/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#F7931A]/10 blur-[100px] rounded-full" />

        <div className="w-full px-[5%] md:px-[8%] relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-[#F7931A]/10 border border-[#F7931A]/20 rounded-full px-5 py-2 mb-8"
            >
              <Send className="w-4 h-4 text-[#F7931A]" />
              <span className="text-sm font-bold text-[#F7931A]">Get in Touch</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 font-outfit uppercase tracking-tighter leading-[0.9]">
              Let&apos;s <span className="text-[#F7931A]">Connect</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              TipHive is built by <span className="text-white font-bold">Arindam</span>. If you want to connect about the project, 
              partnerships, feedback, feature ideas, or general questions — use any of the channels below.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 pb-32">
        <div className="w-full px-[5%] md:px-[8%]">
          <div className="grid md:grid-cols-2 gap-6">
            {channels.map((channel, i) => {
              const IconComponent = channel.icon;
              return (
                <motion.a
                  key={channel.platform}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="glass-card p-8 group hover:border-[#F7931A]/30 transition-all cursor-pointer block relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 blur-[50px] rounded-full opacity-0 group-hover:opacity-30 transition-opacity"
                    style={{ backgroundColor: channel.color }}
                  />
                  
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${channel.color}15` }}
                    >
                      <div style={{ color: channel.color }}>
                        <IconComponent />
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-[#F7931A] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>

                  <h3 className="text-lg font-black text-white mb-1 font-outfit tracking-tight group-hover:text-[#F7931A] transition-colors">
                    {channel.platform}
                  </h3>
                  <p className="text-sm font-bold font-mono mb-3" style={{ color: channel.color }}>
                    {channel.handle}
                  </p>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {channel.description}
                  </p>
                </motion.a>
              );
            })}
          </div>

          {/* Additional Message */}
          <motion.div 
            {...fadeUp}
            className="mt-16 glass-card p-8 text-center relative overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#F7931A]/10 blur-[60px] rounded-full" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#F7931A]/5 blur-[60px] rounded-full" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#F7931A]/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-[#F7931A]" />
              </div>
              <h3 className="text-xl font-black text-white mb-3 font-outfit uppercase tracking-tight">
                Open to <span className="text-[#F7931A]">Collaboration</span>
              </h3>
              <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
                Whether you&apos;re a developer wanting to contribute, a creator looking for a better 
                tipping solution, or a project exploring partnerships — I&apos;d love to hear from you. 
                Don&apos;t hesitate to reach out!
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-[#F7931A]">
                <Heart className="w-4 h-4 fill-[#F7931A]" />
                Built with passion on the Mezo Network
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
