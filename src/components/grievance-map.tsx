
"use client";

import { Map, AdvancedMarker, InfoWindow, Pin } from "@vis.gl/react-google-maps";
import { useState, useCallback, useMemo } from "react";
import { collection, query } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { type Grievance } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "./ui/badge";

const KLH_HYD_COORDS = { lat: 17.3033, lng: 78.5833 };

type GrievanceWithPinColor = Grievance & { pinColor?: string };

interface GrievanceMapProps {
  grievances?: GrievanceWithPinColor[] | null;
}

export default function GrievanceMap({ grievances: initialGrievances }: GrievanceMapProps) {
  const firestore = useFirestore();
  const grievancesQuery = useMemoFirebase(() => {
    if (initialGrievances || !firestore) return null;
    return query(collection(firestore, "grievances"));
  }, [firestore, initialGrievances]);
  
  const { data: fetchedGrievances } = useCollection<Grievance>(grievancesQuery);
  const grievances = useMemo(() => initialGrievances || fetchedGrievances, [initialGrievances, fetchedGrievances]);
  
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);

  const selectedGrievance = grievances?.find(g => g.id === selectedGrievanceId) || null;
  
  const handleMarkerClick = useCallback((grievanceId: string) => {
    setSelectedGrievanceId(grievanceId);
  }, []);

  const handleCloseInfoWindow = useCallback(() => {
    setSelectedGrievanceId(null);
  }, []);

  const getStatusVariant = (status: Grievance['status']): "default" | "secondary" | "destructive" => {
    switch(status) {
      case 'Resolved': return 'default';
      case 'In Progress': return 'secondary';
      case 'Submitted':
      default:
        return 'destructive';
    }
  }

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
            background={grievance.pinColor || "#ef4444"}
            borderColor={"#ffffff"}
            glyphColor={"#ffffff"}
          />
        </AdvancedMarker>
      ))}

      {selectedGrievance && (
        <InfoWindow
          position={{ lat: selectedGrievance.location.latitude, lng: selectedGrievance.location.longitude }}
          onCloseClick={handleCloseInfoWindow}
          maxWidth={320}
          headerDisabled
        >
            <div className="w-full max-w-xs rounded-lg overflow-hidden bg-background text-foreground shadow-xl">
              <div className="relative w-full h-40">
                  <Image
                      src={selectedGrievance.imageUrl}
                      alt={selectedGrievance.description}
                      fill
                      className="object-cover"
                      data-ai-hint="issue photo"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
              </div>
              <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-base leading-tight truncate pr-2">{selectedGrievance.description}</h3>
                      <Badge variant={getStatusVariant(selectedGrievance.status)} className="shrink-0">{selectedGrievance.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                      By {selectedGrievance.userName} • {selectedGrievance.createdAt ? formatDistanceToNow(new Date(selectedGrievance.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}
                  </p>
              </div>
          </div>
        </InfoWindow>
      )}
    </Map>
  );
}
