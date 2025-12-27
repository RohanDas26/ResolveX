
"use client";

import { useMemo, useState, useEffect } from "react";
import type { Grievance, UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminMap from "@/components/admin/admin-map";
import { useSearchParams } from 'next/navigation'
import { doc, updateDoc, collection, query, writeBatch, getDocs } from "firebase/firestore";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { DEMO_GRIEVANCES, DEMO_USERS } from "@/lib/demo-data";
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

  // Use live data if available and not empty, otherwise fall back to demo data.
  const grievances = useMemo(() => {
    if (liveGrievances && liveGrievances.length > 0) {
      return liveGrievances;
    }
    return DEMO_GRIEVANCES;
  }, [liveGrievances]);
  
  const { data: liveUsers, isLoading: isUsersLoading } = useCollection<UserProfile>(
    useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore])
  );
  
  const topReporters = useMemo(() => {
      let users: UserProfile[];
      // Use live users if available and not empty, otherwise use demo users.
      if (liveUsers && liveUsers.length > 0) {
          users = liveUsers;
      } else {
          users = DEMO_USERS;
      }
      return users.filter(u => u.grievanceCount > 0)
                  .sort((a, b) => b.grievanceCount - a.grievanceCount)
                  .slice(0, 5);
  }, [liveUsers]);

  const isReportersLoading = isUsersLoading && !liveUsers;

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
     // Don't allow updating demo data
    if (id.startsWith('demo-')) {
      toast({
        variant: "default",
        title: "Demo Data",
        description: "Status updates are disabled for demo grievances.",
      });
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
