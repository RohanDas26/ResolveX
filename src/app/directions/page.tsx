
"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import type { Grievance } from '@/lib/types';
import { DEMO_GRIEVANCES } from '@/lib/demo-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Milestone, MapPin as MapIcon, LocateFixed } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Separate component for Autocomplete functionality
function PlaceAutocomplete({ onPlaceChanged, placeholder, onInputChange, value }: { onPlaceChanged: (place: google.maps.places.PlaceResult) => void, placeholder: string, onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void, value: string }) {
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

    return <Input ref={inputRef} placeholder={placeholder} className="w-full" onChange={onInputChange} value={value} />;
}

function Directions() {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const geometryLibrary = useMapsLibrary('geometry');
    const { toast } = useToast();

    type LocationValue = google.maps.LatLngLiteral | google.maps.places.PlaceResult;

    const [origin, setOrigin] = useState<LocationValue | null>(null);
    const [destination, setDestination] = useState<LocationValue | null>(null);
    const [originText, setOriginText] = useState('');
    const [destinationText, setDestinationText] = useState('');

    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
    const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
    const [avoidedGrievances, setAvoidedGrievances] = useState<Grievance[]>([]);
    const [routePreference, setRoutePreference] = useState<'avoid-all' | 'avoid-potholes' | 'fastest'>('avoid-all');

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new routesLibrary.DirectionsService());
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
    }, [routesLibrary, map]);

    useEffect(() => {
        if (!directionsRenderer) return;
        if (directionsResult) {
            directionsRenderer.setDirections(directionsResult);
        }
    }, [directionsRenderer, directionsResult]);


    const handleFindRoute = () => {
        const originLocation = (origin as any)?.geometry?.location || origin;
        const destinationLocation = (destination as any)?.geometry?.location || destination;

        if (!originLocation || !destinationLocation || !directionsService) {
            toast({ variant: "destructive", title: "Missing Information", description: "Please select both an origin and a destination." });
            return;
        }
        
        let grievancesToFilter: Grievance[] = [];
        if (routePreference === 'avoid-all') {
            grievancesToFilter = DEMO_GRIEVANCES.filter(g => g.status === 'Submitted' || g.status === 'In Progress');
        } else if (routePreference === 'avoid-potholes') {
            grievancesToFilter = DEMO_GRIEVANCES.filter(g => g.description.toLowerCase().includes('pothole') && (g.status === 'Submitted' || g.status === 'In Progress'));
        }

        const request: google.maps.DirectionsRequest = {
            origin: originLocation,
            destination: destinationLocation,
            travelMode: google.maps.TravelMode.DRIVING,
        };
        
        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
                setDirectionsResult(result);
                
                if (geometryLibrary && result.routes[0] && grievancesToFilter.length > 0) {
                    const routePath = result.routes[0].overview_path;
                    const grievancesOnRoute = grievancesToFilter.filter(g => {
                       const grievanceLoc = new google.maps.LatLng(g.location.latitude, g.location.longitude);
                       // isLocationOnEdge checks if a point is on or near a polyline.
                       return geometryLibrary.poly.isLocationOnEdge(grievanceLoc, new google.maps.Polyline({path: routePath}), 0.001); // 0.001 degrees is approx 111 meters tolerance
                    });
                    setAvoidedGrievances(grievancesOnRoute);
                } else {
                    setAvoidedGrievances([]);
                }
            } else {
                console.error(`Directions request failed due to ${status}`);
                toast({ variant: "destructive", title: "Route Failed", description: `Failed to get directions: ${status}` });
                setDirectionsResult(null); // Clear previous route on error
                setAvoidedGrievances([]);
            }
        });
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
             toast({ variant: "destructive", title: "Geolocation Error", description: "Geolocation is not supported by your browser." });
             return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latLng = { lat: position.coords.latitude, lng: position.coords.longitude };
                setOrigin(latLng);
                setOriginText(`My Location (${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)})`);
                 toast({ title: "Location Acquired", description: "Your current location has been set as the origin." });
            },
            () => {
                toast({ variant: "destructive", title: "Geolocation Error", description: "Unable to retrieve your location. Please enable permissions." });
            }
        );
    }
    

    return (
        <>
            <Card className="w-full max-w-md m-4 border-0 md:border md:shadow-lg z-10 animate-fade-in-left absolute">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Milestone /> Safe Path Finder</CardTitle>
                    <CardDescription>Plan your route and see potential road issues.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-[calc(100vh-12rem)] space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="origin-input" className="text-sm font-medium">Origin</Label>
                        <div className="flex gap-2">
                            <PlaceAutocomplete 
                                onPlaceChanged={place => { setOrigin(place); setOriginText(place.formatted_address || place.name || ''); }} 
                                placeholder="Enter origin" 
                                value={originText}
                                onInputChange={(e) => setOriginText(e.target.value)}
                            />
                            <Button variant="outline" size="icon" onClick={handleUseMyLocation} aria-label="Use my location">
                                <LocateFixed className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="destination-input" className="text-sm font-medium">Destination</Label>
                        <PlaceAutocomplete 
                            onPlaceChanged={place => { setDestination(place); setDestinationText(place.formatted_address || place.name || ''); }} 
                            placeholder="Enter destination"
                            value={destinationText}
                            onInputChange={(e) => setDestinationText(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                         <Label className="text-sm font-medium">Route Preference</Label>
                         <RadioGroup defaultValue="avoid-all" onValueChange={(value: 'avoid-all' | 'avoid-potholes' | 'fastest') => setRoutePreference(value)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fastest" id="fastest" />
                                <Label htmlFor="fastest">Fastest Route</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="avoid-potholes" id="avoid-potholes" />
                                <Label htmlFor="avoid-potholes">Check for Potholes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="avoid-all" id="avoid-all" />
                                <Label htmlFor="avoid-all">Check for All Issues</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Button onClick={handleFindRoute} className="w-full">Find Route</Button>
                    
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
                                <MapIcon className="h-10 w-10 mb-2"/>
                                <p>Your route will be displayed here once you enter an origin and destination.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}


export default function DirectionsPage() {
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
                <Directions />
             </Map>
        </div>
    );
}
