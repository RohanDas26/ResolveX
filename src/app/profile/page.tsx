
"use client";

import { useMemo, useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Grievance, UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, MapPin, CheckCircle, Clock, Loader2, MailWarning } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Leaderboard from '@/components/leaderboard';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { sendEmailVerification } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';


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
    const { user: authUser, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    // We don't have the user's profile from a collection, so we construct it.
    // In a real app, this would come from a `useDoc` hook on a 'users' collection.
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    const userGrievancesQuery = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return query(collection(firestore, 'grievances'), where('userId', '==', authUser.uid), orderBy("createdAt", "desc"));
    }, [firestore, authUser]);

    const { data: userGrievances, isLoading: isGrievancesLoading } = useCollection<Grievance>(userGrievancesQuery);
    
    const [leaderboardUsers, setLeaderboardUsers] = useState<UserProfile[]>([]);
    const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);

    useEffect(() => {
        const calculateTopReporters = async () => {
            if (!firestore) return;
            setIsLeaderboardLoading(true);

            try {
                const usersRef = collection(firestore, "users");
                const q = query(usersRef, orderBy("grievanceCount", "desc"), limit(5));
                const usersSnapshot = await getDocs(q);

                const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
                setLeaderboardUsers(users);
            } catch (error) {
                console.error("Error fetching top reporters:", error);
                setLeaderboardUsers([]);
            } finally {
                setIsLeaderboardLoading(false);
            }
        };

        calculateTopReporters();
    }, [firestore, profile]); // Re-run when user profile changes to update count

    useEffect(() => {
        if (authUser && userGrievances) {
            setProfile({
                name: authUser.displayName || "New User",
                email: authUser.email || "",
                imageUrl: authUser.photoURL || `https://api.dicebear.com/8.x/bottts/svg?seed=${authUser.uid}`,
                grievanceCount: userGrievances.length,
            });
            setIsProfileLoading(false);
        } else if (!isUserLoading) {
            setIsProfileLoading(false);
        }
    }, [authUser, userGrievances, isUserLoading]);


    const grievanceCount = useMemo(() => profile?.grievanceCount || 0, [profile]);
    const badge = useMemo(() => getBadge(grievanceCount), [grievanceCount]);

    const handleResendVerification = async () => {
        if (authUser) {
            try {
                await sendEmailVerification(authUser);
                toast({
                    title: "Verification Email Sent!",
                    description: "Please check your inbox for the verification link.",
                });
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not send verification email. Please try again later.",
                });
            }
        }
    };

    if (isUserLoading || isProfileLoading || isGrievancesLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-8 animate-fade-in">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!authUser || !profile) return <div className="container mx-auto px-4 py-8 animate-fade-in"><p>Could not load user profile. Please make sure you are logged in.</p></div>;

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
             {!authUser.emailVerified && (
                <Alert variant="destructive" className="mb-8 animate-fade-in-up border-amber-500/50 text-amber-500 [&>svg]:text-amber-500">
                    <MailWarning className="h-4 w-4" />
                    <AlertTitle className="font-bold text-amber-600">Verify Your Email Address</AlertTitle>
                    <AlertDescription>
                        Your email is not verified. Please check your inbox for a verification link to ensure full access to your account and features.
                    </AlertDescription>
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-2 text-amber-500" onClick={handleResendVerification}>
                        Resend verification link
                    </Button>
                </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-8">
                    {/* User Profile Card */}
                    <Card className="animate-fade-in-up">
                        <CardHeader className="flex flex-col items-center text-center">
                            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
                                <AvatarImage src={profile.imageUrl} alt={profile.name} />
                                <AvatarFallback>{profile.name?.[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{profile.name}</CardTitle>
                            <CardDescription>Grievances Reported: {profile.grievanceCount}</CardDescription>
                            {badge && (
                                <div className="flex items-center gap-2 mt-4 animate-fade-in-up">
                                    <badge.icon className={`h-8 w-8 ${badge.color}`} />
                                    <span className="font-bold text-xl">{badge.name}</span>
                                </div>
                            )}
                        </CardHeader>
                    </Card>

                     <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <CardHeader>
                            <CardTitle>Leaderboard</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <Leaderboard users={leaderboardUsers} isLoading={isLeaderboardLoading} />
                        </CardContent>
                    </Card>
                </div>

                {/* User's Grievances */}
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Your Reported Grievances</h2>
                    <div className="space-y-4">
                        {userGrievances && userGrievances.length > 0 ? userGrievances.map((g, index) => (
                             <Card key={g.id} className="flex items-start gap-4 p-4 animate-fade-in-up" style={{ animationDelay: `${index * 150}ms`}}>
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
                                         <span>{g.status} • {g.createdAt ? formatDistanceToNow(g.createdAt.toDate(), { addSuffix: true }) : ''}</span>
                                     </div>
                                 </div>
                                 <Badge variant={g.status === 'Resolved' ? 'default' : g.status === 'In Progress' ? 'secondary' : 'destructive'} className="shrink-0">{g.status}</Badge>
                             </Card>
                        )) : (
                            <Card className="animate-fade-in-up"><CardContent className="p-6"><p>You haven&apos;t reported any grievances yet.</p></CardContent></Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
