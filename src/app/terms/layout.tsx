import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/og-pages";

export const metadata: Metadata = buildPageMetadata("terms");

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
