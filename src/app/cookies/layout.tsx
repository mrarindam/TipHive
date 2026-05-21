import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/og-pages";

export const metadata: Metadata = buildPageMetadata("cookies");

export default function CookiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
