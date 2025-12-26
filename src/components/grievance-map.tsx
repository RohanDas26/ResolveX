"use client";

import { Map, AdvancedMarker, InfoWindow, Pin } from "@vis.gl/react-google-maps";
import { useState, useCallback } from "react";
import { collectionGroup, query } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { type Grievance } from "@/lib/types";
import { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

const KLH_HYD_COORDS = { lat: 17.3033, lng: 78.5833 };

export default function GrievanceMap() {
  const firestore = useFirestore();
  const grievancesQuery = useMemoFirebase(() => query(collectionGroup(firestore, "grievances")), [firestore]);
  const { data: grievances } = useCollection<Grievance>(grievancesQuery);
  
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);

  const selectedGrievance = grievances?.find(g => g.id === selectedGrievanceId) || null;
  
  const handleMarkerClick = useCallback((grievanceId: string) => {
    setSelectedGrievanceId(grievanceId);
  }, []);

  const handleCloseInfoWindow = useCallback(() => {
    setSelectedGrievanceId(null);
  }, []);

  return (
    <Map
      defaultCenter={KLH_HYD_COORDS}
      defaultZoom={15}
      mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "RESOLVEX_MAP"}
      className="w-full h-full"
      gestureHandling={'greedy'}
      disableDefaultUI={true}
      streetViewControl={false}
      zoomControl={true}
      mapTypeControl={false}
    >
      {grievances && grievances.map((grievance) => (
        <AdvancedMarker
          key={grievance.id}
          position={{ lat: grievance.location.latitude, lng: grievance.location.longitude }}
          onClick={() => handleMarkerClick(grievance.id)}
        >
          <Pin
            background={"#9D4EDD"}
            borderColor={"#48BFE3"}
            glyphColor={"#FFFFFF"}
          />
        </AdvancedMarker>
      ))}

      {selectedGrievance && (
        <InfoWindow
          position={{ lat: selectedGrievance.location.latitude, lng: selectedGrievance.location.longitude }}
          onCloseClick={handleCloseInfoWindow}
          maxWidth={300}
        >
            <CardHeader className="p-2 pb-0">
              <div className="relative w-full h-40 mb-2 rounded-md overflow-hidden">
                <Image
                  src={selectedGrievance.imageUrl}
                  alt={selectedGrievance.description}
                  fill
                  className="object-cover"
                  data-ai-hint="issue photo"
                />
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <CardTitle className="text-base font-semibold leading-tight mb-1">{selectedGrievance.description}</CardTitle>
              <CardDescription className="text-xs">
                By {selectedGrievance.userName} • {selectedGrievance.createdAt ? formatDistanceToNow(selectedGrievance.createdAt, { addSuffix: true }) : 'Just now'}
              </CardDescription>
              <p className="text-sm font-semibold mt-2">Status: <span className="text-accent">{selectedGrievance.status}</span></p>
            </CardContent>
        </InfoWindow>
      )}
    </Map>
  );
}
