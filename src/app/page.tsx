
"use client";

import GrievanceMap from "@/components/grievance-map";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Grievance } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

const TELANGANA_CENTER = { lat: 17.8739, lng: 79.1103 };
const INITIAL_ZOOM = 8;
const DETAIL_ZOOM = 15;

export default function Home() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState(TELANGANA_CENTER);
  const [mapZoom, setMapZoom] = useState(INITIAL_ZOOM);

  const grievancesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "grievances"));
  }, [firestore]);

  const { data: grievances, isLoading } = useCollection<Grievance>(grievancesQuery);

  const selectedGrievance = useMemo(() => {
    return grievances?.find(g => g.id === selectedGrievanceId) || null;
  }, [grievances, selectedGrievanceId]);

  useEffect(() => {
    const grievanceIdFromUrl = searchParams.get('id');
    if (grievanceIdFromUrl && grievances) {
      const grievance = grievances.find(g => g.id === grievanceIdFromUrl);
      if (grievance) {
        setSelectedGrievanceId(grievanceIdFromUrl);
        // Start zoomed out, then zoom in
        setMapZoom(INITIAL_ZOOM);
        setMapCenter(TELANGANA_CENTER);

        setTimeout(() => {
          setMapCenter({ lat: grievance.location.latitude, lng: grievance.location.longitude });
          setMapZoom(DETAIL_ZOOM);
        }, 500); // Delay for the "zoom in" effect
      }
    }
  }, [searchParams, grievances]);
  
  const handleMarkerClick = (id: string | null) => {
    setSelectedGrievanceId(id);
     if (id) {
      const grievance = grievances?.find(g => g.id === id);
      if (grievance) {
        setMapCenter({ lat: grievance.location.latitude, lng: grievance.location.longitude });
        setMapZoom(DETAIL_ZOOM);
      }
    }
  }

  if (isLoading) {
    return (
      <div className="relative h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-muted">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Live Grievance Data...</p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <GrievanceMap 
        grievances={grievances} 
        onMarkerClick={handleMarkerClick}
        selectedGrievanceId={selectedGrievanceId}
        center={mapCenter}
        zoom={mapZoom}
      />
    </div>
  );
}
