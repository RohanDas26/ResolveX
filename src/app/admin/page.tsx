
"use client";

import { useMemo, useState, useEffect } from "react";
import type { Grievance, UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminMap from "@/components/admin/admin-map";
import { useSearchParams } from 'next/navigation'
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";

function AdminDashboardContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  const [filter, setFilter] = useState<string | null>(null);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);
  
  // Use live data from Firestore
  const grievancesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'grievances');
  }, [firestore]);

  const { data: grievances, isLoading: isGrievancesLoading } = useCollection<Grievance>(grievancesQuery);
  const [topReporters, setTopReporters] = useState<UserProfile[]>([]);
  const [isReportersLoading, setIsReportersLoading] = useState(true);

  // Calculate top reporters from live data
  useEffect(() => {
    const calculateTopReporters = async () => {
        if (!firestore) return;
        setIsReportersLoading(true);

        // This is a client-side aggregation. For larger datasets, this should be
        // done with a backend function (e.g., Cloud Function).
        try {
            const usersSnapshot = await getDocs(collection(firestore, "users"));
            const users = usersSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
                .filter(user => user.grievanceCount > 0)
                .sort((a, b) => b.grievanceCount - a.grievanceCount)
                .slice(0, 5);
            setTopReporters(users);
        } catch (error) {
            console.error("Error fetching top reporters:", error);
            setTopReporters([]); // Set to empty on error
        } finally {
            setIsReportersLoading(false);
        }
    };

    calculateTopReporters();
  }, [firestore]); // Re-calculate when firestore is available


  // Set selected grievance from URL query param on initial load
  useEffect(() => {
    const grievanceId = searchParams.get('id');
    if (grievanceId) {
      setSelectedGrievanceId(grievanceId);
    }
  }, [searchParams]);

  const filteredGrievances = useMemo(() => {
    if (!grievances) return [];
    if (!filter) return grievances;
    return grievances.filter(g => g.description.toLowerCase().includes(filter.toLowerCase()));
  }, [grievances, filter]);

  const selectedGrievance = useMemo(() => {
    return grievances?.find(g => g.id === selectedGrievanceId) || null;
  }, [grievances, selectedGrievanceId]);

  const handleUpdateGrievanceStatus = async (id: string, status: Grievance['status']) => {
    if (!firestore) {
      toast({ variant: "destructive", title: "Firestore not available" });
      return;
    }
    const grievanceRef = doc(firestore, "grievances", id);
    try {
      updateDoc(grievanceRef, { status }); // Non-blocking update
      toast({
        title: "Status Updated",
        description: `Grievance status changed to ${status}.`,
      });
    } catch (error: any) {
      console.error("Error updating status: ", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    }
  };
  
  const handleSelectGrievance = (id: string | null) => {
    setSelectedGrievanceId(id);
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] animate-fade-in">
      <AdminSidebar 
        grievances={filteredGrievances}
        isLoading={isGrievancesLoading}
        topReporters={topReporters}
        isReportersLoading={isReportersLoading}
        activeFilter={filter}
        onFilterChange={setFilter}
        onUpdateGrievanceStatus={handleUpdateGrievanceStatus}
        selectedGrievance={selectedGrievance}
        onSelectGrievance={handleSelectGrievance}
      />
      <div className="flex-1 h-full w-full md:h-auto">
        <AdminMap 
          grievances={filteredGrievances}
          isLoading={isGrievancesLoading}
          onMarkerClick={handleSelectGrievance}
          selectedGrievanceId={selectedGrievanceId}
        />
      </div>
    </div>
  );
}

export default function AdminPage() {
    return <AdminDashboardContent />;
}
