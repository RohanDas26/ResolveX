"use client";

import GrievanceMap from "@/components/grievance-map";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import type { Grievance } from "@/lib/types";

interface AdminMapProps {
    grievances: Grievance[] | null;
    isLoading: boolean;
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
                <GrievanceMap grievances={grievancesWithPins} />
            )}
        </div>
    );
}
