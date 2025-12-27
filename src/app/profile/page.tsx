
"use client";

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, GripVertical } from 'lucide-react';
import { type Grievance, type UserProfile } from '@/lib/types';
import { DEMO_GRIEVANCES, DEMO_USERS } from '@/lib/demo-data';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

const getStatusVariant = (status: Grievance['status']): "default" | "secondary" | "destructive" => {
    switch (status) {
        case 'Resolved': return 'default';
        case 'In Progress': return 'secondary';
        case 'Submitted':
        default:
            return 'destructive';
    }
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [grievances, setGrievances] = useState<Grievance[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Simulate fetching data for a demo user
        setTimeout(() => {
            const demoUser = DEMO_USERS.find(u => u.name === "Priya");
            const userGrievances = DEMO_GRIEVANCES.filter(g => g.userId === demoUser?.id).slice(0, 5);
            
            setUser(demoUser || null);
            setGrievances(userGrievances);
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
    
    if (!user) {
         return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-8">
                <p>Could not load user profile.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8 animate-fade-in">
            <header className="flex flex-col sm:flex-row items-center gap-6 mb-10">
                <Avatar className="h-24 w-24 border-4 border-primary">
                    <AvatarImage src={user.imageUrl} alt={user.name} />
                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{user.name}</h1>
                    <p className="mt-1 text-muted-foreground">{user.email}</p>
                    <p className="mt-2 text-sm text-foreground">
                        Civic Reporter Level: <span className="font-semibold text-primary">Gold</span>
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>My Stats</CardTitle>
                        <CardDescription>Your contribution summary.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total Reports</span>
                            <span className="font-bold text-2xl text-primary">{user.grievanceCount}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Resolved</span>
                            <span className="font-bold text-lg text-green-500">
                                {grievances?.filter(g => g.status === "Resolved").length}
                            </span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">In Progress</span>
                            <span className="font-bold text-lg text-amber-500">
                                {grievances?.filter(g => g.status === "In Progress").length}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold tracking-tight">My Recent Grievances</h2>
                    {grievances && grievances.length > 0 ? (
                        grievances.map((g, index) => (
                            <Card 
                                key={g.id} 
                                className="flex flex-col sm:flex-row items-start gap-4 p-4 animate-fade-in-up" 
                                style={{ animationDelay: `${index * 100}ms`}}
                            >
                                <div className="w-full sm:w-40 sm:h-28 rounded-md overflow-hidden shrink-0 relative">
                                    <Image src={g.imageUrl} alt={g.description} layout="fill" className="object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold text-base pr-4">{g.description}</p>
                                        <Badge variant={getStatusVariant(g.status)}>{g.status}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Reported {formatDistanceToNow(g.createdAt, { addSuffix: true })}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Location: {g.location.latitude.toFixed(3)}, {g.location.longitude.toFixed(3)}
                                    </p>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="p-6 text-center">
                                <p>You haven't reported any grievances yet.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
