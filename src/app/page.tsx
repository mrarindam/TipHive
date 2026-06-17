import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

const SITE_URL = "https://tiphive.xyz";

export const metadata: Metadata = {
  title: "TipHive - The Bitcoin-Native Tipping Platform on Mezo L2",
  description:
    "Empower creators with instant, fee-less Bitcoin-native tips on Mezo L2. 0% platform fees, non-custodial, MUSD-powered subscriptions and content monetization.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "TipHive - The Bitcoin-Native Tipping Platform on Mezo L2",
    description:
      "Empower creators with instant, fee-less Bitcoin-native tips on Mezo L2. 0% platform fees, MUSD-powered subscriptions, and direct fan-to-creator support.",
    url: SITE_URL,
    siteName: "TipHive",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 800,
        height: 800,
        alt: "TipHive Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TipHive - The Bitcoin-Native Tipping Platform on Mezo L2",
    description:
      "Empower creators with instant, fee-less Bitcoin-native tips on Mezo L2. 0% platform fees, MUSD-powered subscriptions, and direct fan-to-creator support.",
    creator: "@TipHive",
    images: [`${SITE_URL}/logo.png`],
  },
};

const homeStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: "TipHive - The Bitcoin-Native Tipping Platform on Mezo L2",
    description:
      "Empower creators with instant, fee-less Bitcoin-native tips on Mezo L2.",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    primaryImageOfPage: { "@id": `${SITE_URL}/#logo` },
    inLanguage: "en-US",
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
    ],
  },
];

export default function HomePage() {
  return (
    <>
      {homeStructuredData.map((item) => (
        <script
          key={item["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <HomePageClient />
    </>
  );
}
