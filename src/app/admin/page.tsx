
"use client";

import { useMemo, useState, useEffect } from "react";
import type { Grievance, UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminMap from "@/components/admin/admin-map";
import { useSearchParams } from 'next/navigation'
import { doc, updateDoc, collection, query, writeBatch, getDocs } from "firebase/firestore";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { DEMO_GRIEVANCES } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";

function AdminDashboardContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  const [filter, setFilter] = useState<string | null>(null);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);
  
  const { data: liveGrievances, isLoading: isGrievancesLoading } = useCollection<Grievance>(
    useMemoFirebase(() => firestore ? collection(firestore, 'grievances') : null, [firestore])
  );

  const grievances = useMemo(() => {
    if (liveGrievances && liveGrievances.length > 0) {
      return liveGrievances;
    }
    return DEMO_GRIEVANCES;
  }, [liveGrievances]);
  
  const [topReporters, setTopReporters] = useState<UserProfile[]>([]);
  const [isReportersLoading, setIsReportersLoading] = useState(true);

  useEffect(() => {
    const calculateTopReporters = async () => {
        if (!firestore) return;
        setIsReportersLoading(true);
        try {
            const usersRef = collection(firestore, "users");
            const q = query(usersRef);
            const usersSnapshot = await getDocs(q);

            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
            const sortedUsers = users.filter(u => u.grievanceCount > 0).sort((a, b) => b.grievanceCount - a.grievanceCount).slice(0, 5);
            setTopReporters(sortedUsers);
        } catch (error) {
            console.error("Error fetching top reporters:", error);
            setTopReporters([]); 
        } finally {
            setIsReportersLoading(false);
        }
    };

    calculateTopReporters();
  }, [firestore, grievances]); // Re-calculate when grievances change to keep leaderboard fresh


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
      await updateDoc(grievanceRef, { status }); 
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

  const isLoading = isGrievancesLoading && (!grievances || grievances.length === 0);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] animate-fade-in">
      <AdminSidebar 
        grievances={filteredGrievances}
        isLoading={isLoading}
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
          isLoading={isLoading}
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
