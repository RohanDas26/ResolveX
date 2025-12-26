
"use client";

import type { Grievance, UserProfile } from "@/lib/types";
import FilterControls from "./filter-controls";
import DatabaseSeeder from "./database-seeder";
import { ScrollArea } from "@/components/ui/scroll-area";
import Leaderboard from "../leaderboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface AdminSidebarProps {
    grievances: Grievance[] | null;
    users: UserProfile[] | null;
    isLoading: boolean;
    activeFilter: string | null;
    onFilterChange: (filter: string | null) => void;
    onUpdateGrievanceStatus: (id: string, status: Grievance['status']) => void;
}

export default function AdminSidebar({ grievances, users, isLoading, activeFilter, onFilterChange }: AdminSidebarProps) {
    
    return (
        <div className="w-full max-w-sm p-4 border-r border-border/60 overflow-y-auto animate-fade-in-left">
            <ScrollArea className="h-full pr-4 -mr-4">
                <div className="space-y-6">
                    <FilterControls 
                        activeFilter={activeFilter} 
                        onFilterChange={onFilterChange} 
                    />
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Reporters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Leaderboard users={users} isLoading={isLoading} />
                        </CardContent>
                    </Card>
                    <DatabaseSeeder />
                </div>
            </ScrollArea>
        </div>
    );
}
