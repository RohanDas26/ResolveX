
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

interface AdminSidebarProps {
    grievances: Grievance[] | null;
    users: UserProfile[] | null;
    isLoading: boolean;
    activeFilter: string | null;
    onFilterChange: (filter: string | null) => void;
    onUpdateGrievanceStatus: (id: string, status: Grievance['status']) => void;
    selectedGrievance: Grievance | null;
    onSelectGrievance: (id: string | null) => void;
}

export default function AdminSidebar({ 
    grievances, 
    users, 
    isLoading, 
    activeFilter, 
    onFilterChange, 
    selectedGrievance, 
    onSelectGrievance
}: AdminSidebarProps) {
    const pathname = usePathname();
    
    if (selectedGrievance) {
        return (
            <div className="w-full max-w-sm p-4 border-r border-border/60 animate-fade-in-left">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Grievance Details</h2>
                    <Button variant="ghost" size="icon" onClick={() => onSelectGrievance(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <GrievanceDetails grievance={selectedGrievance} />
            </div>
        )
    }

    return (
        <div className="w-full max-w-sm p-4 border-r border-border/60 animate-fade-in-left">
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
                                {grievances?.map(g => (
                                    <button key={g.id} onClick={() => onSelectGrievance(g.id)} className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors">
                                        <p className="font-semibold truncate">{g.description}</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-muted-foreground">{formatDistanceToNow(g.createdAt.toDate(), {addSuffix: true})}</p>
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
                            <Leaderboard users={users} isLoading={isLoading} />
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
        </div>
    );
}
