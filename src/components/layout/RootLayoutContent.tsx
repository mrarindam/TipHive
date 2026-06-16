'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import FloatingDock from './FloatingDock';
import Footer from './Footer';

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDocs = pathname?.startsWith('/docs');

  if (isDocs) {
    return (
      <div id="root-container" className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300">
        <main className="flex-grow w-full transition-all duration-300">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div id="root-container" className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <div className="flex flex-1 relative">
        <Sidebar />
        <main className="flex-grow w-full lg:pl-[76px] transition-all duration-300">
          {children}
        </main>
      </div>
      <FloatingDock />
      <Footer />
    </div>
  );
}
