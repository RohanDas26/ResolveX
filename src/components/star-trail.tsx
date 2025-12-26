
'use client';

import { useEffect } from 'react';

export default function StarTrail() {
  useEffect(() => {
    const starTrail = document.getElementById('star-trail');
    if (!starTrail) return;

    // Don't create stars if the element already has them from a previous render
    if (starTrail.childElementCount > 0) return;

    const createStar = () => {
      if (document.querySelectorAll('.star').length > 200) return;

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
