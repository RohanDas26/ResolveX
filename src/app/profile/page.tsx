"use client";

import { useEffect, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Grievance, UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, MapPin, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Leaderboard from '@/components/leaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useDoc } from '@/firebase/firestore/use-doc';

const getBadge = (grievanceCount: number) => {
    if (grievanceCount >= 10) {
        return { name: 'KLH Hero', icon: Trophy, color: 'text-amber-400' };
    }
    if (grievanceCount >= 5) {
        return { name: 'Pothole Hunter', icon: Medal, color: 'text-slate-400' };
    }
    if (grievanceCount > 0) {
        return { name: 'Civic Starter', icon: Award, color: 'text-amber-800' };
    }
    return null;
};

export default function ProfilePage() {
    const firestore = useFirestore();
    const { user: authUser, isUserLoading: authLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !authUser) {
            router.push('/login');
        }
    }, [authUser, authLoading, router]);

    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return doc(firestore, 'users', authUser.uid);
    }, [firestore, authUser]);

    const grievancesQuery = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return query(collection(firestore, 'grievances'), where('userId', '==', authUser.uid));
    }, [firestore, authUser]);

    const { data: user, isLoading: userLoading } = useDoc<UserProfile>(userDocRef);
    const { data: userGrievances, isLoading: grievancesLoading } = useCollection<Grievance>(grievancesQuery);

    const grievanceCount = useMemo(() => user?.grievanceCount ?? 0, [user]);
    const badge = useMemo(() => getBadge(grievanceCount), [grievanceCount]);

    const isLoading = authLoading || userLoading || grievancesLoading;

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-8">
                        <Card>
                            <CardHeader className="flex flex-col items-center text-center">
                                <Skeleton className="w-24 h-24 rounded-full mb-4" />
                                <Skeleton className="h-8 w-40 mb-2" />
                                <Skeleton className="h-5 w-32" />
                            </CardHeader>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Top Reporters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-40 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-2xl font-bold mb-4">Your Reported Grievances</h2>
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </div>
                </div>
            </div>
        );
    }
    
    if (!user) return null; // Or a 'user not found' message

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-8">
                    {/* User Profile Card */}
                    <Card className="animate-fade-in-up">
                        <CardHeader className="flex flex-col items-center text-center">
                            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
                                <AvatarImage src={user.imageUrl} alt={user.name} />
                                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{user.name}</CardTitle>
                            <CardDescription>Grievances Reported: {grievanceCount}</CardDescription>
                            {badge && (
                                <div className="flex items-center gap-2 mt-4 animate-fade-in-up">
                                    <badge.icon className={`h-8 w-8 ${badge.color}`} />
                                    <span className="font-bold text-xl">{badge.name}</span>
                                </div>
                            )}
                        </CardHeader>
                    </Card>

                    {/* Leaderboard Card */}
                    <Card className="animate-fade-in-up animation-delay-200">
                        <CardHeader>
                            <CardTitle>Top Reporters</CardTitle>
                            <CardDescription>The most active students making a difference.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Leaderboard />
                        </CardContent>
                    </Card>
                </div>

                {/* User's Grievances */}
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Your Reported Grievances</h2>
                    <div className="space-y-4">
                        {userGrievances && userGrievances.map((g, index) => (
                             <Card key={g.id} className="flex items-start gap-4 p-4 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`}}>
                                 <div className="w-24 h-24 rounded-md overflow-hidden shrink-0">
                                     <img src={g.imageUrl} alt={g.description} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-grow">
                                     <p className="font-semibold">{g.description}</p>
                                     <div className="flex items-center text-sm text-muted-foreground mt-1">
                                         <MapPin className="h-4 w-4 mr-1" />
                                         <span>{g.location.latitude.toFixed(4)}, {g.location.longitude.toFixed(4)}</span>
                                     </div>
                                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                                         {g.status === 'Resolved' ? <CheckCircle className="h-4 w-4 mr-1 text-green-500" /> : <Clock className="h-4 w-4 mr-1" />}
                                         <span>{g.status} • {g.createdAt ? formatDistanceToNow(new Date(g.createdAt.seconds * 1000), { addSuffix: true }) : ''}</span>
                                     </div>
                                 </div>
                                 <Badge variant={g.status === 'Resolved' ? 'default' : g.status === 'In Progress' ? 'secondary' : 'destructive'} className="shrink-0">{g.status}</Badge>
                             </Card>
                        ))}
                        {grievanceCount === 0 && <Card><CardContent className="p-6"><p>You haven&apos;t reported any grievances yet.</p></CardContent></Card>}
                    </div>
                </div>
            </div>
        </div>
    );
}
