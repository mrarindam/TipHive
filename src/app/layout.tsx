import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { WalletProviderWrapper } from "@/components/providers/WalletProviderWrapper";
import RootLayoutContent from "@/components/layout/RootLayoutContent";
import OnboardingGuard from "@/components/providers/onboarding-guard";
import WalletSwitchGuard from "@/components/providers/WalletSwitchGuard";
import PwaRegister from "@/components/providers/PwaRegister";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

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
  title: {
    default: "TipHive — The Bitcoin-Native Tipping Platform on Mezo L2",
    template: "%s | TipHive"
  },
  description: "Empowering the creator economy with instant, fee-less Bitcoin-native tips on Mezo L2. Monetize your content, build memberships, and interact with fans directly.",
  keywords: [
    "TipHive",
    "Bitcoin tipping",
    "crypto tips",
    "creator tipping platform",
    "Mezo L2 tipping",
    "fee-less Bitcoin tips",
    "MUSD stablecoin",
    "web3 creator economy",
    "crypto subscriptions",
    "Bitcoin content gating",
    "support creators with crypto",
    "Bitcoin donations",
    "Lightning network tips",
    "bitcoin tips for creators",
    "ethereum creator support",
    "blockchain tipping",
    "crypto buy me a coffee",
    "Mezo network creator support",
    "content monetization",
    "web3 creator monetization"
  ],
  authors: [{ name: "TipHive Team", url: "https://tiphive.xyz" }],
  creator: "TipHive Team",
  publisher: "TipHive",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://tiphive.xyz",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "TipHive — The Bitcoin-Native Tipping Platform on Mezo L2",
    description: "Empowering the creator economy with instant, fee-less Bitcoin-native tips on Mezo L2. Monetize your content with 0% platform fees.",
    url: "https://tiphive.xyz",
    siteName: "TipHive",
    images: [
      {
        url: "https://tiphive.xyz/logo.png",
        width: 800,
        height: 800,
        alt: "TipHive Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TipHive — The Bitcoin-Native Tipping Platform on Mezo L2",
    description: "Empowering the creator economy with instant, fee-less Bitcoin-native tips on Mezo L2. Monetize your content with 0% platform fees.",
    creator: "@TipHive",
    images: ["https://tiphive.xyz/logo.png"],
  },
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
  verification: {
    google: "fYSEPpJGJxuk1YKUmqtSfjlNQ_HUYFRoV2s5ThSCPeE",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://tiphive.xyz/#organization",
      "name": "TipHive",
      "url": "https://tiphive.xyz",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://tiphive.xyz/#logo",
        "url": "https://tiphive.xyz/logo.png",
        "caption": "TipHive Logo"
      },
      "image": {
        "@id": "https://tiphive.xyz/#logo"
      },
      "sameAs": [
        "https://twitter.com/TipHive",
        "https://github.com/mrarindam/TipHive"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://tiphive.xyz/#website",
      "url": "https://tiphive.xyz",
      "name": "TipHive",
      "publisher": {
        "@id": "https://tiphive.xyz/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://tiphive.xyz/explore?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://tiphive.xyz/#software",
      "name": "TipHive Platform",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "USD"
      },
      "description": "Bitcoin-native tipping and content-gating platform built on Mezo L2 with 0% platform fees.",
      "publisher": {
        "@id": "https://tiphive.xyz/#organization"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://tiphive.xyz/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much does TipHive cost?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Nothing. TipHive charges 0% platform fees. You only pay network gas costs."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need to be verified or provide ID?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Just connect your wallet. It is totally permissionless, secure, and non-custodial."
          }
        },
        {
          "@type": "Question",
          "name": "Is TipHive safe?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. TipHive is non-custodial—we never hold your funds. Money goes directly to your wallet."
          }
        },
        {
          "@type": "Question",
          "name": "What is MUSD?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "MUSD is a stablecoin on Mezo L2 backed by Bitcoin. It is price-stable at ~$1 USD."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PwaRegister />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <WalletProviderWrapper>
            <OnboardingGuard>
              <WalletSwitchGuard>
                <RootLayoutContent>
                  {children}
                </RootLayoutContent>
                <SpeedInsights />
              </WalletSwitchGuard>
            </OnboardingGuard>
          </WalletProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

