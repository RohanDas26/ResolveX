
"use client";

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Grievance, UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, MapPin, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Leaderboard from '@/components/leaderboard';

// A mock user ID. In a real app, you'd get this from your auth provider.
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
        return query(collection(firestore, 'users'), where('id', '==', MOCK_USER_ID));
    }, [firestore]);

    const grievancesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'grievances'), where('userId', '==', MOCK_USER_ID));
    }, [firestore]);

    const { data: userData, isLoading: userLoading } = useCollection<UserProfile>(userQuery);
    const { data: userGrievances, isLoading: grievancesLoading } = useCollection<Grievance>(grievancesQuery);

    const user = useMemo(() => userData?.[0], [userData]);
    const grievanceCount = useMemo(() => userGrievances?.length ?? 0, [userGrievances]);
    const badge = useMemo(() => getBadge(grievanceCount), [grievanceCount]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-8">
                    {/* User Profile Card */}
                    <Card className="animate-fade-in-up">
                        <CardHeader className="flex flex-col items-center text-center">
                            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
                                <AvatarImage src={user?.imageUrl} alt={user?.name} />
                                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{user?.name}</CardTitle>
                            <CardDescription>Grievances Reported: {grievanceCount}</CardDescription>
                            {badge && (
                                <div className="flex items-center gap-2 mt-2">
                                    <badge.icon className={`h-6 w-6 ${badge.color}`} />
                                    <span className="font-semibold text-lg">{badge.name}</span>
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
                        {grievancesLoading && <p>Loading your grievances...</p>}
                        {userGrievances?.map(g => (
                             <Card key={g.id} className="flex items-start gap-4 p-4 animate-fade-in-up">
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
                                         <span>{g.status} • {formatDistanceToNow(new Date(g.createdAt.seconds * 1000), { addSuffix: true })}</span>
                                     </div>
                                 </div>
                                 <Badge variant={g.status === 'Resolved' ? 'default' : g.status === 'In Progress' ? 'secondary' : 'destructive'}>{g.status}</Badge>
                             </Card>
                        ))}
                        {!grievancesLoading && grievanceCount === 0 && <p>You haven&apos;t reported any grievances yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
