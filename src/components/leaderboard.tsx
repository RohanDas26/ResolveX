
"use client";

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { Trophy } from 'lucide-react';

interface LeaderboardProps {
    users?: UserProfile[] | null;
    isLoading?: boolean;
}

export default function Leaderboard({ users: initialUsers, isLoading: initialLoading }: LeaderboardProps) {
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => {
        if (initialUsers || !firestore) return null;
        return query(collection(firestore, "users"), orderBy("grievanceCount", "desc"), limit(10));
    }, [firestore, initialUsers]);

    const { data: fetchedUsers, isLoading: fetchedLoading } = useCollection<UserProfile>(usersQuery);

    const users = useMemo(() => initialUsers || fetchedUsers, [initialUsers, fetchedUsers]);
    const isLoading = initialLoading ?? fetchedLoading;

    const sortedUsers = useMemo(() => {
        if (!users) return [];
        // Make a mutable copy and sort
        return [...users].sort((a, b) => (b.grievanceCount ?? 0) - (a.grievanceCount ?? 0));
    }, [users]);


    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-grow space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sortedUsers && sortedUsers.map((user, index) => (
                <div key={user.id} className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`}}>
                    <span className="font-bold text-lg w-6 text-center">{index + 1}</span>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.imageUrl} alt={user.name} />
                        <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.grievanceCount} reports</p>
                    </div>
                    {index === 0 && <Trophy className="h-6 w-6 text-amber-400" />}
                </div>
            ))}
        </div>
    );
}
