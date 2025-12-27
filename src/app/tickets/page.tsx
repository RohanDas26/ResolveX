
"use client";

import { useMemo, useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type Grievance } from '@/lib/types';
import { collection, query, where } from 'firebase/firestore';

export default function TicketsPage() {
    const { user: authUser, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userGrievancesQuery = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        // Query the top-level 'grievances' collection
        return query(collection(firestore, "grievances"), where("userId", "==", authUser.uid));
    }, [firestore, authUser]);

    const { data: userGrievances, isLoading: isGrievancesLoading } = useCollection<Grievance>(userGrievancesQuery);

    if (isUserLoading || isGrievancesLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-8 animate-fade-in">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!authUser) {
        return (
            <div className="container mx-auto px-4 py-8 animate-fade-in">
                <p>Could not load user data. Please make sure you are logged in.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Reported Tickets</h1>
                <p className="mt-1 text-muted-foreground">
                    A list of all the grievances you have submitted.
                </p>
            </header>
            
            <div className="space-y-6">
                {userGrievances && userGrievances.length > 0 ? userGrievances.map((g, index) => (
                     <Card key={g.id} className="flex flex-col md:flex-row items-start gap-4 p-4 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`}}>
                         <div className="w-full md:w-48 md:h-32 rounded-md overflow-hidden shrink-0">
                             <img src={g.imageUrl} alt={g.description} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-grow">
                             <p className="font-semibold text-base sm:text-lg">{g.description}</p>
                             <div className="flex items-center text-xs sm:text-sm text-muted-foreground mt-2">
                                 <MapPin className="h-4 w-4 mr-1" />
                                 <span>{g.location.latitude.toFixed(4)}, {g.location.longitude.toFixed(4)}</span>
                             </div>
                              <div className="flex items-center text-xs sm:text-sm text-muted-foreground mt-1">
                                 {g.status === 'Resolved' ? <CheckCircle className="h-4 w-4 mr-1 text-green-500" /> : <Clock className="h-4 w-4 mr-1" />}
                                 <span>{g.status} • {g.createdAt ? formatDistanceToNow(new Date(g.createdAt.seconds * 1000), { addSuffix: true }) : ''}</span>
                              </div>
                         </div>
                         <Badge variant={g.status === 'Resolved' ? 'default' : g.status === 'In Progress' ? 'secondary' : 'destructive'} className="shrink-0 mt-2 md:mt-0">{g.status}</Badge>
                     </Card>
                )) : (
                    <Card className="animate-fade-in-up"><CardContent className="p-6 text-center"><p>You haven&apos;t reported any grievances yet. <br/>Click "New Grievance" to get started!</p></CardContent></Card>
                )}
            </div>
        </div>
    );
}
