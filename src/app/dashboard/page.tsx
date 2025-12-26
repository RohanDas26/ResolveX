
"use client";

import AuthGuard from "@/components/auth-guard";
import { type Grievance } from "@/lib/types";
import { collection, query, orderBy, Timestamp } from "firebase/firestore";
import { useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function DashboardPageContent() {
    const { user } = useUser();
    const firestore = useFirestore();

    const grievancesQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collection(firestore, "users", user.uid, "grievances"),
            orderBy("createdAt", "desc")
        );
    }, [firestore, user]);

    const { data: grievances, isLoading: loading } = useCollection<Grievance>(grievancesQuery);

    const getGrievanceDate = (createdAt: Date | Timestamp) => {
        if (createdAt instanceof Timestamp) {
            return createdAt.toDate();
        }
        return createdAt;
    }

    if (loading) {
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Your Grievances</h1>
                    <Skeleton className="h-10 w-44" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-80 w-full rounded-lg" />
                    <Skeleton className="h-80 w-full rounded-lg" />
                    <Skeleton className="h-80 w-full rounded-lg" />
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Your Grievances</h1>
                <Button asChild>
                    <Link href="/submit">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Grievance
                    </Link>
                </Button>
            </div>
            {grievances && grievances.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg bg-card">
                    <Frown className="h-16 w-16 text-muted-foreground mb-4"/>
                    <h2 className="text-xl font-semibold">No grievances found.</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm">Looks like you haven't reported any issues yet. Ready to make a difference?</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {grievances && grievances.map((grievance) => (
                        <Card key={grievance.id} className="overflow-hidden flex flex-col">
                            <CardHeader className="p-0">
                                <div className="relative w-full h-48">
                                    <Image
                                        src={grievance.imageUrl}
                                        alt={grievance.description}
                                        fill
                                        className="object-cover"
                                        data-ai-hint="issue photo"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-grow">
                                <p className="text-sm text-muted-foreground mb-2">
                                    {grievance.createdAt ? formatDistanceToNow(getGrievanceDate(grievance.createdAt), { addSuffix: true }) : 'Just now'}
                                </p>
                                <CardTitle className="text-lg leading-tight line-clamp-3">{grievance.description}</CardTitle>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                                <Badge variant={grievance.status === 'Resolved' ? 'default' : 'secondary'}>{grievance.status}</Badge>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}


export default function DashboardPage() {
  return (
    <AuthGuard>
        <div className="container mx-auto px-4 py-8">
            <DashboardPageContent />
        </div>
    </AuthGuard>
  );
}
