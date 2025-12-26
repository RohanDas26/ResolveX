"use client";

import { Map, AdvancedMarker, InfoWindow, Pin } from "@vis.gl/react-google-maps";
import { useEffect, useState, useCallback } from "react";
import { collection, onSnapshot, Query, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Grievance } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./ui/button";

const KLH_HYD_COORDS = { lat: 17.3033, lng: 78.5833 };

export default function GrievanceMap() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);

  const selectedGrievance = grievances.find(g => g.id === selectedGrievanceId) || null;

  useEffect(() => {
    const q: Query = query(collection(db, "grievances"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newGrievances: Grievance[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Basic validation
        if (data.location && data.createdAt) {
          newGrievances.push({
            id: doc.id,
            ...data,
            location: data.location,
            createdAt: data.createdAt.toDate(),
          } as Grievance);
        }
      });
      setGrievances(newGrievances);
    }, (error) => {
      console.error("Error fetching grievances: ", error);
    });

    return () => unsubscribe();
  }, []);
  
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
      {grievances.map((grievance) => (
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
                By {selectedGrievance.userName} • {formatDistanceToNow(selectedGrievance.createdAt, { addSuffix: true })}
              </CardDescription>
              <p className="text-sm font-semibold mt-2">Status: <span className="text-accent">{selectedGrievance.status}</span></p>
            </CardContent>
        </InfoWindow>
      )}
    </Map>
  );
}
