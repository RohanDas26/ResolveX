"use client";

import Header from "@/components/header";
import { useEffect } from "react";

function StarTrail() {
  useEffect(() => {
    const starContainer = document.getElementById('star-trail');
    if (!starContainer) return;

    for (let i = 0; i < 50; i++) {
      const star = document.createElement('div');
      star.classList.add('star');
      const size = Math.random() * 3 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 5}s`;
      star.style.animationDuration = `${Math.random() * 3 + 2}s`;
      starContainer.appendChild(star);
    }
  }, []);

  return <div id="star-trail" className="star-trail"></div>;
}


export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <StarTrail />
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}
