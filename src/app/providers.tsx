
"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { FirebaseClientProvider } from "@/firebase";
import { useFirebase } from "@/firebase/provider";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

function MapProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // This ensures the env variable is only read on the client side
    setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || null);
  }, []);

  if (apiKey === null) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading Map Configuration...</p>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4 text-center">
        <p>
          Google Maps API Key is missing. The map cannot be displayed. Please set
          the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable in your
          .env.local file.
        </p>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={apiKey}
      libraries={['visualization', 'routes', 'places', 'geometry']}
      solutionChannel="GMP_visgl_rgm_v1_next"
    >
      {children}
    </APIProvider>
  );
}


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <MapProvider>
        {children}
      </MapProvider>
    </FirebaseClientProvider>
  );
}
