import type { MetadataRoute } from "next";

const BASE_URL = "https://tiphive.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const corePages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/explore`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/mezo-toolkit`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const docsCreatorSlugs = [
    "introduction",
    "how-it-works",
    "creator-setup",
    "tipping-model",
    "public-profile",
    "subscriptions-model",
    "messaging-social",
    "referral-program",
    "posting-earning",
    "visual-toolkit",
  ];

  const docsDeveloperSlugs = [
    "smart-contracts",
    "musd-protocol",
    "dev-setup",
    "architecture-stack",
    "database-schema",
    "api-reference",
    "auth-security",
    "deployment-infra",
  ];

  const docsPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/docs`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...[...docsCreatorSlugs, ...docsDeveloperSlugs].map((slug) => ({
      url: `${BASE_URL}/docs/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  const legalPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/cookies`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...corePages, ...docsPages, ...legalPages];
}
