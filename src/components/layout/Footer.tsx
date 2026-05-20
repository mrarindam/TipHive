'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, ExternalLink, Globe, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith('/docs')) {
    return null;
  }

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { name: 'Explore', href: '/explore' },
        { name: 'Documentation', href: '/docs', target: '_blank', rel: 'noopener noreferrer' },
        { name: 'Mezo Toolkit', href: '/mezo-toolkit' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Contact', href: '/contact' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
      ]
    }
  ];

  return (
    <footer className="relative border-t border-white/5 bg-[#050505] pt-24 pb-12 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#F7931A]/5 blur-[120px] rounded-full -z-10" />

      <div className="w-full px-[5%] md:px-[8%]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <Image
                src="/logo.png"
                alt="TipHive"
                width={48}
                height={48}
                className="group-hover:rotate-12 transition-all mix-blend-screen"
                style={{ height: 'auto' }}
                unoptimized
              />
              <span className="text-2xl font-black tracking-tighter text-white font-outfit uppercase">
                TIP<span className="text-[#F7931A]">HIVE</span>
              </span>
            </Link>
            <p className="text-slate-500 text-lg max-w-sm font-medium leading-relaxed">
              Empowering the next generation of creators through the world&apos;s most secure economic layer. Bitcoin support, simplified.
            </p>
            <div className="flex items-center gap-4">
              <SocialLink icon={<MessageCircle className="w-5 h-5" />} href="https://t.me/MrxArindam" />
              <SocialLink icon={
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              } href="https://x.com/tiphive" />
              <SocialLink icon={<Mail className="w-5 h-5" />} href="mailto:marindam342@gmail.com" />
              <SocialLink icon={<Globe className="w-5 h-5" />} href="https://tiphive.xyz" />
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section, i) => (
            <div key={i} className="space-y-6">
              <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link
                      href={link.href}
                      target={link.target}
                      rel={link.rel}
                      className="text-slate-500 hover:text-[#F7931A] font-bold transition-colors flex items-center gap-2 group"
                    >
                      {link.name}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-600 text-sm font-bold">
            © {currentYear} TIPHIVE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ icon, href }: { icon: React.ReactNode, href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#F7931A] hover:border-[#F7931A] transition-all"
    >
      {icon}
    </a>
  );
}
