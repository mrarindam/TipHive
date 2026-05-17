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
      title: '1. What Are Cookies & Local Storage?',
      content: [
        'Cookies are small text files stored on your device when you visit a website. Along with cookies, modern web apps use **Local Storage** and **Cache Storage** (part of our Progressive Web App system) to cache code, remember preferences, and keep you authenticated securely.',
        'TipHive uses these tools sparingly and strictly to deliver a smooth, responsive, and secure experience on our decentralized tipping and membership platform.',
      ]
    },
    {
      icon: Settings,
      title: '2. Types of Storage & Cookies We Use',
      content: [
        '**Essential Storage & Cookies**: These are strictly necessary for the platform to function. They include:',
        '• **Privy Session Caching**: Persists your secure cryptographic authentication status so you remain logged in as you navigate between pages or close the PWA.',
        '• **UI Preferences**: Caches theme preferences (such as dark mode defaults) for a consistent layout presentation.',
        '• **PWA Offline Assets**: Uses the browser\'s Cache Storage API to store page bundles, icons, and fonts, allowing the app to open instantly and function offline on mobile devices.',
        'These storage tokens cannot be disabled, as the decentralized app would not function properly without them.',
        '',
        '**Functional Storage**: These enhance your browsing experience but are not strictly required:',
        '• **Draft Cache**: Locally stores unsaved post contents in your editor to prevent work loss from unexpected refreshes.',
        '• **Performance Optimization Cache**: Caches recent creator profile and metadata queries to maximize loading performance and minimize blockchain RPC requests.',
      ]
    },
    {
      icon: BarChart3,
      title: '3. Analytics & Performance',
      content: [
        'TipHive currently does **NOT** use any third-party analytics cookies (such as Google Analytics, Mixpanel, or Hotjar). We do not record your browsing behavior, and your clicks are entirely private.',
        'If analytics are introduced in the future, we will:',
        '• Update this Cookie Policy prior to launch.',
        '• Implement an explicit opt-in preference banner.',
        '• Choose privacy-first, cookieless analytics alternatives that guarantee absolute compliance with data privacy regulations.',
      ]
    },
    {
      icon: Shield,
      title: '4. Third-Party Services',
      content: [
        'Some third-party providers integrated into TipHive may set cookies or use storage:',
        '• **Privy (Auth)**: Privy uses cookies and secure local storage mechanisms to persist your authenticated session and secure key-split signatures, allowing you to stay securely logged in across platform views.',
        '• **Mezo Network RPC**: Nodes and RPC providers may cache basic network parameters locally to optimize smart contract query transactions.',
        'We do not control third-party cookies. Please review the privacy policies of Mezo and Privy for details on their storage methods.',
        'TipHive does **NOT** use advertising cookies, tracking pixels, or cross-site tracking profiles.',
      ]
    },
    {
      icon: ToggleLeft,
      title: '5. Managing Your Storage Preferences',
      content: [
        'You have full control over cookies and storage systems on your device:',
        '• **PWA App Management**: If installed as a Progressive Web App on Android or desktop, you can clear the app\'s cache and cookies via your device\'s system settings.',
        '• **Browser Settings**: Most modern browsers allow you to view, clear, or block cookies and local storage tokens via the browser settings panel.',
        '• **Wallet & Account Disconnect**: Logging out of your TipHive profile will clear Privy session variables and remove all connected authentication states.',
        '**Note**: Blocking all storage elements will break essential features, such as Privy authentication, embedded wallets, and smart contract connections.',
      ]
    },
    {
      icon: Cookie,
      title: '6. Updates to This Policy',
      content: [
        'We may update this Cookie Policy from time to time to reflect changes in our storage practices, new integrations, or regulatory guidelines.',
        'When changes are made:',
        '• The "Last Updated" date at the top of this page will be revised.',
        '• For material changes, a notification banner will be displayed inside the application UI.',
        'We encourage you to review this page periodically to stay informed about our simple, privacy-focused storage philosophy.',
      ]
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7931A]/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#F7931A]/5 blur-[150px] rounded-full" />

        <div className="w-full px-[5%] md:px-[8%] relative z-10">
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
              Last Updated: May 17, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-32">
        <div className="w-full px-[5%] md:px-[8%]">
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
