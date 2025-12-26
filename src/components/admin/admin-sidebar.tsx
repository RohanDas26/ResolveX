"use client";

import { useState } from "react";
import type { Grievance } from "@/lib/types";
import AISummary from "./ai-summary";
import FilterControls from "./filter-controls";
import DatabaseSeeder from "./database-seeder";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminSidebarProps {
    grievances: Grievance[] | null;
    isLoading: boolean;
    activeFilter: string | null;
    onFilterChange: (filter: string | null) => void;
}

export default function AdminSidebar({ grievances, isLoading, activeFilter, onFilterChange }: AdminSidebarProps) {
    
    const grievanceDescriptions = grievances?.map(g => g.description) || [];

    return (
        <div className="w-full max-w-sm p-4 border-r border-border/60 overflow-y-auto animate-fade-in-left">
            <ScrollArea className="h-full pr-4 -mr-4">
                <div className="space-y-6">
                    <AISummary 
                        grievances={grievanceDescriptions} 
                        isLoading={isLoading} 
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
