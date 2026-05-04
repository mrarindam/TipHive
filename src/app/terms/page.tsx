'use client';

import { motion } from 'framer-motion';
import { 
  FileText, Users, Wallet, AlertTriangle, Scale, 
  Ban, RefreshCw, Gavel, Mail 
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function TermsPage() {
  const sections = [
    {
      icon: Users,
      title: '1. Acceptance of Terms',
      content: [
        'By accessing or using TipHive ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.',
        'TipHive is a decentralized tipping platform built on the Mezo Network that enables users to send and receive Bitcoin-backed tips (MUSD) to creators. By connecting your wallet and using the Platform, you acknowledge that you understand how blockchain transactions work and accept the inherent risks involved.',
        'We reserve the right to update these terms at any time. Material changes will be communicated through the Platform. Your continued use after changes constitutes acceptance.',
      ]
    },
    {
      icon: Wallet,
      title: '2. Wallet & Account',
      content: [
        '**Wallet Connection**: To use TipHive, you must connect a compatible Web3 wallet (e.g., MetaMask, Coinbase Wallet). You are solely responsible for maintaining the security of your wallet, private keys, and seed phrases.',
        '**Creator Registration**: To receive tips, you must register as a creator by providing a display name, bio, category, and unique username. You agree to provide accurate information and not impersonate others.',
        '**Username Policy**: Usernames must be unique, lowercase, and alphanumeric. We reserve the right to reclaim or reassign usernames that are inactive, misleading, or violate these terms.',
        '**No Custodial Relationship**: TipHive does not hold, store, or manage your funds. All transactions occur directly on the Mezo Network through smart contracts. We are not a bank, exchange, or custodial service.',
      ]
    },
    {
      icon: Scale,
      title: '3. Tipping & Transactions',
      content: [
        '**How Tipping Works**: Users send MUSD tips to creators through our smart contract. Tips are recorded on-chain and credited to the creator\'s contract balance. Creators can withdraw their earnings to their wallet at any time.',
        '**Irreversible Transactions**: All blockchain transactions are final and irreversible. Once a tip is sent, it cannot be refunded, reversed, or cancelled. Please double-check all transaction details before confirming.',
        '**Gas Fees**: Blockchain transactions may require gas fees paid in the network\'s native token. These fees are paid directly to the network, not to TipHive.',
        '**Platform Fees**: TipHive currently charges no platform fees on tips. This may change in the future, and any fee changes will be clearly communicated before implementation.',
      ]
    },
    {
      icon: Ban,
      title: '4. Prohibited Conduct',
      content: [
        'You agree NOT to use TipHive for:',
        '• **Illegal Activities**: Money laundering, terrorist financing, sanctions evasion, or any activity that violates applicable laws.',
        '• **Fraud & Impersonation**: Creating fake creator profiles, impersonating real individuals or organizations, or engaging in deceptive practices.',
        '• **Spam & Abuse**: Sending automated or bulk transactions, exploiting smart contract vulnerabilities, or engaging in any activity that disrupts the Platform.',
        '• **Harmful Content**: Uploading offensive, hateful, or illegal content to your creator profile.',
        'Violation of these rules may result in profile removal and blocking of your wallet address from the Platform.',
      ]
    },
    {
      icon: AlertTriangle,
      title: '5. Risks & Disclaimers',
      content: [
        '**Blockchain Risks**: Cryptocurrency and blockchain technology involve inherent risks including but not limited to: price volatility, smart contract bugs, network congestion, and regulatory changes. You accept these risks when using the Platform.',
        '**No Financial Advice**: TipHive does not provide financial, investment, or tax advice. Tips are voluntary payments, not investments. You are responsible for understanding the tax implications of giving or receiving tips in your jurisdiction.',
        '**No Warranties**: The Platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service, error-free operation, or protection against all security threats.',
        '**Smart Contract Risk**: While our smart contracts are designed with security best practices, no software is entirely free from bugs. Use the Platform at your own risk.',
      ]
    },
    {
      icon: RefreshCw,
      title: '6. Modifications & Termination',
      content: [
        '**Platform Changes**: We may modify, suspend, or discontinue any part of the Platform at any time without prior notice. We are not liable for any losses resulting from such changes.',
        '**Account Termination**: We reserve the right to restrict or terminate access to the Platform for users who violate these terms, engage in prohibited conduct, or pose a risk to the platform or its users.',
        '**Data After Termination**: Off-chain profile data may be deleted upon account termination. On-chain transaction records will remain permanently on the blockchain and cannot be deleted.',
      ]
    },
    {
      icon: Gavel,
      title: '7. Limitation of Liability',
      content: [
        'To the maximum extent permitted by law:',
        '• TipHive and its creator (Arindam) shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.',
        '• Our total liability for any claim related to the Platform shall not exceed the amount of tips you have sent or received through the Platform in the past 30 days.',
        '• We are not responsible for losses due to wallet compromise, incorrect wallet addresses, network outages, or smart contract interactions outside of our control.',
        'These limitations apply regardless of the legal theory under which liability is asserted.',
      ]
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7931A]/5 via-transparent to-transparent" />
        <div className="absolute top-20 right-1/3 w-96 h-96 bg-[#F7931A]/5 blur-[150px] rounded-full" />

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
              <FileText className="w-4 h-4 text-[#F7931A]" />
              <span className="text-sm font-bold text-[#F7931A]">Legal</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 font-outfit uppercase tracking-tighter leading-[0.9]">
              Terms of <span className="text-[#F7931A]">Service</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-4">
              Please read these terms carefully before using TipHive. They govern your access and use of the platform.
            </p>
            <p className="text-sm text-slate-600 font-bold">
              Last Updated: May 4, 2026
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
            <h3 className="text-xl font-black text-white mb-2 font-outfit">Questions About These Terms?</h3>
            <p className="text-slate-400 mb-4">
              If anything is unclear, we&apos;re happy to help explain.
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
