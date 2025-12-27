
"use client";

import type { Grievance, UserProfile } from "@/lib/types";
import FilterControls from "./filter-controls";
import { ScrollArea } from "@/components/ui/scroll-area";
import Leaderboard from "../leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import { BarChart2, BookOpen, X } from "lucide-react";
import { usePathname } from "next/navigation";
import GrievanceDetails from "./grievance-details";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Zap, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface AdminSidebarProps {
    grievances: Grievance[] | null;
    isLoading: boolean;
    topReporters: UserProfile[] | null;
    isReportersLoading: boolean;
    activeFilter: string | null;
    onFilterChange: (filter: string | null) => void;
    onUpdateGrievanceStatus: (id: string, status: Grievance['status']) => void;
    selectedGrievance: Grievance | null;
    onSelectGrievance: (id: string | null) => void;
}

const ClientTime = ({ date }: { date: Date | undefined }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted || !date) {
        return null; // Or a loader/placeholder
    }

    return <>{formatDistanceToNow(date, { addSuffix: true })}</>;
};


export default function AdminSidebar({ 
    grievances, 
    isLoading, 
    topReporters,
    isReportersLoading,
    activeFilter, 
    onFilterChange,
    onUpdateGrievanceStatus,
    selectedGrievance, 
    onSelectGrievance
}: AdminSidebarProps) {
    const pathname = usePathname();
    const [newStatus, setNewStatus] = useState<Grievance['status'] | null>(null);

    useEffect(() => {
        if (selectedGrievance) {
            setNewStatus(selectedGrievance.status);
        } else {
            setNewStatus(null);
        }
    }, [selectedGrievance]);
    
    if (selectedGrievance) {
        return (
            <div className="w-full md:max-w-sm p-4 border-r border-border/60 animate-fade-in-left flex flex-col h-full md:h-auto">
                <div className="flex justify-between items-center mb-4 shrink-0">
                    <h2 className="text-lg font-bold">Grievance Details</h2>
                    <Button variant="ghost" size="icon" onClick={() => onSelectGrievance(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                 <ScrollArea className="h-full pr-4 -mr-4">
                    <GrievanceDetails 
                        grievance={selectedGrievance} 
                        onUpdateGrievanceStatus={onUpdateGrievanceStatus} 
                        newStatus={newStatus}
                        setNewStatus={setNewStatus}
                    />
                </ScrollArea>
            </div>
        )
    }

    return (
        <div className="w-full md:max-w-sm p-4 border-b md:border-b-0 md:border-r border-border/60 animate-fade-in-left h-full md:h-auto">
            <ScrollArea className="h-full pr-4 -mr-4">
                <div className="space-y-6">
                     <Card className="bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Admin Tools</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <Button asChild variant={pathname.endsWith("analytics") ? 'default' : 'secondary'} className="w-full justify-start">
                                <Link href="/admin/analytics">
                                    <BarChart2 className="mr-2 h-4 w-4"/> Analytics Dashboard
                                </Link>
                            </Button>
                             <Button asChild variant={pathname.endsWith("integration-guide") ? 'default' : 'secondary'} className="w-full justify-start">
                                <Link href="/admin/integration-guide">
                                    <BookOpen className="mr-2 h-4 w-4"/> Integration Guide
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <FilterControls 
                        activeFilter={activeFilter} 
                        onFilterChange={onFilterChange} 
                    />
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Grievance Feed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-64 overflow-y-auto">
                                {isLoading && (
                                    <div className="space-y-4">
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                )}
                                {grievances?.map(g => (
                                    <button key={g.id} onClick={() => onSelectGrievance(g.id)} className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors">
                                        <p className="font-semibold truncate">{g.description}</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-muted-foreground">
                                                <ClientTime date={g.createdAt?.toDate()} />
                                            </p>
                                            <Badge variant={g.status === 'Resolved' ? 'default' : g.status === 'In Progress' ? 'secondary' : 'destructive'} className="shrink-0">{g.status}</Badge>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Top Reporters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Leaderboard users={topReporters} isLoading={isReportersLoading} />
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
        </div>
    );
}
