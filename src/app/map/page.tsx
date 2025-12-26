
"use client";

import GrievanceMap from "@/components/grievance-map";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { type Grievance } from "@/lib/types";
import { useUser } from "@/firebase";
import { useMap } from "@vis.gl/react-google-maps";

const TELANGANA_CENTER = { lat: 17.8739, lng: 79.1103 };
const INITIAL_ZOOM = 8;
const DETAIL_ZOOM = 15;

// Access the global store
// @ts-ignore
const grievanceStore = typeof window !== 'undefined' ? window.grievanceStore : null;

function MapEffect({ selectedGrievance }: { selectedGrievance: Grievance | null }) {
    const map = useMap();

    useEffect(() => {
        if (map && selectedGrievance) {
            // Start zoomed out, then zoom in
            map.setZoom(INITIAL_ZOOM);
            map.setCenter(TELANGANA_CENTER);

            setTimeout(() => {
                map.setCenter({ lat: selectedGrievance.location.latitude, lng: selectedGrievance.location.longitude });
                map.setZoom(DETAIL_ZOOM);
            }, 500); // Delay for the "zoom in" effect
        }
    }, [map, selectedGrievance]);

    return null;
}


export default function MapPage() {
  const searchParams = useSearchParams();
  const [grievances, setGrievances] = useState<Grievance[] | null>(null);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);
  const { user, isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  // This flag ensures the initial zoom effect runs only once
  const initialEffectRan = useRef(false);
  
  useEffect(() => {
    // Access store only on the client
    if (grievanceStore) {
        setGrievances(grievanceStore.get());
        const handleUpdate = () => {
            setGrievances([...grievanceStore.get()]);
        };
        const unsubscribe = grievanceStore.subscribe(handleUpdate);
        setIsLoading(false);
        return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    const grievanceIdFromUrl = searchParams.get('id');
    if (grievanceIdFromUrl && !initialEffectRan.current) {
        setSelectedGrievanceId(grievanceIdFromUrl);
        initialEffectRan.current = true;
    }
  }, [searchParams]);
  
  const selectedGrievance = useMemo(() => {
    return grievances?.find(g => g.id === selectedGrievanceId) || null;
  }, [grievances, selectedGrievanceId]);
  
  const handleMarkerClick = (id: string | null) => {
    setSelectedGrievanceId(id);
  }

  if (isLoading || isUserLoading) {
    return (
      <div className="relative h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-muted animate-fade-in">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Live Grievance Data...</p>
      </div>
    );
  }
  
  return (
    <div className="relative h-[calc(100vh-4rem)] w-full animate-fade-in">
      <GrievanceMap 
        grievances={grievances} 
        onMarkerClick={handleMarkerClick}
        selectedGrievanceId={selectedGrievanceId}
        currentUserId={user?.uid}
      >
        {selectedGrievance && <MapEffect selectedGrievance={selectedGrievance} />}
      </GrievanceMap>
    </div>
  );
}
