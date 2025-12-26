
'use client';

import { useEffect } from 'react';

export default function StarTrail() {
  useEffect(() => {
    const starTrail = document.getElementById('star-trail');
    if (!starTrail) return;

    // Don't create flakes if the element already has them from a previous render
    if (starTrail.childElementCount > 0) return;

    const createSnowFlake = () => {
      // Allow more flakes on screen for a denser snowfall effect
      if (document.querySelectorAll('.star').length > 500) return;

      const flake = document.createElement('div');
      flake.classList.add('star'); // We can reuse the 'star' class and its animation
      
      // Make flakes smaller and more uniform
      const size = Math.random() * 1.5 + 0.5; 
      flake.style.width = `${size}px`;
      flake.style.height = `${size}px`;
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.top = '-10px';
      
      // Adjust fall speed to feel more like snow
      const duration = Math.random() * 8 + 6; // 6 to 14 seconds
      flake.style.animationDuration = `${duration}s`;
      
      // Adjust opacity for a softer, snowy look
      flake.style.opacity = `${Math.random() * 0.6 + 0.4}`;

      starTrail.appendChild(flake);

      setTimeout(() => {
        flake.remove();
      }, duration * 1000);
    };

    // Create flakes more frequently for a denser effect
    const interval = setInterval(createSnowFlake, 10);

    return () => clearInterval(interval);
  }, []);

  return <div id="star-trail" className="fixed top-0 left-0 w-full h-full star-trail -z-10"></div>;
}
