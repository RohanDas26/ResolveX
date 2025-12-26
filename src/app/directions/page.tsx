
"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { useMap, useMapsLibrary, useDirectionsService } from '@vis.gl/react-google-maps';
import type { Grievance } from '@/lib/types';
import { DEMO_GRIEVANCES } from '@/lib/demo-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Map, Milestone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const AVOIDANCE_RADIUS_METERS = 50; // 50 meters radius around a grievance

// Separate component for Autocomplete functionality
function PlaceAutocomplete({ onPlaceChanged, placeholder }: { onPlaceChanged: (place: google.maps.places.PlaceResult) => void, placeholder: string }) {
    const placesLibrary = useMapsLibrary('places');
    const inputRef = useRef<HTMLInputElement>(null);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        if (!placesLibrary || !inputRef.current) return;

        const ac = new placesLibrary.Autocomplete(inputRef.current, {
            fields: ['geometry', 'name', 'formatted_address']
        });
        setAutocomplete(ac);
    }, [placesLibrary]);

    useEffect(() => {
        if (!autocomplete) return;
        
        const listener = autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place) {
                onPlaceChanged(place);
            }
        });

        return () => {
            google.maps.event.removeListener(listener);
        };
    }, [autocomplete, onPlaceChanged]);

    return <Input ref={inputRef} placeholder={placeholder} className="w-full" />;
}

function Directions() {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const geometryLibrary = useMapsLibrary('geometry');

    const [origin, setOrigin] = useState<google.maps.places.PlaceResult | null>(null);
    const [destination, setDestination] = useState<google.maps.places.PlaceResult | null>(null);
    const [directionsRequest, setDirectionsRequest] = useState<google.maps.DirectionsRequest | null>(null);
    const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
    const [avoidedGrievances, setAvoidedGrievances] = useState<Grievance[]>([]);

    const directionsService = useDirectionsService();

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
    }, [routesLibrary, map]);

    useEffect(() => {
        if (!directionsRenderer || !directionsResult) return;
        directionsRenderer.setDirections(directionsResult);
    }, [directionsRenderer, directionsResult]);


    const handleFindRoute = () => {
        if (!origin || !destination || !origin.geometry?.location || !destination.geometry?.location) {
            alert("Please select both an origin and a destination.");
            return;
        }

        const activeGrievances = DEMO_GRIEVANCES.filter(
            g => g.status === 'Submitted' || g.status === 'In Progress'
        );

        const waypoints: google.maps.DirectionsWaypoint[] = activeGrievances.map(g => ({
            location: new google.maps.LatLng(g.location.latitude, g.location.longitude),
            stopover: false
        }));

        const request: google.maps.DirectionsRequest = {
            origin: origin.geometry.location,
            destination: destination.geometry.location,
            travelMode: google.maps.TravelMode.DRIVING,
        };
        
        setDirectionsRequest(request);
    };

    useEffect(() => {
        if (!directionsService || !directionsRequest) return;
        
        directionsService.route(directionsRequest, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
                setDirectionsResult(result);
                
                if (geometryLibrary && result.routes[0]) {
                    const routePath = result.routes[0].overview_path;
                    const grievancesOnRoute = DEMO_GRIEVANCES.filter(g => {
                       const grievanceLoc = new google.maps.LatLng(g.location.latitude, g.location.longitude);
                       return geometryLibrary.poly.isLocationOnEdge(grievanceLoc, new google.maps.Polyline({path: routePath}), 0.001); // 0.001 degrees tolerance
                    });
                    setAvoidedGrievances(grievancesOnRoute);
                }
            } else {
                console.error(`Directions request failed due to ${status}`);
                alert(`Failed to get directions: ${status}. The route might be too complex or impossible with the given avoidances.`);
            }
        });

    }, [directionsService, directionsRequest, geometryLibrary]);
    

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            <Card className="w-full max-w-md m-4 border-0 md:border md:shadow-lg z-10 animate-fade-in-left">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Milestone /> Directions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-[calc(100%-4rem)] space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="origin-input" className="text-sm font-medium">Origin</label>
                        <PlaceAutocomplete onPlaceChanged={setOrigin} placeholder="Enter origin" />
                    </div>
                     <div className="space-y-2">
                         <label htmlFor="destination-input" className="text-sm font-medium">Destination</label>
                        <PlaceAutocomplete onPlaceChanged={setDestination} placeholder="Enter destination" />
                    </div>
                    <Button onClick={handleFindRoute} className="w-full">Find Route Avoiding Grievances</Button>
                    
                    <div className="flex-grow overflow-hidden">
                        <p className="font-semibold text-sm mb-2">Route Information</p>
                        {directionsResult ? (
                            <ScrollArea className="h-full pr-4">
                                <div className="space-y-4">
                                    <div className="p-3 bg-muted rounded-md text-sm">
                                        <p><strong>Distance:</strong> {directionsResult.routes[0].legs[0].distance?.text}</p>
                                        <p><strong>Duration:</strong> {directionsResult.routes[0].legs[0].duration?.text}</p>
                                    </div>
                                    {avoidedGrievances.length > 0 && (
                                         <div>
                                            <h4 className="font-semibold flex items-center gap-2"><AlertTriangle className="text-amber-500" /> Issues on Your Route</h4>
                                            <div className="space-y-3 mt-2">
                                                {avoidedGrievances.map(g => (
                                                    <div key={g.id} className="flex gap-3 items-start text-xs p-2 bg-secondary rounded-md">
                                                        <Image src={g.imageUrl} width={48} height={48} alt={g.description} className="rounded-md w-12 h-12 object-cover"/>
                                                        <div className="flex-grow">
                                                            <p className="font-semibold">{g.description}</p>
                                                            <Badge variant={g.status === 'Resolved' ? 'default' : 'destructive'} className="mt-1">{g.status}</Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                         </div>
                                    )}
                                     <div>
                                        <h4 className="font-semibold">Directions</h4>
                                        <ol className="list-decimal list-inside space-y-2 mt-2 text-sm text-muted-foreground">
                                            {directionsResult.routes[0].legs[0].steps.map((step, i) => (
                                                <li key={i} dangerouslySetInnerHTML={{ __html: step.instructions }} />
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </ScrollArea>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4 bg-muted rounded-md">
                                <Map className="h-10 w-10 mb-2"/>
                                <p>Your route will be displayed here once you enter an origin and destination.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex-1 h-full w-full absolute top-0 left-0 -z-10">
                 {/* The DirectionsRenderer is now managed via useEffect */}
            </div>
        </div>
    );
}


export default function DirectionsPage() {
    return (
        <div className="relative h-full w-full">
            <div className="absolute top-0 left-0 h-full w-full bg-muted">
                 <Map
                    defaultCenter={{ lat: 17.3850, lng: 78.4867 }}
                    defaultZoom={12}
                    mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    className="w-full h-full"
                 />
            </div>
            <Directions />
        </div>
    );
}
