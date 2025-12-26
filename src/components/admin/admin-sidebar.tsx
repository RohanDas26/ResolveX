
"use client";

import type { Grievance } from "@/lib/types";
import FilterControls from "./filter-controls";
import DatabaseSeeder from "./database-seeder";
import { ScrollArea } from "@/components/ui/scroll-area";
import AIStatusUpdater from "./ai-status-updater";

interface AdminSidebarProps {
    grievances: Grievance[] | null;
    isLoading: boolean;
    activeFilter: string | null;
    onFilterChange: (filter: string | null) => void;
    onUpdateGrievanceStatus: (id: string, status: Grievance['status']) => void;
}

export default function AdminSidebar({ grievances, isLoading, activeFilter, onFilterChange, onUpdateGrievanceStatus }: AdminSidebarProps) {
    
    return (
        <div className="w-full max-w-sm p-4 border-r border-border/60 overflow-y-auto animate-fade-in-left">
            <ScrollArea className="h-full pr-4 -mr-4">
                <div className="space-y-6">
                    <AIStatusUpdater
                        grievances={grievances || []}
                        isLoading={isLoading}
                        onUpdateStatus={onUpdateGrievanceStatus}
                    />
                    <FilterControls 
                        activeFilter={activeFilter} 
                        onFilterChange={onFilterChange} 
                    />
                    <DatabaseSeeder />
                </div>
            </ScrollArea>
        </div>
    );
}
