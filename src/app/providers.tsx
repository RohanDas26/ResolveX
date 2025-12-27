
"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

function MapProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
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

  if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
    return (
      <div className="flex h-screen w-full items-center justify-center p-4 text-center">
        <div className="max-w-md rounded-lg border-2 border-destructive bg-destructive/10 p-6 text-destructive">
            <h2 className="text-xl font-bold">Google Maps API Key Error</h2>
            <p className="mt-2">
                The Google Maps API Key is missing or invalid. Please check your <code className="font-mono bg-destructive/20 px-1 py-0.5 rounded">.env.local</code> file and ensure that <code className="font-mono bg-destructive/20 px-1 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> is set to your correct key.
            </p>
        </div>
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
      <MapProvider>
        {children}
      </MapProvider>
  );
}
