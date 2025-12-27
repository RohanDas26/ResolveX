
"use client";

import { Map, AdvancedMarker, InfoWindow, Pin } from "@vis.gl/react-google-maps";
import { useState, useCallback, useMemo, ReactNode, useEffect } from "react";
import { type Grievance } from "@/lib/types";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./ui/button";

const TELANGANA_CENTER = { lat: 17.8739, lng: 79.1103 };

type GrievanceWithPinColor = Grievance & { pinColor?: string };

interface GrievanceMapProps {
  grievances?: GrievanceWithPinColor[] | null;
  children?: ReactNode;
  onMarkerClick?: (grievanceId: string | null) => void;
  selectedGrievanceId?: string | null;
  currentUserId?: string | null;
}

export default function GrievanceMap({ 
  grievances, 
  children, 
  onMarkerClick, 
  selectedGrievanceId: externalSelectedId,
  currentUserId
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
      {grievances && grievances.map((grievance) => {
        const isSelected = selectedGrievanceId === grievance.id;
        const isUsersReport = currentUserId === grievance.userId;
        const shouldPulsate = isSelected || isUsersReport;

        return (
          <AdvancedMarker
            key={grievance.id}
            position={{ lat: grievance.location.latitude, lng: grievance.location.longitude }}
            onClick={() => handleMarkerClick(grievance.id)}
          >
            <div className={cn(shouldPulsate && "pulsating-pin rounded-full")}>
              <Pin
                background={isSelected || isUsersReport ? 'hsl(var(--primary))' : (grievance.pinColor || "#ef4444")}
                borderColor={isSelected || isUsersReport ? 'hsl(var(--primary))' : "#ffffff"}
                glyphColor={"#ffffff"}
                scale={isSelected ? 1.5 : 1}
              />
            </div>
          </AdvancedMarker>
        )
      })}

      {selectedGrievance && (
        <InfoWindow
          position={{ lat: selectedGrievance.location.latitude, lng: selectedGrievance.location.longitude }}
          onCloseClick={handleCloseInfoWindow}
          pixelOffset={[0, -50]}
          headerDisabled
        >
            <div className="w-64 rounded-lg overflow-hidden bg-background/80 text-foreground shadow-2xl backdrop-blur-md border border-border/20">
              <div className="relative w-full h-32">
                  <Image
                      src={selectedGrievance.imageUrl}
                      alt={selectedGrievance.description}
                      fill
                      className="object-cover"
                      data-ai-hint="issue photo"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-1 right-1 h-7 w-7 rounded-full bg-background/50 hover:bg-background/80"
                    onClick={handleCloseInfoWindow}
                  >
                    <X className="h-4 w-4" />
                  </Button>
              </div>
              <div className="p-3">
                  <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-semibold text-sm leading-tight pr-2">{selectedGrievance.description}</h3>
                      <Badge variant={getStatusVariant(selectedGrievance.status)} className="shrink-0">{selectedGrievance.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
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
