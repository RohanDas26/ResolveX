
"use client";

import Header from '@/components/header';
import { useEffect } from 'react';

function StarTrail() {
  useEffect(() => {
    const starTrail = document.getElementById('star-trail');
    if (!starTrail) return;

    const createStar = () => {
      const star = document.createElement('div');
      star.classList.add('star');
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = '-10px';
      const duration = Math.random() * 5 + 5; // 5 to 10 seconds
      star.style.animationDuration = `${duration}s`;
      star.style.opacity = `${Math.random() * 0.5 + 0.3}`;

      starTrail.appendChild(star);

      setTimeout(() => {
        star.remove();
      }, duration * 1000);
    };

    const interval = setInterval(createStar, 50);

    return () => clearInterval(interval);
  }, []);

  return <div id="star-trail" className="fixed top-0 left-0 w-full h-full star-trail -z-10"></div>;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="relative flex flex-col min-h-screen">
      <StarTrail />
      <div className="p-4">
        <div className="relative w-full bg-background/80 backdrop-blur-sm rounded-md border border-border">
          <Header />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
