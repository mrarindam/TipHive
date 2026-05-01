'use client';

import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database, UserCheck, Bell, Globe, Mail } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: Database,
      title: '1. Information We Collect',
      content: [
        'TipHive is designed to be privacy-first. We collect minimal data required to operate the platform:',
        '• **Wallet Address**: Your public blockchain address, used to identify your account and process transactions on the Mezo Network.',
        '• **Profile Information**: Display name, bio, avatar, category, and username — all voluntarily provided when you register as a creator.',
        '• **Transaction Data**: On-chain transaction records (tip amounts, timestamps, sender and receiver addresses) which are inherently public on the blockchain.',
        'We do NOT collect passwords, private keys, seed phrases, or any sensitive financial information. Your wallet remains entirely under your control at all times.',
      ]
    },
    {
      icon: Eye,
      title: '2. How We Use Your Information',
      content: [
        'The information we collect is used solely to provide and improve the TipHive platform:',
        '• **Display your public creator profile** so fans can discover and support you.',
        '• **Process and record tipping transactions** through smart contracts on the Mezo Network.',
        '• **Generate aggregated, anonymous statistics** (e.g., total tips received) to display on your dashboard.',
        '• **Communicate important platform updates** if you have opted in to notifications.',
        'We never sell, rent, or share your personal data with third parties for advertising or marketing purposes.',
      ]
    },
    {
      icon: Lock,
      title: '3. Data Security',
      content: [
        'Security is at the core of our architecture:',
        '• **Smart Contract Security**: All tipping logic runs through audited, immutable smart contracts deployed on the Mezo Network. We cannot alter or access your funds.',
        '• **No Custodial Risk**: TipHive never holds your funds. Tips flow directly from the sender to the creator via the smart contract. Withdrawals go straight to your wallet.',
        '• **Database Protection**: Off-chain profile data stored in our database is protected using industry-standard encryption and access controls.',
        '• **HTTPS Everywhere**: All data transmitted between your browser and our servers is encrypted using TLS/SSL.',
      ]
    },
    {
      icon: UserCheck,
      title: '4. Your Rights & Control',
      content: [
        'You maintain full control over your data:',
        '• **Profile Editing**: You can update or modify your profile information (name, bio, avatar, username) at any time from your Dashboard.',
        '• **Account Deletion**: You may request the deletion of your off-chain profile data by contacting us. Please note that on-chain transaction records cannot be deleted as they are permanently recorded on the blockchain.',
        '• **Data Portability**: Since your transaction history lives on-chain, you always have access to your complete transaction record via any blockchain explorer.',
        '• **Opt-Out**: You can disconnect your wallet at any time to stop using the platform.',
      ]
    },
    {
      icon: Globe,
      title: '5. Third-Party Services',
      content: [
        'TipHive integrates with the following third-party services:',
        '• **Mezo Network**: The Layer 2 blockchain network where all transactions are processed. Subject to the Mezo Network\'s own terms and privacy policy.',
        '• **RainbowKit / WalletConnect**: Used for wallet connection. These services may collect connection metadata. Please refer to their respective privacy policies.',
        '• **Supabase**: Used for off-chain data storage (profiles, metadata). Data is stored securely with encryption at rest.',
        'We carefully vet all third-party integrations to ensure they align with our privacy-first values.',
      ]
    },
    {
      icon: Bell,
      title: '6. Updates to This Policy',
      content: [
        'We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. When we make significant changes:',
        '• We will update the "Last Updated" date at the top of this page.',
        '• For material changes, we will provide notice through the platform or via our official communication channels.',
        '• Continued use of TipHive after changes constitutes acceptance of the updated policy.',
        'We encourage you to review this page periodically to stay informed about how we protect your information.',
      ]
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7931A]/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/3 w-96 h-96 bg-[#F7931A]/5 blur-[150px] rounded-full" />

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
              <Shield className="w-4 h-4 text-[#F7931A]" />
              <span className="text-sm font-bold text-[#F7931A]">Your Privacy Matters</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 font-outfit uppercase tracking-tighter leading-[0.9]">
              Privacy <span className="text-[#F7931A]">Policy</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-4">
              We believe in transparency. Here&apos;s exactly how TipHive handles your data.
            </p>
            <p className="text-sm text-slate-600 font-bold">
              Last Updated: April 26, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-32">
        <div className="w-full px-[5%] md:px-[8%]">
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
            <h3 className="text-xl font-black text-white mb-2 font-outfit">Questions About Your Privacy?</h3>
            <p className="text-slate-400 mb-4">
              If you have any questions or concerns about this policy, reach out to us.
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
