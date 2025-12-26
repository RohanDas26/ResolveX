'use client';

import { useState, useEffect } from 'react';
import HeaderLayout from '@/components/HeaderLayout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen">
      <HeaderLayout />
      <main className="flex-1">{children}</main>
      <div
        className="pointer-events-none fixed inset-0 z-30 transition duration-300"
        style={{
          background: `radial-gradient(300px at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary) / 0.15), transparent 80%)`,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-30 transition duration-300"
        style={{
          background: `radial-gradient(300px at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--accent) / 0.15), transparent 80%)`,
        }}
      />
    </div>
  );
}
