export type PageOg = {
  title: string;
  description: string;
  eyebrow: string;
  headlineTop: string;
  headlineBottom: string;
  tagline: string;
  cta: string;
  path: string;
};

export const PAGES: Record<string, PageOg> = {
  "mezo-toolkit": {
    title: "Mezo Toolkit — Bitcoin L2 Developer Resources",
    description:
      "Faucets, explorers, RPCs, and developer tools to start building on Mezo — Bitcoin's native L2.",
    eyebrow: "Toolkit",
    headlineTop: "Mezo",
    headlineBottom: "Toolkit",
    tagline:
      "Faucets, explorers, RPCs, and resources to start building on Mezo L2.",
    cta: "Open the Toolkit →",
    path: "/mezo-toolkit",
  },
  about: {
    title: "About TipHive — Empowering Creators With Bitcoin",
    description:
      "Learn about TipHive's mission to empower creators with fee-less Bitcoin tipping on Mezo L2.",
    eyebrow: "About Us",
    headlineTop: "Empowering",
    headlineBottom: "Creators",
    tagline: "Building the Bitcoin-native creator economy on Mezo L2.",
    cta: "Learn Our Story →",
    path: "/about",
  },
  contact: {
    title: "Contact TipHive — Get in Touch With Our Team",
    description:
      "Have a question, idea, or partnership? Reach the TipHive team.",
    eyebrow: "Contact",
    headlineTop: "Let's",
    headlineBottom: "Connect",
    tagline:
      "Have a question, idea, or partnership? Reach the TipHive team.",
    cta: "Get in Touch →",
    path: "/contact",
  },
  privacy: {
    title: "Privacy Policy — How TipHive Handles Your Data",
    description:
      "How TipHive collects, uses, and protects your data on a non-custodial Bitcoin platform.",
    eyebrow: "Legal",
    headlineTop: "Privacy",
    headlineBottom: "Policy",
    tagline: "How TipHive collects, uses, and protects your data.",
    cta: "Read the Policy →",
    path: "/privacy",
  },
  terms: {
    title: "Terms of Service — TipHive Platform Agreement",
    description:
      "The terms and conditions governing your use of the TipHive Bitcoin-native creator platform.",
    eyebrow: "Legal",
    headlineTop: "Terms of",
    headlineBottom: "Service",
    tagline: "The terms and conditions governing your use of TipHive.",
    cta: "Read the Terms →",
    path: "/terms",
  },
  cookies: {
    title: "Cookie Policy — How TipHive Uses Cookies",
    description:
      "How TipHive uses cookies and local storage to deliver a fast, non-custodial experience.",
    eyebrow: "Legal",
    headlineTop: "Cookie",
    headlineBottom: "Policy",
    tagline:
      "How TipHive uses cookies and local storage to power the experience.",
    cta: "Read the Policy →",
    path: "/cookies",
  },
};

export function getPageOg(key: string): PageOg | null {
  return PAGES[key] ?? null;
}

const BASE_URL = "https://tiphive.xyz";

import type { Metadata } from "next";

export function buildPageMetadata(key: keyof typeof PAGES | string): Metadata {
  const meta = PAGES[key];
  if (!meta) return {};
  const url = `${BASE_URL}${meta.path}`;
  const ogTitle = `${meta.title} | TipHive`;
  const ogImageUrl = `${BASE_URL}/api/og/site?page=${key}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description: meta.description,
      url,
      siteName: "TipHive",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: meta.description,
      creator: "@TipHive",
      images: [ogImageUrl],
    },
  };
}
