"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Wrench, List } from "lucide-react";

interface FilterControlsProps {
    activeFilter: string | null;
    onFilterChange: (filter: string | null) => void;
}

const filters = [
    { id: null, label: "All Grievances", icon: List },
    { id: 'pothole', label: "Potholes", icon: Wrench },
    { id: 'streetlight', label: "Streetlights", icon: Lightbulb },
]

export default function FilterControls({ activeFilter, onFilterChange }: FilterControlsProps) {

    return (
        <Card className="bg-background/50">
            <CardHeader>
                <CardTitle className="text-lg">Filter Grievances</CardTitle>
                <CardDescription>
                    Click to filter issues on the map.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
                {filters.map(filter => (
                    <Button 
                        key={filter.id || 'all'}
                        variant={activeFilter === filter.id ? 'default' : 'secondary'} 
                        onClick={() => onFilterChange(filter.id)}
                        className="justify-start"
                    >
                        <filter.icon className="mr-2 h-4 w-4"/> {filter.label}
                    </Button>
                ))}
            </CardContent>
        </Card>
    );
}
