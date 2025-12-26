
'use client';

import Header from '@/components/header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <div className="ambient-background" />
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
