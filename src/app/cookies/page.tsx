'use client';

import { motion } from 'framer-motion';
import { Cookie, Settings, BarChart3, Shield, ToggleLeft, Mail, Info } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function CookiePolicyPage() {
  const sections = [
    {
      icon: Info,
      title: '1. What Are Cookies?',
      content: [
        'Cookies are small text files that are stored on your device (computer, tablet, or smartphone) when you visit a website. They help websites remember your preferences, understand how you use the site, and improve your overall experience.',
        'TipHive uses cookies and similar technologies (like local storage) sparingly and only when necessary to provide you with a smooth, functional experience on the platform.',
      ]
    },
    {
      icon: Settings,
      title: '2. Types of Cookies We Use',
      content: [
        '**Essential Cookies**: These are strictly necessary for the Platform to function. They include:',
        '• **Wallet Connection State**: Remembers your connected wallet session so you don\'t need to reconnect every time you navigate between pages.',
        '• **Theme & UI Preferences**: Stores your interface preferences for a consistent experience.',
        '• **Session Management**: Maintains your authentication state while you\'re actively using the Platform.',
        'These cookies cannot be disabled as the Platform would not function properly without them.',
        '',
        '**Functional Cookies**: These enhance your experience but are not strictly required:',
        '• **Language & Region**: Remembers your preferred language and regional settings.',
        '• **Recent Activity**: Caches recent profile views and search history locally for faster navigation.',
      ]
    },
    {
      icon: BarChart3,
      title: '3. Analytics & Performance',
      content: [
        'TipHive currently does NOT use any third-party analytics cookies (such as Google Analytics, Mixpanel, or Hotjar).',
        'If we introduce analytics in the future, we will:',
        '• Update this Cookie Policy before implementation.',
        '• Provide you with clear opt-in/opt-out controls.',
        '• Choose privacy-respecting analytics tools that do not sell or share your data.',
        'We believe in minimal data collection. We only track what\'s necessary to keep the Platform running smoothly.',
      ]
    },
    {
      icon: Shield,
      title: '4. Third-Party Cookies',
      content: [
        'Some third-party services integrated into TipHive may set their own cookies:',
        '**RainbowKit / WalletConnect**: The wallet connection interface may store session data to maintain your wallet connection across page loads.',
        '**Blockchain RPC Providers**: Network providers may cache request data for performance optimization.',
        'We do not control third-party cookies. Please refer to the respective privacy policies of these services for more information on their cookie practices.',
        'TipHive does NOT use advertising cookies, tracking pixels, or any form of cross-site tracking.',
      ]
    },
    {
      icon: ToggleLeft,
      title: '5. Managing Your Cookies',
      content: [
        'You have full control over cookies stored on your device:',
        '**Browser Settings**: Most modern browsers allow you to view, manage, and delete cookies through their settings. You can also configure your browser to block all cookies or only third-party cookies.',
        '**Clear Local Storage**: You can clear your browser\'s local storage and session storage at any time. This will log you out of the Platform and reset any saved preferences.',
        '**Wallet Disconnect**: You can disconnect your wallet at any time, which will clear the wallet connection cookies.',
        '**Note**: Blocking essential cookies may prevent the Platform from functioning correctly. Features like wallet connection and session persistence require these cookies to work.',
      ]
    },
    {
      icon: Cookie,
      title: '6. Updates to This Policy',
      content: [
        'We may update this Cookie Policy from time to time to reflect changes in our cookie practices or applicable regulations.',
        'When we make changes:',
        '• The "Last Updated" date at the top of this page will be revised.',
        '• For significant changes (e.g., introducing analytics cookies), we will provide prominent notice on the Platform.',
        '• We will always ensure you have the ability to manage your cookie preferences.',
        'We encourage you to check this page periodically to stay informed about how we use cookies.',
      ]
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7931A]/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#F7931A]/5 blur-[150px] rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-[#F7931A]/10 border border-[#F7931A]/20 rounded-full px-5 py-2 mb-8"
            >
              <Cookie className="w-4 h-4 text-[#F7931A]" />
              <span className="text-sm font-bold text-[#F7931A]">Transparency</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 font-outfit uppercase tracking-tighter leading-[0.9]">
              Cookie <span className="text-[#F7931A]">Policy</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-4">
              We keep it simple. Here&apos;s how TipHive uses cookies and similar technologies.
            </p>
            <p className="text-sm text-slate-600 font-bold">
              Last Updated: April 26, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* TL;DR Card */}
          <motion.div 
            {...fadeUp}
            className="glass-card p-8 mb-12 border-[#F7931A]/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F7931A]/10 blur-[60px] rounded-full" />
            <div className="relative z-10">
              <h3 className="text-lg font-black text-[#F7931A] mb-3 font-outfit uppercase tracking-tight flex items-center gap-2">
                <Cookie className="w-5 h-5" /> TL;DR
              </h3>
              <p className="text-slate-300 leading-relaxed">
                TipHive uses only <strong className="text-white">essential cookies</strong> to keep your wallet connected 
                and the platform functional. We do <strong className="text-white">not</strong> use advertising cookies, 
                tracking pixels, or third-party analytics. Your browsing data stays private.
              </p>
            </div>
          </motion.div>

          <div className="space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="glass-card p-8 group hover:border-[#F7931A]/20 transition-all"
              >
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#F7931A]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <section.icon className="w-6 h-6 text-[#F7931A]" />
                  </div>
                  <h2 className="text-2xl font-black text-white font-outfit tracking-tight pt-2">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-4 pl-0 md:pl-[4.25rem]">
                  {section.content.map((paragraph, j) => (
                    paragraph === '' ? <div key={j} className="h-2" /> :
                    <p key={j} className="text-slate-400 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div {...fadeUp} className="mt-16 glass-card p-8 text-center">
            <Mail className="w-8 h-8 text-[#F7931A] mx-auto mb-4" />
            <h3 className="text-xl font-black text-white mb-2 font-outfit">Cookie Questions?</h3>
            <p className="text-slate-400 mb-4">
              If you have any questions about our cookie practices, feel free to reach out.
            </p>
            <a href="mailto:marindam342@gmail.com" className="text-[#F7931A] font-bold hover:underline">
              marindam342@gmail.com
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
