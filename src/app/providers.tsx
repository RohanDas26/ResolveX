"use client";

import { AuthProvider } from "@/hooks/use-auth";
import { APIProvider } from "@vis.gl/react-google-maps";

export function Providers({ children }: { children: React.ReactNode }) {
  // IMPORTANT: You must create a .env.local file in the root of your project
  // and add your Google Maps API key there.
  // NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
  return (
    <AuthProvider>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        {children}
      </APIProvider>
    </AuthProvider>
  );
}
