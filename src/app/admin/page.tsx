
"use client";

import { useMemo, useState } from "react";
import type { Grievance } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, doc, updateDoc } from "firebase/firestore";

import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminMap from "@/components/admin/admin-map";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/lib/types";
import { Loader2 } from "lucide-react";

function AdminDashboardContent() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string | null>(null);

  const grievancesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "grievances"));
  }, [firestore]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"));
  }, [firestore]);

  const { data: allGrievances, isLoading: grievancesLoading } = useCollection<Grievance>(grievancesQuery);
  const { data: allUsers, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const filteredGrievances = useMemo(() => {
    if (!allGrievances) return [];
    if (!filter) return allGrievances;
    return allGrievances.filter(g => g.description.toLowerCase().includes(filter.toLowerCase()));
  }, [allGrievances, filter]);

  const handleUpdateGrievanceStatus = async (id: string, status: Grievance['status']) => {
    if (!firestore) return;
    const grievanceRef = doc(firestore, "grievances", id);
    try {
      await updateDoc(grievanceRef, { status });
      toast({
        title: "Grievance Updated",
        description: `The grievance status has been set to "${status}".`,
      });
    } catch (error) {
      console.error("Error updating grievance status: ", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the grievance status.",
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <AdminSidebar 
        grievances={filteredGrievances}
        users={allUsers}
        isLoading={grievancesLoading || usersLoading}
        activeFilter={filter}
        onFilterChange={setFilter}
        onUpdateGrievanceStatus={handleUpdateGrievanceStatus}
      />
      <AdminMap 
        grievances={filteredGrievances}
        isLoading={grievancesLoading}
      />
    </div>
  );
}

export default function AdminPage() {
    // This page is now public, but in a real app would have auth checks.
    return <AdminDashboardContent />;
}
