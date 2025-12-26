"use client";

import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import GrievanceMap from "@/components/grievance-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Wrench, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { summarizePriorities } from "@/ai/flows/summarize-priorities-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { type Grievance } from "@/lib/types";
import { collection, query, where, Query } from "firebase/firestore";

const ADMIN_EMAIL = "admin@klh.edu.in";

const AdminAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isUserLoading: loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login");
      } else if (user.email !== ADMIN_EMAIL) {
        router.replace("/");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};


function AdminDashboardContent() {
  const firestore = useFirestore();
  const [filter, setFilter] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  const grievancesQuery = useMemoFirebase(() => {
    let q: Query = query(collection(firestore, "grievances"));
    if (filter === "potholes") {
        q = query(q, where("description", ">=", "pothole"), where("description", "<=", "pothole\uf8ff"));
    }
    if (filter === "streetlights") {
        q = query(q, where("description", ">=", "streetlight"), where("description", "<=", "streetlight\uf8ff"));
    }
    return q;
}, [firestore, filter]);


  const { data: grievances, isLoading: grievancesLoading } = useCollection<Grievance>(grievancesQuery);
  
  useEffect(() => {
    if (grievances && grievances.length > 0) {
      const grievanceDescriptions = grievances.map(g => g.description);
      summarizePriorities({grievances: grievanceDescriptions})
        .then(result => setSummary(result.summary))
        .catch(err => {
            console.error("Error generating summary: ", err);
            setSummary("Could not generate AI summary.");
        })
        .finally(() => setIsSummaryLoading(false));
    } else if (!grievancesLoading) {
        setIsSummaryLoading(false);
        setSummary("No grievances to summarize.");
    }
  }, [grievances, grievancesLoading]);

  const getPinColor = (status: Grievance['status']) => {
    switch(status) {
        case 'Resolved': return '#22c55e'; // green-500
        case 'In Progress': return '#f59e0b'; // amber-500
        case 'Submitted': 
        default:
            return '#ef4444'; // red-500
    }
  };

  const filteredGrievances = grievances?.map(g => ({
    ...g,
    pinColor: getPinColor(g.status)
  }));

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="w-1/4 min-w-[350px] p-4 border-r overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>AI Priority Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Gemini Analysis</AlertTitle>
                  <AlertDescription>
                    {summary}
                  </AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
              <Button variant={filter === null ? 'default' : 'outline'} onClick={() => setFilter(null)}>All Grievances</Button>
              <Button variant={filter === 'potholes' ? 'default' : 'outline'} onClick={() => setFilter('potholes')}>
                  <Wrench className="mr-2 h-4 w-4"/> Potholes
              </Button>
              <Button variant={filter === 'streetlights' ? 'default' : 'outline'} onClick={() => setFilter('streetlights')}>
                  <Lightbulb className="mr-2 h-4 w-4"/> Streetlights
              </Button>
          </CardContent>
        </Card>
      </div>
      <div className="flex-1 relative">
         {grievancesLoading ? (
             <div className="w-full h-full flex items-center justify-center bg-muted">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
             </div>
         ) : (
            <GrievanceMap grievances={filteredGrievances} />
         )}
      </div>
    </div>
  );
}


export default function AdminPage() {
  return (
    <AdminAuthGuard>
      <AdminDashboardContent />
    </AdminAuthGuard>
  );
}