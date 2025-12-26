
"use client";

import type { Grievance, UserProfile } from "@/lib/types";
import FilterControls from "./filter-controls";
import { ScrollArea } from "@/components/ui/scroll-area";
import Leaderboard from "../leaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import { BarChart2, BookOpen } from "lucide-react";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
    grievances: Grievance[] | null;
    users: UserProfile[] | null;
    isLoading: boolean;
    activeFilter: string | null;
    onFilterChange: (filter: string | null) => void;
    onUpdateGrievanceStatus: (id: string, status: Grievance['status']) => void;
}

export default function AdminSidebar({ grievances, users, isLoading, activeFilter, onFilterChange }: AdminSidebarProps) {
    const pathname = usePathname();
    
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
