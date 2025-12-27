
"use client";

import GrievanceMap from "@/components/grievance-map";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { type Grievance } from "@/lib/types";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useMap } from "@vis.gl/react-google-maps";
import { collection } from "firebase/firestore";
import { DEMO_GRIEVANCES } from "@/lib/demo-data";


const TELANGANA_CENTER = { lat: 17.8739, lng: 79.1103 };
const INITIAL_ZOOM = 8;
const DETAIL_ZOOM = 15;

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
  const firestore = useFirestore();
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);
  const { user, isUserLoading } = useUser();

  const grievancesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'grievances');
  }, [firestore]);
  
  const { data: liveGrievances, isLoading: isGrievancesLoading } = useCollection<Grievance>(grievancesQuery);

  const grievances = useMemo(() => {
    // Prioritize live data, but fall back to demo data if live data is empty or null
    if (liveGrievances && liveGrievances.length > 0) {
      return liveGrievances;
    }
    if (!isGrievancesLoading && (!liveGrievances || liveGrievances.length === 0)) {
        // @ts-ignore
        return DEMO_GRIEVANCES;
    }
    return []; // Return empty while loading initially
  }, [liveGrievances, isGrievancesLoading]);


  useEffect(() => {
    const grievanceIdFromUrl = searchParams.get('id');
    if (grievanceIdFromUrl) {
        setSelectedGrievanceId(grievanceIdFromUrl);
    }
  }, [searchParams]);
  
  const selectedGrievance = useMemo(() => {
    // Check both live and demo data for the selected ID
    return grievances?.find(g => g.id === selectedGrievanceId) || null;
  }, [grievances, selectedGrievanceId]);
  
  const handleMarkerClick = (id: string | null) => {
    setSelectedGrievanceId(id);
  }

  if ((isGrievancesLoading && (!liveGrievances || liveGrievances.length === 0)) || isUserLoading) {
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
