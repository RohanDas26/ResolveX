
"use client";

import { useMemo, useState, useEffect } from "react";
import type { Grievance, UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminMap from "@/components/admin/admin-map";
import { useSearchParams } from 'next/navigation'
import { DEMO_GRIEVANCES, DEMO_USERS } from "@/lib/demo-data";

function AdminDashboardContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [allGrievances, setAllGrievances] = useState<Grievance[]>(DEMO_GRIEVANCES);
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);
  
  const [topReporters, setTopReporters] = useState<UserProfile[]>([]);
  
  // Set initial data on mount
  useEffect(() => {
    setAllGrievances(DEMO_GRIEVANCES);
    const sortedReporters = [...DEMO_USERS].sort((a,b) => b.grievanceCount - a.grievanceCount).slice(0,10);
    setTopReporters(sortedReporters);
  }, []);

  useEffect(() => {
    const grievanceId = searchParams.get('id');
    if (grievanceId) {
      setSelectedGrievanceId(grievanceId);
    }
  }, [searchParams]);

  const filteredGrievances = useMemo(() => {
    if (!filter) return allGrievances;
    return allGrievances.filter(g => g.description.toLowerCase().includes(filter.toLowerCase()));
  }, [allGrievances, filter]);

  const selectedGrievance = useMemo(() => {
    return allGrievances?.find(g => g.id === selectedGrievanceId) || null;
  }, [allGrievances, selectedGrievanceId]);

  const handleUpdateGrievanceStatus = async (id: string, status: Grievance['status']) => {
    setAllGrievances(prevGrievances => 
        prevGrievances.map(g => g.id === id ? { ...g, status } : g)
    );
    toast({
        title: "Status Updated (Demo)",
        description: `Grievance status changed to ${status}.`,
    });
  };
  
  const handleSelectGrievance = (id: string | null) => {
    setSelectedGrievanceId(id);
  }
  
  const isGrievancesLoading = allGrievances.length === 0;
  const isReportersLoading = topReporters.length === 0;

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

    