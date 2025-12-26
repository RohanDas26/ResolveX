
"use client";

import { useState } from "react";
import { Loader2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { writeBatch, collection, doc } from "firebase/firestore";
import { dummyGrievances, dummyUsers } from "@/lib/dummy-data";
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

            // Seed Users
            const usersCol = collection(firestore, "users");
            const userGrievanceCounts: { [key: string]: number } = {};

            dummyUsers.forEach(user => {
                const docRef = doc(usersCol, user.id);
                batch.set(docRef, { ...user, grievanceCount: 0 });
                userGrievanceCounts[user.id] = 0;
            });
            
            // Seed Grievances and assign to users
            const grievancesCol = collection(firestore, "grievances");
            dummyGrievances.forEach((grievanceData, index) => {
                const grievanceId = uuidv4();
                const docRef = doc(grievancesCol, grievanceId);
                
                // Assign grievance to a user in a round-robin fashion
                const user = dummyUsers[index % dummyUsers.length];
                userGrievanceCounts[user.id]++;

                const completeGrievance = {
                    ...grievanceData,
                    id: grievanceId,
                    userId: user.id,
                    userName: user.name,
                };
                batch.set(docRef, completeGrievance);
            });

            // Update user grievance counts
            for (const userId in userGrievanceCounts) {
                const userRef = doc(usersCol, userId);
                batch.update(userRef, { grievanceCount: userGrievanceCounts[userId] });
            }
    
            await batch.commit();
            toast({
                title: "Database Seeded!",
                description: "Dummy user and grievance data has been added."
            });
        } catch (error) {
            console.error("Error seeding database: ", error);
            toast({
                variant: "destructive",
                title: "Seeding Failed",
                description: "Could not add dummy data to the database."
            });
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
                    Use with caution. This will add sample data for users and grievances.
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
