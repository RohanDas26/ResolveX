
"use client";

import { useMemo, useState, useEffect } from "react";
import type { Grievance, UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminMap from "@/components/admin/admin-map";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, doc, updateDoc } from "firebase/firestore";
import { useSearchParams } from 'next/navigation'

function AdminDashboardContent() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const searchParams = useSearchParams()

  const [filter, setFilter] = useState<string | null>(null);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);

  // Set selected grievance from URL query param on initial load
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

  const { data: grievances, isLoading: grievancesLoading } = useCollection<Grievance>(grievancesQuery);
  
  const filteredGrievances = useMemo(() => {
    if (!grievances) return [];
    if (!filter) return grievances;
    return grievances.filter(g => g.description.toLowerCase().includes(filter.toLowerCase()));
  }, [grievances, filter]);

  const selectedGrievance = useMemo(() => {
    return grievances?.find(g => g.id === selectedGrievanceId) || null;
  }, [grievances, selectedGrievanceId]);

  const handleUpdateGrievanceStatus = async (id: string, status: Grievance['status']) => {
    if (!firestore) return;
    const grievanceRef = doc(firestore, 'grievances', id);
    try {
      await updateDoc(grievanceRef, { status });
      toast({
        title: "Status Updated",
        description: `Grievance status changed to ${status}.`,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update grievance status.",
      });
    }
  };
  
  const handleSelectGrievance = (id: string | null) => {
    setSelectedGrievanceId(id);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <AdminSidebar 
        grievances={filteredGrievances}
        isLoading={grievancesLoading}
        activeFilter={filter}
        onFilterChange={setFilter}
        onUpdateGrievanceStatus={handleUpdateGrievanceStatus}
        selectedGrievance={selectedGrievance}
        onSelectGrievance={handleSelectGrievance}
      />
      <AdminMap 
        grievances={filteredGrievances}
        isLoading={grievancesLoading}
        onMarkerClick={handleSelectGrievance}
        selectedGrievanceId={selectedGrievanceId}
      />
    </div>
  );
}

export default function AdminPage() {
    return <AdminDashboardContent />;
}
