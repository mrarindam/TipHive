'use client';

import DashboardLayoutWrapper from '@/components/providers/DashboardProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
