
"use client";

import { Map, AdvancedMarker, InfoWindow, Pin } from "@vis.gl/react-google-maps";
import { useState, useCallback, useMemo, ReactNode, useEffect } from "react";
import { type Grievance } from "@/lib/types";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

const TELANGANA_CENTER = { lat: 17.8739, lng: 79.1103 };

type GrievanceWithPinColor = Grievance & { pinColor?: string };

interface GrievanceMapProps {
  grievances?: GrievanceWithPinColor[] | null;
  children?: ReactNode;
  onMarkerClick?: (grievanceId: string | null) => void;
  selectedGrievanceId?: string | null;
}

export default function GrievanceMap({ 
  grievances, 
  children, 
  onMarkerClick, 
  selectedGrievanceId: externalSelectedId
}: GrievanceMapProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

  // Allow parent component to control the selected ID
  const selectedGrievanceId = externalSelectedId !== undefined ? externalSelectedId : internalSelectedId;
  const setSelectedGrievanceId = onMarkerClick || setInternalSelectedId;

  // Sync internal state if external state changes
  useEffect(() => {
    if (externalSelectedId !== undefined) {
      setInternalSelectedId(externalSelectedId);
    }
  }, [externalSelectedId]);

  const selectedGrievance = useMemo(() => 
    grievances?.find(g => g.id === selectedGrievanceId) || null
  , [grievances, selectedGrievanceId]);
  
  const handleMarkerClick = useCallback((grievanceId: string) => {
    setSelectedGrievanceId(grievanceId);
  }, [setSelectedGrievanceId]);

  const handleCloseInfoWindow = useCallback(() => {
    if (onMarkerClick) {
      onMarkerClick(null);
    } else {
      setInternalSelectedId(null);
    }
  }, [onMarkerClick]);

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
      defaultCenter={TELANGANA_CENTER}
      defaultZoom={8}
      mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "RESOLVEX_MAP"}
      className="w-full h-full"
      gestureHandling={'greedy'}
      disableDefaultUI={false}
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
          <div className={cn(selectedGrievanceId === grievance.id && "pulsating-pin rounded-full")}>
            <Pin
              background={selectedGrievanceId === grievance.id ? 'hsl(var(--primary))' : (grievance.pinColor || "#ef4444")}
              borderColor={selectedGrievanceId === grievance.id ? 'hsl(var(--primary))' : "#ffffff"}
              glyphColor={"#ffffff"}
              scale={selectedGrievanceId === grievance.id ? 1.5 : 1}
            />
          </div>
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
      {children}
    </Map>
  );
}
