
'use client';

import HeaderLayout from '@/components/HeaderLayout';
import StarTrail from '@/components/star-trail';
import { usePathname } from 'next/navigation';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define paths where the star trail should NOT be shown
  const noStarTrailPaths = ['/map', '/admin', '/directions'];

  // Check if the current path starts with any of the excluded paths
  const showStarTrail = !noStarTrailPaths.some(path => pathname.startsWith(path));

  return (
    <div className="relative flex flex-col min-h-screen">
      {showStarTrail && <StarTrail />}
      <HeaderLayout />
      <main className="flex-1">{children}</main>
    </div>
  );
}
