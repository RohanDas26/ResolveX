
"use client";

import GrievanceMap from "@/components/grievance-map";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Grievance } from "@/lib/types";
import { DEMO_GRIEVANCES } from "@/lib/demo-data";
import { useMemo } from "react";

export default function Home() {
  const firestore = useFirestore();
  const grievancesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "grievances"));
  }, [firestore]);

  const { data: liveGrievances } = useCollection<Grievance>(grievancesQuery);

  const allGrievances = useMemo(() => {
    // Combine demo data with live data, preventing duplicates
    const grievanceMap = new Map();
    DEMO_GRIEVANCES.forEach(g => grievanceMap.set(g.id, g));
    liveGrievances?.forEach(g => grievanceMap.set(g.id, g));
    return Array.from(grievanceMap.values());
  }, [liveGrievances]);
  
  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <GrievanceMap grievances={allGrievances} />
    </div>
  );
}
