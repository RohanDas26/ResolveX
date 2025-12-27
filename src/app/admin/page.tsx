
"use client";

import { useMemo, useState, useEffect } from "react";
import type { Grievance, UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminMap from "@/components/admin/admin-map";
import { useSearchParams } from 'next/navigation'
import { doc, updateDoc, collection } from "firebase/firestore";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";

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
  const { data: grievances, isLoading: isGrievancesLoading } = useCollection<Grievance>(grievancesQuery);
  
  const [topReporters, setTopReporters] = useState<UserProfile[]>([]);
  const [isReportersLoading, setIsReportersLoading] = useState(true);

  useEffect(() => {
    if (grievances) {
      setIsReportersLoading(true);
      const reporterCounts: { [userId: string]: { count: number; name: string; id: string } } = {};

      grievances.forEach(g => {
        if (!reporterCounts[g.userId]) {
          reporterCounts[g.userId] = { count: 0, name: g.userName, id: g.userId };
        }
        reporterCounts[g.userId].count++;
      });

      const sortedReporters = Object.values(reporterCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Get top 10
        .map(reporter => ({
          id: reporter.id,
          name: reporter.name,
          grievanceCount: reporter.count,
          imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=${reporter.id}`
        }));
      
      setTopReporters(sortedReporters);
      setIsReportersLoading(false);
    }
  }, [grievances]);
  
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
