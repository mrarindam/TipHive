import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/og-pages";

export const metadata: Metadata = buildPageMetadata("contact");

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
