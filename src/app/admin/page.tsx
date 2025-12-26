
"use client";

import { useMemo, useState } from "react";
import type { Grievance } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminMap from "@/components/admin/admin-map";
import { DEMO_GRIEVANCES } from "@/lib/demo-data";

function AdminDashboardContent() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string | null>(null);

  const grievances = DEMO_GRIEVANCES; // Use demo data
  
  const grievancesLoading = false;
  const usersLoading = false;

  const allUsers: UserProfile[] = useMemo(() => {
    if (!grievances) return [];

    const userMap = new Map<string, { id: string, name: string, count: number }>();

    grievances.forEach(g => {
        if (!userMap.has(g.userId)) {
            userMap.set(g.userId, { id: g.userId, name: g.userName, count: 0 });
        }
        const userData = userMap.get(g.userId);
        if(userData){
            userData.count++;
        }
    });

    const sortedUsers = Array.from(userMap.values()).sort((a, b) => b.count - a.count);
    
    return sortedUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: `${u.name.toLowerCase().replace(' ', '.')}@demo.com`,
        imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=${u.name}`,
        grievanceCount: u.count,
    }));

  }, [grievances]);


  const filteredGrievances = useMemo(() => {
    if (!grievances) return [];
    if (!filter) return grievances;
    return grievances.filter(g => g.description.toLowerCase().includes(filter.toLowerCase()));
  }, [grievances, filter]);

  const handleUpdateGrievanceStatus = (id: string, status: Grievance['status']) => {
    // This is a demo, so we can't update the status.
    // In a real app, you would call a Firestore update function here.
    toast({
      title: "Action Disabled in Demo",
      description: "Grievance status cannot be updated using demo data.",
    });
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
    
    return <AdminDashboardContent />;
}
