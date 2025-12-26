
"use client";

import { useState } from "react";
import { Loader2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { writeBatch, collection, doc } from "firebase/firestore";
import { dummyGrievances } from "@/lib/dummy-data";
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";


export default function DatabaseSeeder() {
    const [isSeeding, setIsSeeding] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    const seedDatabase = async () => {
        if (!firestore) return;
        setIsSeeding(true);
        try {
          const batch = writeBatch(firestore);
          const grievancesCol = collection(firestore, "grievances");
          
          dummyGrievances.forEach(grievanceData => {
            const grievanceId = uuidv4();
            const docRef = doc(grievancesCol, grievanceId);
            const completeGrievance = {
              ...grievanceData,
              id: grievanceId,
              userId: 'dummy_user',
              userName: 'Dummy User'
            };
            batch.set(docRef, completeGrievance);
          });
    
          await batch.commit();
          toast({
            title: "Database Seeded!",
            description: "Dummy grievance data has been added."
          })
        } catch (error) {
          console.error("Error seeding database: ", error);
          toast({
            variant: "destructive",
            title: "Seeding Failed",
            description: "Could not add dummy data to the database."
          })
        } finally {
          setIsSeeding(false);
        }
      };

    return (
        <Card className="bg-background/50">
            <CardHeader>
                <CardTitle className="flex items-center text-lg">
                    <Database className="mr-2 h-5 w-5" />
                    Database Tools
                </CardTitle>
                <CardDescription>
                    Use with caution. This will add sample data.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={seedDatabase} disabled={isSeeding} className="w-full">
                    {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Database className="mr-2 h-4 w-4"/>}
                    {isSeeding ? 'Seeding...' : 'Seed Dummy Data'}
                </Button>
            </CardContent>
        </Card>
    );
}
