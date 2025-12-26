
"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Map } from '@vis.gl/react-google-maps';
import type { Grievance } from '@/lib/types';
import RoutePlanner from '@/components/route-planner';

export default function DirectionsPage() {
    const [grievances] = useState<Grievance[]>([]);

    return (
        <div className="relative h-[calc(100vh-4rem)] w-full">
             <Map
                defaultCenter={{ lat: 17.3850, lng: 78.4867 }}
                defaultZoom={12}
                mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                className="absolute top-0 left-0 h-full w-full bg-muted"
             >
                <RoutePlanner allGrievances={grievances} />
             </Map>
        </div>
    );
}
