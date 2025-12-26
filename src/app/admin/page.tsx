
"use client";

import { useMemo, useState } from "react";
import type { Grievance } from "@/lib/types";
import { useUser } from "@/firebase";
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
  const allUsers: UserProfile[] = []; // No real users with demo data
  
  const grievancesLoading = false;
  const usersLoading = false;


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
    const { claims, isUserLoading } = useUser();

    if (isUserLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    // Since auth is removed, we'll just show the page.
    // In a real app, you would check claims.isAdmin here.
    // if (!claims?.isAdmin) {
    //     return (
    //          <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-8">
    //             <Card className="max-w-md animate-fade-in-up">
    //                 <CardHeader className="text-center">
    //                     <ShieldAlert className="w-16 h-16 mx-auto text-destructive"/>
    //                     <CardTitle className="text-2xl">Access Denied</CardTitle>
    //                 </CardHeader>
    //                 <CardContent>
    //                     <p className="text-center text-muted-foreground">You do not have permission to view this page. This area is for administrators only.</p>
    //                 </CardContent>
    //             </Card>
    //         </div>
    //     )
    // }

    return <AdminDashboardContent />;
}
