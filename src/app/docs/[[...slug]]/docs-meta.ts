export type DocMeta = {
  title: string;
  description: string;
  eyebrow: string;
  headlineTop: string;
  headlineBottom: string;
  tagline: string;
  cta: string;
  path: string;
};

export const DOCS_META: Record<string, DocMeta> = {
  welcome: {
    title: "Documentation Hub — Build & Earn on TipHive",
    description:
      "Guides, references, and tutorials for tipping, earning, and building on TipHive — the Bitcoin-native creator platform on Mezo L2.",
    eyebrow: "Documentation",
    headlineTop: "Welcome to",
    headlineBottom: "TipHive Docs",
    tagline:
      "Guides, references, and tutorials to help you tip, earn, and build on Mezo L2.",
    cta: "Start Reading →",
    path: "/docs",
  },
  introduction: {
    title: "Introduction to TipHive — Bitcoin-Native Tipping",
    description:
      "An overview of TipHive — the Bitcoin-native tipping and creator monetization platform built on Mezo L2.",
    eyebrow: "Getting Started",
    headlineTop: "What is",
    headlineBottom: "TipHive?",
    tagline:
      "An overview of the Bitcoin-native tipping platform built on Mezo L2.",
    cta: "Learn the Basics →",
    path: "/docs/introduction",
  },
  "how-it-works": {
    title: "How TipHive Works — Tipping Flow on Mezo L2",
    description:
      "From wallet connection to instant payouts — the complete TipHive tipping flow explained step by step.",
    eyebrow: "Overview",
    headlineTop: "How",
    headlineBottom: "TipHive Works",
    tagline:
      "From wallet connection to instant payouts — the complete tipping flow explained.",
    cta: "See the Flow →",
    path: "/docs/how-it-works",
  },
  "creator-setup": {
    title: "Creator Setup — Launch Your TipHive Profile",
    description:
      "Set up your TipHive profile, connect your wallet, and start earning in Bitcoin in minutes.",
    eyebrow: "Creators",
    headlineTop: "Creator",
    headlineBottom: "Setup Guide",
    tagline:
      "Set up your profile, connect your wallet, and start earning in Bitcoin in minutes.",
    cta: "Start Earning →",
    path: "/docs/creator-setup",
  },
  "tipping-model": {
    title: "The Tipping Model — Fee-less Bitcoin Payments",
    description:
      "Understand how zero-fee Bitcoin-native tips flow from fans to creators on TipHive.",
    eyebrow: "Tipping",
    headlineTop: "The Tipping",
    headlineBottom: "Model",
    tagline:
      "Understand how zero-fee Bitcoin-native tips flow from fans to creators.",
    cta: "Explore the Model →",
    path: "/docs/tipping-model",
  },
  "public-profile": {
    title: "Your Public Profile — Showcase & Get Paid",
    description:
      "Customize your profile, share your link, and receive tips from anywhere on the web.",
    eyebrow: "Creators",
    headlineTop: "Your Public",
    headlineBottom: "Profile",
    tagline:
      "Customize your profile, share your link, and receive tips from anywhere on the web.",
    cta: "Build Your Profile →",
    path: "/docs/public-profile",
  },
  "subscriptions-model": {
    title: "Subscriptions Model — Memberships & Recurring",
    description:
      "Build recurring revenue with on-chain Bitcoin subscriptions and gated content.",
    eyebrow: "Monetization",
    headlineTop: "Subscriptions",
    headlineBottom: "& Memberships",
    tagline:
      "Build recurring revenue with on-chain Bitcoin subscriptions and gated content.",
    cta: "Set Up Memberships →",
    path: "/docs/subscriptions-model",
  },
  "messaging-social": {
    title: "Messaging & Social — Connect With Your Fans",
    description:
      "Direct message your supporters, build community, and grow your audience natively on TipHive.",
    eyebrow: "Social",
    headlineTop: "Messaging",
    headlineBottom: "& Social",
    tagline:
      "DM your supporters, build community, and grow your audience natively on TipHive.",
    cta: "Engage Your Fans →",
    path: "/docs/messaging-social",
  },
  "referral-program": {
    title: "Referral Program — Earn by Inviting Creators",
    description:
      "Invite creators and fans to TipHive and earn rewards on every action they take.",
    eyebrow: "Rewards",
    headlineTop: "Referral",
    headlineBottom: "Program",
    tagline:
      "Invite creators and fans to TipHive and earn rewards on every action they take.",
    cta: "Start Referring →",
    path: "/docs/referral-program",
  },
  "posting-earning": {
    title: "Posting & Earning — Content Monetization Guide",
    description:
      "Publish posts, gate content, and turn every interaction into Bitcoin earnings on TipHive.",
    eyebrow: "Earn",
    headlineTop: "Posting",
    headlineBottom: "& Earning",
    tagline:
      "Publish posts, gate content, and turn every interaction into Bitcoin earnings.",
    cta: "Start Posting →",
    path: "/docs/posting-earning",
  },
  "visual-toolkit": {
    title: "Visual Toolkit — Brand Assets, Logos & Badges",
    description:
      "Download brand assets, badges, and embeddable widgets to use across your channels.",
    eyebrow: "Assets",
    headlineTop: "Visual",
    headlineBottom: "Toolkit",
    tagline:
      "Download brand assets, badges, and embeddable widgets to use across your channels.",
    cta: "Download Assets →",
    path: "/docs/visual-toolkit",
  },
  "smart-contracts": {
    title: "Smart Contracts — TipHive On-Chain Reference",
    description:
      "Explore the audited Mezo L2 contracts powering tips, gating, and subscriptions on TipHive.",
    eyebrow: "Technical",
    headlineTop: "Smart",
    headlineBottom: "Contracts",
    tagline:
      "Explore the audited Mezo L2 contracts powering tips, gating, and subscriptions.",
    cta: "View Contracts →",
    path: "/docs/smart-contracts",
  },
  "musd-protocol": {
    title: "MUSD Protocol — Bitcoin-Backed Stablecoin Guide",
    description:
      "How MUSD — the Bitcoin-backed dollar on Mezo L2 — powers stable, fee-less creator payments.",
    eyebrow: "Protocol",
    headlineTop: "The MUSD",
    headlineBottom: "Protocol",
    tagline:
      "How MUSD — the Bitcoin-backed dollar — powers stable, fee-less creator payments.",
    cta: "Learn About MUSD →",
    path: "/docs/musd-protocol",
  },
  "dev-setup": {
    title: "Developer Setup — Build on the TipHive Stack",
    description:
      "Clone the repo, configure your environment, and start hacking on TipHive locally.",
    eyebrow: "Developers",
    headlineTop: "Developer",
    headlineBottom: "Setup",
    tagline:
      "Clone the repo, configure your environment, and start hacking on TipHive locally.",
    cta: "Start Building →",
    path: "/docs/dev-setup",
  },
  "architecture-stack": {
    title: "Architecture & Stack — How TipHive Is Built",
    description:
      "Next.js, Supabase, Mezo L2, and the full stack powering the TipHive platform.",
    eyebrow: "Developers",
    headlineTop: "Architecture",
    headlineBottom: "& Stack",
    tagline:
      "Next.js, Supabase, Mezo L2, and the full stack powering the TipHive platform.",
    cta: "Explore the Stack →",
    path: "/docs/architecture-stack",
  },
  "database-schema": {
    title: "Database Schema — Tables, Relations & Indexes",
    description:
      "Reference every table, column, and relationship in the TipHive Postgres schema.",
    eyebrow: "Developers",
    headlineTop: "Database",
    headlineBottom: "Schema",
    tagline:
      "Reference every table, column, and relationship in the TipHive Postgres schema.",
    cta: "View the Schema →",
    path: "/docs/database-schema",
  },
  "api-reference": {
    title: "API Reference — Endpoints, Auth & Examples",
    description:
      "Complete endpoint reference, authentication flows, and request/response examples for the TipHive API.",
    eyebrow: "API",
    headlineTop: "API",
    headlineBottom: "Reference",
    tagline:
      "Complete endpoint reference, authentication flows, and request/response examples.",
    cta: "Try the API →",
    path: "/docs/api-reference",
  },
  "auth-security": {
    title: "Auth & Security — Wallet, Sessions & Policies",
    description:
      "Wallet-based authentication, session handling, and the TipHive platform security model.",
    eyebrow: "Security",
    headlineTop: "Auth",
    headlineBottom: "& Security",
    tagline:
      "Wallet-based authentication, session handling, and platform security model.",
    cta: "Read the Spec →",
    path: "/docs/auth-security",
  },
  "deployment-infra": {
    title: "Deployment & Infra — Hosting, CI/CD & Edge",
    description:
      "How TipHive is deployed across Vercel, edge functions, and Mezo L2 infrastructure.",
    eyebrow: "Infra",
    headlineTop: "Deployment",
    headlineBottom: "& Infra",
    tagline:
      "How TipHive is deployed across Vercel, edge functions, and Mezo L2 infrastructure.",
    cta: "View Infra Setup →",
    path: "/docs/deployment-infra",
  },
};

export function resolveDocMeta(slug?: string[]): DocMeta {
  const key = slug?.[0] ?? "welcome";
  return DOCS_META[key] ?? DOCS_META.welcome;
}
