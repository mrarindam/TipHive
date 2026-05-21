import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Bitcoin-Native Creators & Top Posts",
  description:
    "Discover and follow top Bitcoin-native creators on Mezo L2. Browse trending posts, support your favorites with instant fee-less tips, and join the creator economy.",
  alternates: {
    canonical: "https://tiphive.xyz/explore",
  },
  openGraph: {
    title: "Explore Bitcoin-Native Creators & Top Posts | TipHive",
    description:
      "Discover and follow top Bitcoin-native creators on Mezo L2. Browse trending posts and tip instantly with 0% platform fees.",
    url: "https://tiphive.xyz/explore",
    siteName: "TipHive",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Bitcoin-Native Creators & Top Posts | TipHive",
    description:
      "Discover and follow top Bitcoin-native creators on Mezo L2. Browse trending posts and tip instantly with 0% platform fees.",
    creator: "@TipHive",
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
