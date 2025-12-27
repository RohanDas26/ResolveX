
"use client";

import GrievanceMap from "@/components/grievance-map";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { type Grievance } from "@/lib/types";
import { useUser } from "@/firebase";
import { useMap } from "@vis.gl/react-google-maps";
import { DEMO_GRIEVANCES } from "@/lib/demo-data";

const TELANGANA_CENTER = { lat: 17.8739, lng: 79.1103 };
const INITIAL_ZOOM = 8;
const DETAIL_ZOOM = 15;

function MapEffect({ selectedGrievance }: { selectedGrievance: Grievance | null }) {
    const map = useMap();

    useEffect(() => {
        if (map && selectedGrievance) {
            map.setCenter({ lat: selectedGrievance.location.latitude, lng: selectedGrievance.location.longitude });
            map.setZoom(DETAIL_ZOOM);
        }
    }, [map, selectedGrievance]);

    return null;
}

export default function MapPage() {
  const searchParams = useSearchParams();
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);
  const { user, isUserLoading } = useUser();
  const [grievances, setGrievances] = useState<Grievance[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setIsLoading(true);
    setTimeout(() => {
        setGrievances(DEMO_GRIEVANCES);
        setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    const grievanceIdFromUrl = searchParams.get('id');
    if (grievanceIdFromUrl && grievances) {
        const grievanceExists = grievances.some(g => g.id === grievanceIdFromUrl);
        if (grievanceExists) {
             setSelectedGrievanceId(grievanceIdFromUrl);
        }
    }
  }, [searchParams, grievances]);
  
  const selectedGrievance = useMemo(() => {
    return grievances?.find(g => g.id === selectedGrievanceId) || null;
  }, [grievances, selectedGrievanceId]);
  
  const handleMarkerClick = (id: string | null) => {
    setSelectedGrievanceId(id);
  }

  // Show loader if user auth state is loading or grievances are loading
  const isPageLoading = isUserLoading || isLoading;

  if (isPageLoading) {
    return (
      <div className="relative h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-muted animate-fade-in">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Map Data...</p>
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

    