
"use client";

import { useMemo, useState, useEffect } from "react";
import type { Grievance, UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminMap from "@/components/admin/admin-map";
import { useSearchParams } from 'next/navigation'
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { DEMO_GRIEVANCES, DEMO_USERS } from "@/lib/demo-data";


function AdminDashboardContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  const [filter, setFilter] = useState<string | null>(null);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);
  
  const grievancesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'grievances');
  }, [firestore]);

  const { data: liveGrievances, isLoading: isGrievancesLoading } = useCollection<Grievance>(grievancesQuery);
  const [topReporters, setTopReporters] = useState<UserProfile[]>([]);
  const [isReportersLoading, setIsReportersLoading] = useState(true);

  const grievances = useMemo(() => {
    // For a consistent and rich demo experience, we always show the demo data on the admin map.
    // Live data is still used for updates.
    // @ts-ignore
    return DEMO_GRIEVANCES;
  }, []);


  useEffect(() => {
    const calculateTopReporters = async () => {
        if (!firestore) return;
        setIsReportersLoading(true);

        try {
            const usersSnapshot = await getDocs(collection(firestore, "users"));
            const users = usersSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
                .filter(user => user.grievanceCount > 0);
            
            if (users.length > 0) {
                const sortedUsers = users.sort((a, b) => b.grievanceCount - a.grievanceCount).slice(0, 5);
                setTopReporters(sortedUsers);
            } else {
                // Fallback to demo users if no live users have reports
                setTopReporters(DEMO_USERS.slice(0, 5));
            }
        } catch (error) {
            console.error("Error fetching top reporters:", error);
            setTopReporters(DEMO_USERS.slice(0, 5)); // Fallback on error
        } finally {
            setIsReportersLoading(false);
        }
    };

    calculateTopReporters();
  }, [firestore]); 


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
    // Do not update demo data
    if (id.startsWith('demo-')) {
        toast({ title: "Demo Mode", description: "Status updates are disabled for demo grievances."});
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

  const isLoading = isGrievancesLoading && (!liveGrievances || liveGrievances.length === 0);

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
          isLoading={false} // Demo data is always available
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
