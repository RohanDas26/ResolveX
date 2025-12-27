
"use client";

import { useMemo, useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Grievance, UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, MapPin, CheckCircle, Clock, Loader2, MailWarning, Settings, BarChart3, Edit, KeyRound } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Leaderboard from '@/components/leaderboard';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { sendEmailVerification, sendPasswordResetEmail, updateProfile as updateAuthProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, doc, getDocs, orderBy, limit, updateDoc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


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

const StatsCard = ({ grievances }: { grievances: Grievance[] | null }) => {
    const stats = useMemo(() => {
        const initial = { resolved: 0, inProgress: 0, submitted: 0 };
        if (!grievances) return initial;
        return grievances.reduce((acc, g) => {
            if (g.status === 'Resolved') acc.resolved++;
            else if (g.status === 'In Progress') acc.inProgress++;
            else if (g.status === 'Submitted') acc.submitted++;
            return acc;
        }, initial);
    }, [grievances]);

    return (
        <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 /> Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-500" />
                        <span className="font-medium">Resolved</span>
                    </div>
                    <span className="font-bold text-lg">{stats.resolved}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
                    <div className="flex items-center gap-2">
                        <Clock className="text-amber-500" />
                        <span className="font-medium">In Progress</span>
                    </div>
                    <span className="font-bold text-lg">{stats.inProgress}</span>
                </div>
                 <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-md">
                    <div className="flex items-center gap-2">
                        <MapPin className="text-red-500" />
                        <span className="font-medium">Submitted</span>
                    </div>
                    <span className="font-bold text-lg">{stats.submitted}</span>
                </div>
            </CardContent>
        </Card>
    )
}

const SettingsCard = ({ user, userDocRef }: { user: any, userDocRef: any }) => {
    const { toast } = useToast();
    const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
    const [newName, setNewName] = useState(user.displayName || "");
    const [isUpdating, setIsUpdating] = useState(false);

    const handlePasswordReset = async () => {
        if (!user.email) return;
        try {
            await sendPasswordResetEmail(user.auth, user.email);
            toast({
                title: "Password Reset Email Sent",
                description: "Check your inbox for a link to reset your password.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not send password reset email.",
            });
        }
    };

    const handleUpdateName = async () => {
        if (!newName.trim()) {
            toast({ variant: "destructive", title: "Name cannot be empty." });
            return;
        }
        setIsUpdating(true);
        try {
            // Update Firebase Auth profile
            await updateAuthProfile(user, { displayName: newName });
            // Update Firestore document
            if (userDocRef) {
                await updateDoc(userDocRef, { name: newName });
            }
            toast({ title: "Profile updated successfully!" });
            setShowEditProfileDialog(false);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not update your profile." });
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <>
            <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Settings /> Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setShowEditProfileDialog(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile Name
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handlePasswordReset}>
                        <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                    </Button>
                </CardContent>
            </Card>

            <Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Profile Name</DialogTitle>
                        <DialogDescription>Update your display name below.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <Label htmlFor="name">Display Name</Label>
                        <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="button" onClick={handleUpdateName} disabled={isUpdating}>
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};


export default function ProfilePage() {
    const { user: authUser, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userDocRef = useMemoFirebase(() => {
      if (!firestore || !authUser) return null;
      return doc(firestore, 'users', authUser.uid);
    }, [firestore, authUser]);

    const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
    
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
    
    if (!authUser) return <div className="container mx-auto px-4 py-8 animate-fade-in"><p>Could not load user profile. Please make sure you are logged in.</p></div>;
    
    const displayProfile = {
        name: profile?.name || authUser.displayName || "New User",
        grievanceCount: grievanceCount,
        imageUrl: profile?.imageUrl || authUser.photoURL || `https://api.dicebear.com/8.x/bottts/svg?seed=${authUser.uid}`
    };


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
                                <AvatarImage src={displayProfile.imageUrl} alt={displayProfile.name} />
                                <AvatarFallback>{displayProfile.name?.[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{displayProfile.name}</CardTitle>
                            <CardDescription>Grievances Reported: {displayProfile.grievanceCount}</CardDescription>
                            {badge && (
                                <div className="flex items-center gap-2 mt-4 animate-fade-in-up">
                                    <badge.icon className={`h-8 w-8 ${badge.color}`} />
                                    <span className="font-bold text-xl">{badge.name}</span>
                                </div>
                            )}
                        </CardHeader>
                    </Card>

                    <StatsCard grievances={userGrievances} />

                    <SettingsCard user={authUser} userDocRef={userDocRef} />

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

    

    