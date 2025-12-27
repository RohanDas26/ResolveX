
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

// ONE-TIME DATA SEEDING COMPONENT
function SeedDatabaseButton() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSeeding, setIsSeeding] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const handleSeed = async () => {
        if (!firestore) return;
        setIsSeeding(true);

        try {
            const grievancesRef = collection(firestore, 'grievances');
            const grievancesSnapshot = await getDocs(grievancesRef);
            if (grievancesSnapshot.size > 50) { // Don't re-seed if already populated
                toast({ title: "Database already seeded!" });
                setIsDone(true);
                return;
            }

            const batch = writeBatch(firestore);

            // Seed grievances
            DEMO_GRIEVANCES.forEach(grievance => {
                const docRef = doc(collection(firestore, "grievances"));
                const { id, pinColor, ...grievanceData } = grievance;
                batch.set(docRef, grievanceData);
            });

            // Seed users
            DEMO_USERS.forEach(user => {
                const userRef = doc(firestore, "users", user.id);
                batch.set(userRef, user);
            });

            await batch.commit();
            toast({ title: "Database Seeded Successfully!", description: "Map and leaderboards are now populated." });
            setIsDone(true);
        } catch (error: any) {
            console.error("Seeding error:", error);
            toast({ variant: "destructive", title: "Seeding Failed", description: error.message });
        } finally {
            setIsSeeding(false);
        }
    };
    
    if (isDone) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Button onClick={handleSeed} disabled={isSeeding} size="lg">
                {isSeeding ? "Seeding..." : "Populate Demo Data"}
            </Button>
        </div>
    );
}


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
      <SeedDatabaseButton />
    </div>
  );
}

export default function AdminPage() {
    return <AdminDashboardContent />;
}

    