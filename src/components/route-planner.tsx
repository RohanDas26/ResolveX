
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
function RoutePolyline({ route, color, visible = true }: { route: google.maps.DirectionsRoute | undefined, color: string, visible?: boolean }) {
    const map = useMap();

    const polyline = useMemo(() => {
        if (!map || !route) return null;
        const p = new google.maps.Polyline({
            path: route.overview_path,
            strokeColor: color,
            strokeOpacity: visible ? 0.8 : 0.4,
            strokeWeight: visible ? 7 : 5,
            zIndex: visible ? 1 : 0
        });
        return p;
    }, [map, route, color, visible]);

    useEffect(() => {
        if (!map || !polyline) return;
        polyline.setMap(map);
        return () => polyline.setMap(null);
    }, [map, polyline]);
    
     useEffect(() => {
        if (map && route?.bounds && visible) {
            map.fitBounds(route.bounds);
        }
    }, [map, route, visible]);


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

    
    type LocationValue = google.maps.LatLngLiteral | { geometry: { location: google.maps.LatLng } } | {name: string, formatted_address: string};

    const [origin, setOrigin] = useState<LocationValue | null>(null);
    const [destination, setDestination] = useState<LocationValue | null>(null);
    const [originText, setOriginText] = useState('');
    const [destinationText, setDestinationText] = useState('');
    const [allGrievances, setAllGrievances] = useState<Grievance[]>([]);
    
    useEffect(() => {
        setIsClient(true);
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
        if (!geometryLibrary) return [];
        
        const routePath = route.overview_path;
        
        const onRoute = openGrievances.filter(g => {
            const grievanceLoc = new google.maps.LatLng(g.location.latitude, g.location.longitude);
            // Check if the location is within ~50 meters of the polyline
            return geometryLibrary.poly.isLocationOnEdge(grievanceLoc, new google.maps.Polyline({ path: routePath }), 1e-3);
        });
        return onRoute;
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
            provideRouteAlternatives: true,
        };

        try {
            const response = await directionsService.route(request);
            if (response.status !== 'OK' || !response.routes || response.routes.length === 0) {
                toast({ variant: "destructive", title: "Route Not Found", description: "Could not find a route for the selected locations."});
                setIsLoading(false);
                return;
            }

            const openGrievances = allGrievances.filter(g => g.status !== 'Resolved');

            const routesWithAnalysis = response.routes.map(route => {
                const issues = countIssuesOnRoute(route, openGrievances);
                return {
                    route,
                    issues,
                    issueCount: issues.length,
                    duration: route.legs[0]?.duration?.value || Infinity,
                };
            });
            
            const fastestRouteData = [...routesWithAnalysis].sort((a, b) => a.duration - b.duration)[0];
            const safestRouteData = [...routesWithAnalysis].sort((a, b) => {
                if (a.issueCount !== b.issueCount) {
                    return a.issueCount - b.issueCount;
                }
                return a.duration - b.duration; 
            })[0];
            
            let chosenRouteData;
            if (routePreference === 'fastest') {
                chosenRouteData = fastestRouteData;
                 toast({
                    title: "Fastest Route Selected",
                    description: `Duration: ${chosenRouteData.route.legs[0].duration?.text}. Issues on route: ${chosenRouteData.issueCount}.`,
                });
            } else { // 'avoid_issues'
                chosenRouteData = safestRouteData;
                const issuesAvoided = fastestRouteData.issueCount - safestRouteData.issueCount;
                if (issuesAvoided > 0) {
                     toast({
                        title: "Safest Route Selected!",
                        description: `This route avoids ${issuesAvoided} issue(s).`,
                        variant: 'default',
                        className: 'bg-green-600 border-green-600 text-white'
                    });
                } else {
                     toast({
                        title: "Safest Route Selected",
                        description: `Found route with ${safestRouteData.issueCount} issues. This is the best available option.`,
                    });
                }
            }
            
            setDirectionsResult(response);
            setSelectedRoute(chosenRouteData.route);
            setIssuesOnRoute(chosenRouteData.issues);

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
                            {isLoading ? 'Finding Routes...' : 'Find Route'}
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
                    
                    {directionsResult && directionsResult.routes.map((route, index) => (
                         <RoutePolyline 
                            key={index} 
                            route={route} 
                            color={route === selectedRoute ? routeColor : '#808080'}
                            visible={route === selectedRoute}
                         />
                    ))}
                     {directionsResult && directionsResult.routes.map((route, index) => (
                        <RoutePolyline
                            key={`alt-${index}`}
                            route={route}
                            color="#808080"
                            visible={route !== selectedRoute}
                        />
                    ))}
                    
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

    