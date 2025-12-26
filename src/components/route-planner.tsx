
"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Map, useMap, useMapsLibrary, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import type { Grievance } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
    AlertTriangle, 
    Milestone, 
    LocateFixed, 
    Loader2, 
    Info, 
    Navigation, 
    Clock, 
    Forward,
    ArrowUp,
    ArrowLeft,
    ArrowRight,
    Undo2,
    Merge,
    Waypoints,
    CircleDot,
    Flag,
} from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { DEMO_GRIEVANCES } from '@/lib/demo-data';

// Helper component for Google Places Autocomplete
function PlaceAutocomplete({ onPlaceChanged, placeholder, onInputChange, value, disabled }: { onPlaceChanged: (place: google.maps.places.PlaceResult) => void, placeholder: string, onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void, value: string, disabled?: boolean }) {
    const placesLibrary = useMapsLibrary('places');
    const inputRef = useRef<HTMLInputElement>(null);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        if (!placesLibrary || !inputRef.current) return;
        const ac = new placesLibrary.Autocomplete(inputRef.current, { fields: ['geometry', 'name', 'formatted_address'] });
        ac.addListener('place_changed', () => {
            const place = ac.getPlace();
            if (place) onPlaceChanged(place);
        });
        setAutocomplete(ac);
    }, [placesLibrary, onPlaceChanged]);

    return <Input ref={inputRef} placeholder={placeholder} className="w-full" onChange={onInputChange} value={value} disabled={disabled} />;
}

// Main component to render the calculated route polyline
function RoutePolyline({ route, color }: { route: google.maps.DirectionsRoute | undefined, color: string }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !route) return;
        const polyline = new google.maps.Polyline({
            path: route.overview_path,
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 6,
        });
        polyline.setMap(map);

        // Fit map to route bounds
        if (route.bounds) {
            map.fitBounds(route.bounds);
        }

        return () => polyline.setMap(null);
    }, [map, route, color]);

    return null;
}

// Helper to get an icon for a maneuver
const getManeuverIcon = (maneuver: string | undefined) => {
    if (!maneuver) return <Forward className="h-5 w-5"/>;
    
    const maneuverMap: { [key: string]: React.ReactNode } = {
        'turn-sharp-left': <Undo2 className="h-5 w-5 transform -scale-x-100" />,
        'uturn-left': <Undo2 className="h-5 w-5 transform -scale-x-100" />,
        'turn-slight-left': <ArrowLeft className="h-5 w-5" />,
        'merge': <Merge className="h-5 w-5" />,
        'roundabout-left': <CircleDot className="h-5 w-5" />,
        'roundabout-right': <CircleDot className="h-5 w-5" />,
        'uturn-right': <Undo2 className="h-5 w-5" />,
        'turn-slight-right': <ArrowRight className="h-5 w-5" />,
        'straight': <ArrowUp className="h-5 w-5" />,
        'turn-left': <ArrowLeft className="h-5 w-5" />,
        'turn-right': <ArrowRight className="h-5 w-5" />,
        'fork-left': <Waypoints className="h-5 w-5" />,
        'fork-right': <Waypoints className="h-5 w-5 transform -scale-x-100" />,
        'ramp-left': <ArrowLeft className="h-5 w-5" />,
        'ramp-right': <ArrowRight className="h-5 w-5" />,
        'turn-sharp-right': <Undo2 className="h-5 w-5" />,
        'ferry': <Milestone className="h-5 w-5" />,
        'ferry-train': <Milestone className="h-5 w-5" />,
        'destination-left': <Flag className="h-5 w-5" />,
        'destination-right': <Flag className="h-5 w-5" />,
    };

    const key = Object.keys(maneuverMap).find(k => maneuver.includes(k));
    return key ? maneuverMap[key] : <Forward className="h-5 w-5" />;
};


export default function RoutePlanner() {
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const geometryLibrary = useMapsLibrary('geometry');
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);
    
    type LocationValue = google.maps.LatLngLiteral | google.maps.places.PlaceResult;

    const [origin, setOrigin] = useState<LocationValue | null>(null);
    const [destination, setDestination] = useState<LocationValue | null>(null);
    const [originText, setOriginText] = useState('');
    const [destinationText, setDestinationText] = useState('');
    const [allGrievances, setAllGrievances] = useState<Grievance[]>([]);
    
    useEffect(() => {
        // Initialize grievances from demo data on the client side
        setAllGrievances(DEMO_GRIEVANCES);
    }, []);

    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
    const [directionsResult, setDirectionsResult] = useState<google.maps.DirectionsResult | null>(null);
    const [selectedRoute, setSelectedRoute] = useState<google.maps.DirectionsRoute | null>(null);

    const [routePreference, setRoutePreference] = useState<'avoid_issues' | 'fastest'>('avoid_issues');
    const [isLoading, setIsLoading] = useState(false);
    const [issuesOnRoute, setIssuesOnRoute] = useState<Grievance[]>([]);

    useEffect(() => {
        if (!routesLibrary || !map) return;
        setDirectionsService(new routesLibrary.DirectionsService());
    }, [routesLibrary, map]);

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
    
    const countIssuesOnRoute = (route: google.maps.DirectionsRoute, openGrievances: Grievance[]) => {
        if (!geometryLibrary) return openGrievances.length;
        
        const routePolyline = new google.maps.Polyline({ path: route.overview_path });
        
        return openGrievances.filter(g => {
            const grievanceLoc = new google.maps.LatLng(g.location.latitude, g.location.longitude);
            return geometryLibrary.poly.isLocationOnEdge(grievanceLoc, routePolyline, 0.001); // Tolerance of ~100 meters
        }).length;
    };
    
    const findRoute = async () => {
        const originLocation = (origin as any)?.geometry?.location || origin;
        const destinationLocation = (destination as any)?.geometry?.location || destination;

        if (!originLocation || !destinationLocation || !directionsService) {
            toast({ variant: "destructive", title: "Missing Information", description: "Please select both an origin and a destination." });
            return;
        }
        
        setIsLoading(true);
        setDirectionsResult(null);
        setSelectedRoute(null);
        setIssuesOnRoute([]);
        
        const request: google.maps.DirectionsRequest = {
            origin: originLocation,
            destination: destinationLocation,
            travelMode: google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: true, // Request multiple routes
        };

        try {
            const response = await directionsService.route(request);
            if (response.status !== 'OK' || !response.routes || response.routes.length === 0) {
                toast({ variant: "destructive", title: "Route Not Found", description: "Could not find a route for the selected locations."});
                setIsLoading(false);
                return;
            }

            setDirectionsResult(response);
            const openGrievances = allGrievances.filter(g => g.status !== 'Resolved');

            let bestRoute: google.maps.DirectionsRoute;

            if (routePreference === 'avoid_issues' && response.routes.length > 1) {
                // Score each route by the number of issues on it
                const routesWithScores = response.routes.map(route => ({
                    route: route,
                    issueCount: countIssuesOnRoute(route, openGrievances),
                }));

                // Find the route with the minimum number of issues
                routesWithScores.sort((a, b) => a.issueCount - b.issueCount);
                bestRoute = routesWithScores[0].route;

                if (routesWithScores[0].issueCount < routesWithScores.find(r => r.route === response.routes[0])!.issueCount) {
                     toast({
                        title: "Safer Route Found!",
                        description: "A route with fewer reported issues has been selected.",
                        variant: 'default',
                        className: 'bg-green-600 border-green-600 text-white'
                    });
                }

            } else {
                // Default to the fastest (primary) route
                bestRoute = response.routes[0];
            }
            
            setSelectedRoute(bestRoute);

            // Final check for issues on the chosen route to display them
            const finalIssuesOnRoute = openGrievances.filter(g => {
                if (!geometryLibrary) return false;
                const grievanceLoc = new google.maps.LatLng(g.location.latitude, g.location.longitude);
                const routePolyline = new google.maps.Polyline({ path: bestRoute.overview_path });
                return geometryLibrary.poly.isLocationOnEdge(grievanceLoc, routePolyline, 0.001);
            });

            setIssuesOnRoute(finalIssuesOnRoute);

            if (routePreference === 'fastest' && finalIssuesOnRoute.length > 0) {
                toast({
                    title: "Issues on Fastest Route",
                    description: `FYI: The fastest route has ${finalIssuesOnRoute.length} reported issue(s).`,
                    variant: 'destructive'
                });
            } else if (finalIssuesOnRoute.length === 0) {
                 toast({
                    title: "Route Appears Clear!",
                    description: `No open grievances were found along your selected route.`,
                });
            }


        } catch (e) {
            console.error("Directions request failed", e);
            toast({ variant: "destructive", title: "Routing Error", description: "An error occurred while finding the route."});
        } finally {
            setIsLoading(false);
        }
    };

    const routeColor = routePreference === 'fastest' ? '#3b82f6' : '#22c55e'; // blue or green

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full">
            <div className="w-full max-w-md flex flex-col border-r border-border">
                <Card className="border-0 border-b rounded-none shadow-none">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Navigation /> Smart Navigator</CardTitle>
                        <CardDescription>Find the best route for your journey, avoiding reported issues.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Origin</Label>
                            <div className="flex gap-2">
                              {isClient ? (
                                <PlaceAutocomplete onPlaceChanged={p => {setOrigin(p); setOriginText(p.formatted_address || p.name || '')}} placeholder="Enter origin" value={originText} onInputChange={e => setOriginText(e.target.value)} />
                               ) : (
                                <Input placeholder="Enter origin" disabled />
                               )}
                                <Button variant="outline" size="icon" onClick={handleUseMyLocation}><LocateFixed/></Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Destination</Label>
                            {isClient ? (
                              <PlaceAutocomplete onPlaceChanged={p => {setDestination(p); setDestinationText(p.formatted_address || p.name || '')}} placeholder="Enter destination" value={destinationText} onInputChange={e => setDestinationText(e.target.value)} />
                            ) : (
                              <Input placeholder="Enter destination" disabled />
                            )}
                        </div>
                        <RadioGroup value={routePreference} onValueChange={(v: 'fastest' | 'avoid_issues') => setRoutePreference(v)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fastest" id="fastest" />
                                <Label htmlFor="fastest">Fastest (ignore issues)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="avoid_issues" id="avoid_issues" />
                                <Label htmlFor="avoid_issues">Safest (avoid issues)</Label>
                            </div>
                        </RadioGroup>
                        <Button onClick={findRoute} className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="animate-spin mr-2"/>}
                            {isLoading ? 'Finding Route...' : 'Find Route'}
                        </Button>
                    </CardContent>
                </Card>

                <ScrollArea className="flex-1">
                    {selectedRoute ? (
                        <div className="p-4 space-y-4 animate-fade-in">
                            <Card>
                                <CardHeader className="p-4">
                                     <CardTitle className="text-lg">Route Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2 p-4 pt-0">
                                    <p><strong>Distance:</strong> {selectedRoute.legs[0].distance?.text}</p>
                                    <p><strong>Duration:</strong> {selectedRoute.legs[0].duration?.text}</p>
                                    <div className="flex items-center gap-2">
                                        <strong>Issues on route:</strong>
                                        <span className={`font-bold ${issuesOnRoute.length > 0 ? 'text-amber-500' : 'text-green-500'}`}>{issuesOnRoute.length}</span>
                                        {issuesOnRoute.length > 0 && <AlertTriangle className="text-amber-500 h-4 w-4"/>}
                                    </div>
                                </CardContent>
                            </Card>

                            <h3 className="text-lg font-semibold mt-4">Turn-by-turn Directions</h3>
                            <div className="space-y-3">
                                {selectedRoute.legs[0].steps.map((step, index) => (
                                    <div key={index} className="flex gap-4 items-start p-2 rounded-md hover:bg-muted animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                                        <div className="pt-1 text-primary">
                                             {getManeuverIcon(step.maneuver)}
                                        </div>
                                        <div>
                                            <div dangerouslySetInnerHTML={{ __html: step.instructions || '' }} className="font-semibold" />
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{step.distance?.text}</span>
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{step.duration?.text}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    ) : (
                         <div className="p-8 text-center text-muted-foreground animate-fade-in">
                            <Info className="h-8 w-8 mx-auto mb-2" />
                            <p>Enter an origin and destination to see your route.</p>
                        </div>
                    )}
                </ScrollArea>

            </div>
             <div className="flex-1 relative">
                <Map
                    defaultCenter={{ lat: 17.3850, lng: 78.4867 }}
                    defaultZoom={12}
                    mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    className="absolute top-0 left-0 h-full w-full bg-muted"
                >
                    {origin && (origin as any).geometry && <AdvancedMarker position={(origin as any).geometry.location}><Pin background={'#4caf50'} borderColor={'#fff'} glyphColor={'#fff'} /></AdvancedMarker>}
                    {destination && (destination as any).geometry && <AdvancedMarker position={(destination as any).geometry.location}><Pin background={'#f44336'} borderColor={'#fff'} glyphColor={'#fff'} /></AdvancedMarker>}
                    {selectedRoute && <RoutePolyline route={selectedRoute} color={routeColor} />}
                    
                    {issuesOnRoute.map(issue => (
                         <AdvancedMarker key={issue.id} position={{ lat: issue.location.latitude, lng: issue.location.longitude }}>
                           <div className="p-1 bg-amber-500 rounded-full shadow-lg">
                             <AlertTriangle className="h-4 w-4 text-white" />
                           </div>
                         </AdvancedMarker>
                    ))}
                </Map>
            </div>
        </div>
    );

    
}

    