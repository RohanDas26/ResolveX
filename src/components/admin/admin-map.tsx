
"use client";

import GrievanceMap from "@/components/grievance-map";
import { Loader2 } from "lucide-react";
import { useMemo, useContext } from "react";
import type { Grievance } from "@/lib/types";
import { GoogleMapsContext } from "@vis.gl/react-google-maps";

interface AdminMapProps {
    grievances: Grievance[] | null;
    isLoading: boolean;
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
        weight: 1 // You could adjust weight based on a riskScore in the future
      }));
  
      const heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map,
      });

      heatmap.set('radius', 20);
      heatmap.set('opacity', 0.6);
  
      // Clean up the heatmap when the component unmounts or data changes
      return () => {
        heatmap.setMap(null);
      };
    }, [map, grievances]);
  
    return null; // This component does not render anything itself
}

export default function AdminMap({ grievances, isLoading }: AdminMapProps) {

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
        <div className="flex-1 relative animate-fade-in">
            {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-muted/50">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : (
                <GrievanceMap grievances={grievancesWithPins}>
                    <HeatmapLayer grievances={grievances} />
                </GrievanceMap>
            )}
        </div>
    );
}
