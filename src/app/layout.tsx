import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { PrivyProviderWrapper } from "@/components/providers/PrivyProviderWrapper";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/providers/SmoothScroll";
import OnboardingGuard from "@/components/providers/onboarding-guard";
import WalletSwitchGuard from "@/components/providers/WalletSwitchGuard";
import PwaRegister from "@/components/providers/PwaRegister";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://tiphive.xyz'),
  title: "TipHive | The Bitcoin-Native Tipping Platform",
  description: "Empowering the creator economy with instant, fee-less Bitcoin-native tips on Mezo L2.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TipHive",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-[#050505] text-white`} suppressHydrationWarning>
        <PwaRegister />
        <PrivyProviderWrapper>
          <SmoothScroll>
            <OnboardingGuard>
              <WalletSwitchGuard>
                <div id="root-container" className="flex flex-col min-h-screen bg-[#050505]">
                  <Navbar />
                  <main className="flex-grow">
                    {children}
                  </main>
                  <Footer />
                </div>
              </WalletSwitchGuard>
            </OnboardingGuard>
          </SmoothScroll>
        </PrivyProviderWrapper>
      </body>
    </html>
  );
}

