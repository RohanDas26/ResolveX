
"use client";

import GrievanceMap from "@/components/grievance-map";
import { Loader2 } from "lucide-react";
import { useMemo, useContext } from "react";
import type { Grievance } from "@/lib/types";
import { GoogleMapsContext } from "@vis.gl/react-google-maps";

interface AdminMapProps {
    grievances: Grievance[] | null;
    isLoading: boolean;
    onMarkerClick: (grievanceId: string) => void;
    selectedGrievanceId: string | null;
}

function HeatmapLayer({ grievances }: { grievances: Grievance[] | null }) {
    const context = useContext(GoogleMapsContext);
    const map = context?.map;
  
    useMemo(() => {
      if (!map || !window.google || !grievances) return;
  
      // Check if visualization library is loaded
      if (!google.maps.visualization) {
        console.error("Google Maps visualization library not loaded.");
        return;
      }
  
      const heatmapData = grievances.map(g => ({
        location: new google.maps.LatLng(g.location.latitude, g.location.longitude),
        weight: g.riskScore || 1 // Use riskScore for heatmap weight
      }));
  
      const heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map,
      });

      // Gradient for the heatmap
      const gradient = [
        "rgba(0, 255, 255, 0)",
        "rgba(0, 255, 255, 1)",
        "rgba(0, 191, 255, 1)",
        "rgba(0, 127, 255, 1)",
        "rgba(0, 63, 255, 1)",
        "rgba(0, 0, 255, 1)",
        "rgba(0, 0, 223, 1)",
        "rgba(0, 0, 191, 1)",
        "rgba(0, 0, 159, 1)",
        "rgba(0, 0, 127, 1)",
        "rgba(63, 0, 91, 1)",
        "rgba(127, 0, 63, 1)",
        "rgba(191, 0, 31, 1)",
        "rgba(255, 0, 0, 1)",
      ];
      heatmap.set("gradient", gradient);
      heatmap.set('radius', 30);
      heatmap.set('opacity', 0.6);
  
      // Clean up the heatmap when the component unmounts or data changes
      return () => {
        heatmap.setMap(null);
      };
    }, [map, grievances]);
  
    return null; // This component does not render anything itself
}

export default function AdminMap({ grievances, isLoading, onMarkerClick, selectedGrievanceId }: AdminMapProps) {

    const getPinColor = (status: Grievance['status']) => {
        switch(status) {
            case 'Resolved': return '#22c55e'; // green-500
            case 'In Progress': return '#f59e0b'; // amber-500
            case 'Submitted': 
            default:
                return '#ef4444'; // red-500
        }
    };
    
    const grievancesWithPins = useMemo(() => {
        return grievances?.map(g => ({
            ...g,
            pinColor: getPinColor(g.status)
        })) || [];
    }, [grievances]);

    return (
        <div className="w-full h-full relative animate-fade-in">
            {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : (
                <GrievanceMap 
                    grievances={grievancesWithPins}
                    onMarkerClick={onMarkerClick}
                    selectedGrievanceId={selectedGrievanceId}
                >
                    <HeatmapLayer grievances={grievances} />
                </GrievanceMap>
            )}
        </div>
    );
}
