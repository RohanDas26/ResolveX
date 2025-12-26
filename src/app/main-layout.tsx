"use client";

import Header from "@/components/header";
import { useEffect } from "react";

function StarTrail() {
  useEffect(() => {
    const starContainer = document.getElementById('star-trail');
    if (!starContainer) return;

    // Clear any existing stars before adding new ones
    starContainer.innerHTML = '';

    for (let i = 0; i < 70; i++) { // Increased star count for more density
      const star = document.createElement('div');
      star.classList.add('star');
      const size = Math.random() * 2 + 0.5; // Smaller stars for a finer feel
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;

      // Varying animation durations and delays for a parallax effect
      const duration = Math.random() * 5 + 3; // 3s to 8s
      const delay = Math.random() * 5; // 0s to 5s
      
      star.style.animationDuration = `${duration}s`;
      star.style.animationDelay = `-${delay}s`; // Negative delay starts partway through

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
