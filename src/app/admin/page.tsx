
"use client";

import { useMemo, useState } from "react";
import type { Grievance } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/lib/types";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminMap from "@/components/admin/admin-map";
import { DEMO_GRIEVANCES } from "@/lib/demo-data";

function AdminDashboardContent() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);

  const grievances = DEMO_GRIEVANCES; // Use demo data
  
  const grievancesLoading = false;
  const usersLoading = false;

  // Use a static list of top users to prevent hydration errors.
  const allUsers: UserProfile[] = [
    { id: 'user-demo-20', name: 'Manoj', email: 'manoj@demo.com', imageUrl: 'https://api.dicebear.com/8.x/bottts/svg?seed=Manoj', grievanceCount: 36 },
    { id: 'user-demo-19', name: 'Kavita', email: 'kavita@demo.com', imageUrl: 'https://api.dicebear.com/8.x/bottts/svg?seed=Kavita', grievanceCount: 29 },
    { id: 'user-demo-18', name: 'Rajesh', email: 'rajesh@demo.com', imageUrl: 'https://api.dicebear.com/8.x/bottts/svg?seed=Rajesh', grievanceCount: 23 },
    { id: 'user-demo-17', name: 'Sunita', email: 'sunita@demo.com', imageUrl: 'https://api.dicebear.com/8.x/bottts/svg?seed=Sunita', grievanceCount: 18 },
    { id: 'user-demo-16', name: 'Amit', email: 'amit@demo.com', imageUrl: 'https://api.dicebear.com/8.x/bottts/svg?seed=Amit', grievanceCount: 14 }
  ];

  const filteredGrievances = useMemo(() => {
    if (!grievances) return [];
    if (!filter) return grievances;
    return grievances.filter(g => g.description.toLowerCase().includes(filter.toLowerCase()));
  }, [grievances, filter]);

  const selectedGrievance = useMemo(() => {
    return grievances.find(g => g.id === selectedGrievanceId) || null;
  }, [grievances, selectedGrievanceId]);

  const handleUpdateGrievanceStatus = (id: string, status: Grievance['status']) => {
    // This is a demo, so we can't update the status.
    // In a real app, you would call a Firestore update function here.
    toast({
      title: "Action Disabled in Demo",
      description: "Grievance status cannot be updated using demo data.",
    });
  };
  
  const handleSelectGrievance = (id: string | null) => {
    setSelectedGrievanceId(id);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <AdminSidebar 
        grievances={filteredGrievances}
        users={allUsers}
        isLoading={grievancesLoading || usersLoading}
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
