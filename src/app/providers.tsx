"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { FirebaseClientProvider } from "@/firebase";

export function Providers({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  }
  
  return (
    <FirebaseClientProvider>
      <APIProvider apiKey={apiKey}>
        {children}
      </APIProvider>
    </FirebaseClientProvider>
  );
}
