
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const RoutePlanner = dynamic(() => import('@/components/route-planner'), {
    ssr: false,
    loading: () => (
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-8 bg-muted animate-fade-in">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    ),
});

export default function DirectionsPage() {
    return (
        <div className="animate-fade-in">
            <RoutePlanner />
        </div>
    );
}
