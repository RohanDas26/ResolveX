
"use client";

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Grievance, UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, MapPin, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Leaderboard from '@/components/leaderboard';
import { Skeleton } from '@/components/ui/skeleton';

// In a real app, you'd get this from your auth provider like useUser().
// We use a mock user for demonstration purposes.
const MOCK_USER_ID = 'user_student_1';

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

    const userQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // Query for the specific mock user
        return query(collection(firestore, 'users'), where('id', '==', MOCK_USER_ID));
    }, [firestore]);

    const grievancesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // Query for grievances submitted by the mock user
        return query(collection(firestore, 'grievances'), where('userId', '==', MOCK_USER_ID));
    }, [firestore]);

    const { data: userData, isLoading: userLoading } = useCollection<UserProfile>(userQuery);
    const { data: userGrievances, isLoading: grievancesLoading } = useCollection<Grievance>(grievancesQuery);

    const user = useMemo(() => userData?.[0], [userData]);
    const grievanceCount = useMemo(() => user?.grievanceCount ?? userGrievances?.length ?? 0, [user, userGrievances]);
    const badge = useMemo(() => getBadge(grievanceCount), [grievanceCount]);

    const isLoading = userLoading || grievancesLoading;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-8">
                    {/* User Profile Card */}
                    <Card className="animate-fade-in-up">
                        <CardHeader className="flex flex-col items-center text-center">
                            {isLoading ? (
                                <>
                                    <Skeleton className="w-24 h-24 rounded-full mb-4" />
                                    <Skeleton className="h-8 w-40 mb-2" />
                                    <Skeleton className="h-5 w-32" />
                                </>
                            ) : (
                                <>
                                    <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
                                        <AvatarImage src={user?.imageUrl} alt={user?.name} />
                                        <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <CardTitle className="text-2xl">{user?.name}</CardTitle>
                                    <CardDescription>Grievances Reported: {grievanceCount}</CardDescription>
                                    {badge && (
                                        <div className="flex items-center gap-2 mt-4 animate-fade-in-up">
                                            <badge.icon className={`h-8 w-8 ${badge.color}`} />
                                            <span className="font-bold text-xl">{badge.name}</span>
                                        </div>
                                    )}
                                </>
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
                        {isLoading && (
                            <>
                                <Skeleton className="h-28 w-full" />
                                <Skeleton className="h-28 w-full" />
                                <Skeleton className="h-28 w-full" />
                            </>
                        )}
                        {!isLoading && userGrievances?.map((g, index) => (
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
                        {!isLoading && grievanceCount === 0 && <p>You haven&apos;t reported any grievances yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
