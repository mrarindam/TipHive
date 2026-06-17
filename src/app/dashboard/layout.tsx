'use client';

import DashboardLayoutWrapper from '@/components/providers/DashboardProvider';
export { useDashboard, type CreatorProfile, type Activity, type DashboardContextType } from '@/components/providers/DashboardProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
