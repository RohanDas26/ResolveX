
"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { FirebaseClientProvider } from "@/firebase";

export function Providers({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    // In a real app, you might have a fallback or a different rendering path.
    // For this example, we'll throw an error to make the problem visible.
    // You could also return a loading state or a message to the user.
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Google Maps API Key is missing. The map cannot be displayed.</p>
      </div>
    );
  }
  
  return (
    <APIProvider 
      apiKey={apiKey} 
      libraries={['visualization', 'routes', 'places', 'geometry']}
      solutionChannel="GMP_visgl_rgm_v1_next"
    >
      <FirebaseClientProvider>
        {children}
      </FirebaseClientProvider>
    </APIProvider>
  );
}
