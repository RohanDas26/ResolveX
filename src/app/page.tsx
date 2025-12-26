
"use client";

import GrievanceMap from "@/components/grievance-map";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Grievance } from "@/lib/types";
import { useMemo } from "react";

export default function Home() {
  const firestore = useFirestore();
  const grievancesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "grievances"));
  }, [firestore]);

  const { data: grievances } = useCollection<Grievance>(grievancesQuery);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <GrievanceMap grievances={grievances} />
    </div>
  );
}
