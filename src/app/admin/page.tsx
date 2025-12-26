
"use client";

import { useMemo, useState } from "react";
import type { Grievance } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, doc, updateDoc } from "firebase/firestore";

import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminMap from "@/components/admin/admin-map";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

function AdminDashboardContent() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string | null>(null);

  const grievancesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "grievances"));
  }, [firestore]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"));
  }, [firestore]);

  const { data: grievances, isLoading: grievancesLoading } = useCollection<Grievance>(grievancesQuery);
  const { data: allUsers, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);


  const filteredGrievances = useMemo(() => {
    if (!grievances) return [];
    if (!filter) return grievances;
    return grievances.filter(g => g.description.toLowerCase().includes(filter.toLowerCase()));
  }, [grievances, filter]);

  const handleUpdateGrievanceStatus = async (id: string, status: Grievance['status']) => {
    if (!firestore) return;
    const grievanceRef = doc(firestore, "grievances", id);
    try {
      await updateDoc(grievanceRef, { status });
      toast({
        title: "Grievance Updated",
        description: `The grievance status has been set to "${status}".`,
      });
    } catch (error) {
      console.error("Error updating grievance status: ", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the grievance status.",
      });
    }
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
