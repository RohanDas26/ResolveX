
"use client";

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { type Grievance } from '@/lib/types';
import { DEMO_GRIEVANCES } from '@/lib/demo-data';

export default function TicketsPage() {
    const [userGrievances, setUserGrievances] = useState<Grievance[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Simulate fetching a subset of demo grievances for "my tickets"
        setTimeout(() => {
            setUserGrievances(DEMO_GRIEVANCES.slice(0, 5));
            setIsLoading(false);
        }, 500);
    }, []);


    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-8 animate-fade-in">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Reported Tickets</h1>
                <p className="mt-1 text-muted-foreground">
                    A list of all the grievances you have submitted. (Demo)
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
                             <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                                This is a demonstration. In a real app, this would show details for your submitted grievances.
                             </p>
                         </div>
                     </Card>
                )) : (
                    <Card className="animate-fade-in-up"><CardContent className="p-6 text-center"><p>You haven&apos;t reported any grievances yet. <br/>Click "New Grievance" to get started!</p></CardContent></Card>
                )}
            </div>
        </div>
    );
}
