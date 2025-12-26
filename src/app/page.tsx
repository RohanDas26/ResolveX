
"use client";

import GrievanceMap from "@/components/grievance-map";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Grievance } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);

  useEffect(() => {
    const grievanceId = searchParams.get('id');
    if (grievanceId) {
      setSelectedGrievanceId(grievanceId);
    }
  }, [searchParams]);

  const grievancesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "grievances"));
  }, [firestore]);

  const { data: grievances, isLoading } = useCollection<Grievance>(grievancesQuery);
  
  const handleMarkerClick = (id: string | null) => {
    setSelectedGrievanceId(id);
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
      />
    </div>
  );
}
