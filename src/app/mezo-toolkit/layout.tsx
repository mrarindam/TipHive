import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/og-pages";

export const metadata: Metadata = buildPageMetadata("mezo-toolkit");

export default function MezoToolkitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
