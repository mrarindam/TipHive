import type { Metadata } from "next";
import { resolveDocMeta } from "./docs-meta";

const BASE_URL = "https://tiphive.xyz";

type DocsLayoutProps = {
  children: React.ReactNode;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = resolveDocMeta(slug);
  const url = `${BASE_URL}${meta.path}`;
  const ogTitle = `${meta.title} | TipHive`;
  const slugKey = slug?.[0] ?? "welcome";
  const ogImageUrl = `${BASE_URL}/api/og/docs?slug=${slugKey}`;

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
      type: "article",
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

export default async function DocsLayout({ children }: DocsLayoutProps) {
  return children;
}
