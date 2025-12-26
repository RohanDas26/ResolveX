
"use client";

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Grievance, UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, MapPin, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
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
    const { user: authUser, profile, isUserLoading, isProfileLoading } = useUser();

    const grievancesQuery = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return query(collection(firestore, 'grievances'), where('userId', '==', authUser.uid));
    }, [firestore, authUser]);

    const { data: userGrievances, isLoading: grievancesLoading } = useCollection<Grievance>(grievancesQuery);

    const grievanceCount = useMemo(() => profile?.grievanceCount ?? 0, [profile]);
    const badge = useMemo(() => getBadge(grievanceCount), [grievanceCount]);

    const isLoading = isUserLoading || isProfileLoading || grievancesLoading;

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!profile || !authUser) return <div className="container mx-auto px-4 py-8"><p>Could not load user profile. Please make sure you are logged in.</p></div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-8">
                    {/* User Profile Card */}
                    <Card className="animate-fade-in-up">
                        <CardHeader className="flex flex-col items-center text-center">
                            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
                                <AvatarImage src={profile.imageUrl} alt={profile.name} />
                                <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{profile.name}</CardTitle>
                            <CardDescription>Grievances Reported: {grievanceCount}</CardDescription>
                            {badge && (
                                <div className="flex items-center gap-2 mt-4 animate-fade-in-up">
                                    <badge.icon className={`h-8 w-8 ${badge.color}`} />
                                    <span className="font-bold text-xl">{badge.name}</span>
                                </div>
                            )}
                        </CardHeader>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Leaderboard</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground">The leaderboard is now available on the admin page.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* User's Grievances */}
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Your Reported Grievances</h2>
                    <div className="space-y-4">
                        {userGrievances && userGrievances.length > 0 ? userGrievances.map((g, index) => (
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
                        )) : (
                            <Card><CardContent className="p-6"><p>You haven&apos;t reported any grievances yet.</p></CardContent></Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
