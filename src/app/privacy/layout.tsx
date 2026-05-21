import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/og-pages";

export const metadata: Metadata = buildPageMetadata("privacy");

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
