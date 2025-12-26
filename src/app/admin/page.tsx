
"use client";

import { useMemo, useState } from "react";
import type { Grievance } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";

import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminMap from "@/components/admin/admin-map";

function AdminDashboardContent() {
  const firestore = useFirestore();
  const [filter, setFilter] = useState<string | null>(null);

  const grievancesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "grievances"));
  }, [firestore]);

  const { data: allGrievances, isLoading: grievancesLoading } = useCollection<Grievance>(grievancesQuery);

  const filteredGrievances = useMemo(() => {
    if (!allGrievances) return [];
    if (!filter) return allGrievances;
    return allGrievances.filter(g => g.description.toLowerCase().includes(filter));
  }, [allGrievances, filter]);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <AdminSidebar 
        grievances={filteredGrievances}
        isLoading={grievancesLoading}
        activeFilter={filter}
        onFilterChange={setFilter}
      />
      <AdminMap 
        grievances={filteredGrievances}
        isLoading={grievancesLoading}
      />
    </div>
  );
}

export default function AdminPage() {
  return (
      <AdminDashboardContent />
  );
}
