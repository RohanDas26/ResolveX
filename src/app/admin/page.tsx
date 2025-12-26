
"use client";

import { useMemo, useState, useEffect } from "react";
import type { Grievance, UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminMap from "@/components/admin/admin-map";
import { useSearchParams } from 'next/navigation'
import { DEMO_GRIEVANCES, DEMO_USERS } from "@/lib/demo-data";
import { doc, updateDoc, collection, query, where } from "firebase/firestore";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";

function AdminDashboardContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams()

  const [filter, setFilter] = useState<string | null>(null);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);
  const [grievances, setGrievances] = useState<Grievance[]>(DEMO_GRIEVANCES);

  // Set selected grievance from URL query param on initial load
  useEffect(() => {
    const grievanceId = searchParams.get('id');
    if (grievanceId) {
      setSelectedGrievanceId(grievanceId);
    }
  }, [searchParams]);

  const topReporters = useMemo(() => {
      // Use the static demo users which now have correct, pre-calculated counts
      // and are pre-sorted.
      return DEMO_USERS.slice(0, 5);
  }, []);


  const filteredGrievances = useMemo(() => {
    if (!grievances) return [];
    if (!filter) return grievances;
    return grievances.filter(g => g.description.toLowerCase().includes(filter.toLowerCase()));
  }, [grievances, filter]);

  const selectedGrievance = useMemo(() => {
    return grievances?.find(g => g.id === selectedGrievanceId) || null;
  }, [grievances, selectedGrievanceId]);

  const handleUpdateGrievanceStatus = (id: string, status: Grievance['status']) => {
    setGrievances(prev => prev.map(g => g.id === id ? { ...g, status } : g));
    toast({
      title: "Status Updated (Demo)",
      description: `Grievance status changed to ${status}. This is a local update.`,
    });
  };
  
  const handleSelectGrievance = (id: string | null) => {
    setSelectedGrievanceId(id);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <AdminSidebar 
        grievances={filteredGrievances}
        isLoading={false}
        topReporters={topReporters}
        activeFilter={filter}
        onFilterChange={setFilter}
        onUpdateGrievanceStatus={handleUpdateGrievanceStatus}
        selectedGrievance={selectedGrievance}
        onSelectGrievance={handleSelectGrievance}
      />
      <AdminMap 
        grievances={filteredGrievances}
        isLoading={false}
        onMarkerClick={handleSelectGrievance}
        selectedGrievanceId={selectedGrievanceId}
      />
    </div>
  );
}

export default function AdminPage() {
    return <AdminDashboardContent />;
}
