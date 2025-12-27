
"use client";

import { useState, useMemo, useEffect, useRef, MouseEvent } from "react";
import {
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import type { Grievance } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
  Route,
  ShieldCheck,
  Zap,
  PanelTop,
  Move,
  Maximize,
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { DEMO_GRIEVANCES } from "@/lib/demo-data";
import { cn } from "@/lib/utils";


// -------- helpers --------

const formatDuration = (text: string | undefined): string => {
  if (!text) return '--';
  return text
    .replace(" hours", "hr")
    .replace(" hour", "hr")
    .replace(" minutes", "min")
    .replace(" minute", "min");
};

const toLatLngLiteral = (
  value: google.maps.places.PlaceResult | google.maps.LatLngLiteral | null
): google.maps.LatLngLiteral | null => {
  if (!value) return null;
  if ("lat" in value && "lng" in value) {
    return value;
  }
  const loc = value.geometry?.location;
  if (!loc) return null;
  return { lat: loc.lat(), lng: loc.lng() };
};

// Places autocomplete input
function PlaceAutocomplete({
  onPlaceChanged,
  placeholder,
  onInputChange,
  value,
  disabled,
}: {
  onPlaceChanged: (place: google.maps.places.PlaceResult) => void;
  placeholder: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  disabled?: boolean;
}) {
  const placesLibrary = useMapsLibrary("places");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!placesLibrary || !inputRef.current) return;
    const ac = new placesLibrary.Autocomplete(inputRef.current, {
      fields: ["geometry", "name", "formatted_address"],
    });
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (place) onPlaceChanged(place);
    });
  }, [placesLibrary, onPlaceChanged]);

  return (
    <Input
      ref={inputRef}
      placeholder={placeholder}
      className="w-full"
      onChange={onInputChange}
      value={value}
      disabled={disabled}
    />
  );
}

// Polyline renderer
function RoutePolyline({
  route,
  color,
  visible = true,
  zIndex = 0,
}: {
  route: google.maps.DirectionsRoute | undefined;
  color: string;
  visible?: boolean;
  zIndex?: number;
}) {
  const map = useMap();

  const polyline = useMemo(() => {
    if (!map || !route) return null;
    return new google.maps.Polyline({
      path: route.overview_path,
      strokeColor: color,
      strokeOpacity: visible ? 0.8 : 0.4,
      strokeWeight: visible ? 7 : 5,
      zIndex,
    });
  }, [map, route, color, visible, zIndex]);

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

// Maneuver icon helper
const getManeuverIcon = (maneuver: string | undefined) => {
  if (!maneuver) return <Forward className="h-5 w-5" />;

  const maneuverMap: { [key: string]: React.ReactNode } = {
    "turn-sharp-left": <Undo2 className="h-5 w-5 transform -scale-x-100" />,
    "uturn-left": <Undo2 className="h-5 w-5 transform -scale-x-100" />,
    "turn-slight-left": <ArrowLeft className="h-5 w-5" />,
    merge: <Merge className="h-5 w-5" />,
    "roundabout-left": <CircleDot className="h-5 w-5" />,
    "roundabout-right": <CircleDot className="h-5 w-5" />,
    "uturn-right": <Undo2 className="h-5 w-5" />,
    "turn-slight-right": <ArrowRight className="h-5 w-5" />,
    straight: <ArrowUp className="h-5 w-5" />,
    "turn-left": <ArrowLeft className="h-5 w-5" />,
    "turn-right": <ArrowRight className="h-5 w-5" />,
    "fork-left": <Waypoints className="h-5 w-5" />,
    "fork-right": <Waypoints className="h-5 w-5 transform -scale-x-100" />,
    "ramp-left": <ArrowLeft className="h-5 w-5" />,
    "ramp-right": <ArrowRight className="h-5 w-5" />,
    "turn-sharp-right": <Undo2 className="h-5 w-5" />,
    ferry: <Milestone className="h-5 w-5" />,
    "ferry-train": <Milestone className="h-5 w-5" />,
    "destination-left": <Flag className="h-5 w-5" />,
    "destination-right": <Flag className="h-5 w-5" />,
  };

  const key = Object.keys(maneuverMap).find((k) => maneuver.includes(k));
  return key ? maneuverMap[key] : <Forward className="h-5 w-5" />;
};

export default function RoutePlanner() {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const geometryLibrary = useMapsLibrary("geometry");
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  const [origin, setOrigin] =
    useState<google.maps.places.PlaceResult | google.maps.LatLngLiteral | null>(
      null
    );
  const [destination, setDestination] =
    useState<google.maps.places.PlaceResult | google.maps.LatLngLiteral | null>(
      null
    );

  const [originText, setOriginText] = useState("");
  const [destinationText, setDestinationText] = useState("");
  const [allGrievances, setAllGrievances] = useState<Grievance[]>([]);
  
  // Directions Panel State
  const [showDirections, setShowDirections] = useState(true);
  const [panelPosition, setPanelPosition] = useState({ x: 16, y: 16 });
  const [panelSize, setPanelSize] = useState({ width: 384, height: 400 }); // sm: 384px
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });


  useEffect(() => {
    setIsClient(true);
    setAllGrievances(DEMO_GRIEVANCES);
  }, []);

  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService | null>(null);
  const [routePreference, setRoutePreference] = useState<
    "avoid_issues" | "fastest"
  >("avoid_issues");
  const [isLoading, setIsLoading] = useState(false);

  const [fastestRoute, setFastestRoute] =
    useState<google.maps.DirectionsRoute | null>(null);
  const [safestRoute, setSafestRoute] =
    useState<google.maps.DirectionsRoute | null>(null);
  const [issuesOnFastest, setIssuesOnFastest] = useState<Grievance[]>([]);
  const [issuesOnSafest, setIssuesOnSafest] = useState<Grievance[]>([]);

  const selectedRoute = useMemo(
    () => (routePreference === "fastest" ? fastestRoute : safestRoute),
    [routePreference, fastestRoute, safestRoute]
  );

  const issuesOnSelectedRoute = useMemo(
    () =>
      routePreference === "fastest" ? issuesOnFastest : issuesOnSafest,
    [routePreference, issuesOnFastest, issuesOnSafest]
  );

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
  }, [routesLibrary, map]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Geolocation Error",
        description: "Geolocation is not supported by your browser.",
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setOrigin(latLng);
        setOriginText(
          `My Location (${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)})`
        );
        toast({
          title: "Location Acquired",
          description: "Your current location has been set as the origin.",
        });
      },
      () => {
        toast({
          variant: "destructive",
          title: "Geolocation Error",
          description:
            "Unable to retrieve your location. Please enable permissions.",
        });
      }
    );
  };
  
  const createMockIssuesOnRoute = (
    route: google.maps.DirectionsRoute
  ): Grievance[] => {
    if (!route || !route.overview_path) return [];

    const path = route.overview_path;
    const issues: Grievance[] = [];
    const numIssues = 5;

    for (let i = 1; i <= numIssues; i++) {
      const pointIndex = Math.floor(path.length * (i / (numIssues + 1)));
      const point = path[pointIndex];

      if (point) {
        issues.push({
          id: `mock-issue-${i}`,
          userId: "mock-user",
          userName: "Mock User",
          description: `Simulated issue #${i} on this route.`,
          location: {
            latitude: point.lat(),
            longitude: point.lng(),
          } as any,
          imageUrl: "https://placehold.co/400x300/ef4444/ffffff?text=Issue",
          status: "Submitted",
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
        });
      }
    }
    return issues;
  };

  const findRoute = async () => {
    const originLocation = toLatLngLiteral(origin);
    const destinationLocation = toLatLngLiteral(destination);

    if (!originLocation || !destinationLocation || !directionsService) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select both an origin and a destination.",
      });
      return;
    }

    setIsLoading(true);
    setFastestRoute(null);
    setSafestRoute(null);
    setIssuesOnFastest([]);
    setIssuesOnSafest([]);

    const request: google.maps.DirectionsRequest = {
      origin: originLocation,
      destination: destinationLocation,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: true,
    };

    try {
      const response = await directionsService.route(request);
      if (
        response.status !== "OK" ||
        !response.routes ||
        response.routes.length === 0
      ) {
        toast({
          variant: "destructive",
          title: "Route Not Found",
          description: "Could not find a route for the selected locations.",
        });
        setIsLoading(false);
        return;
      }
      
      const sortedByDuration = [...response.routes].sort(
        (a, b) =>
          (a.legs[0]?.duration?.value || Infinity) -
          (b.legs[0]?.duration?.value || Infinity)
      );
      
      const actualFastest = sortedByDuration[0];
      const aLongerRoute = sortedByDuration.length > 1 ? sortedByDuration[1] : actualFastest;

      setFastestRoute(actualFastest);
      setIssuesOnFastest(createMockIssuesOnRoute(actualFastest));

      setSafestRoute(aLongerRoute);
      setIssuesOnSafest([]);

      toast({
        title: "Routes Found!",
        description: "Compare the fastest and safest options.",
      });

    } catch (e) {
      console.error("Directions request failed", e);
      toast({
        variant: "destructive",
        title: "Routing Error",
        description: "An error occurred while finding the route.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Drag and resize handlers
  const onDragMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - panelPosition.x,
      y: e.clientY - panelPosition.y,
    };
    e.stopPropagation();
  };
  
  const onResizeMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsResizing(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
    };
    resizeStartSize.current = panelSize;
    e.stopPropagation();
  };

  const onMouseMove = (e: globalThis.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;
      setPanelPosition({ x: newX, y: newY });
    }
    if (isResizing) {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      const newWidth = Math.max(320, resizeStartSize.current.width + dx); // min width 320px
      const newHeight = Math.max(200, resizeStartSize.current.height + dy); // min height 200px
      setPanelSize({ width: newWidth, height: newHeight });
    }
  };
  
  const onMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, isResizing]);


  const fastestRouteColor = "#ef4444"; // Red for danger
  const safestRouteColor = "#22c55e"; // Green for safe

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      <div className="w-full max-w-md flex flex-col border-r border-border">
        <ScrollArea className="flex-1">
          <Card className="border-0 rounded-none shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation /> Smart Navigator
              </CardTitle>
              <CardDescription>
                Find the best route for your journey, avoiding reported issues.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Origin</Label>
                <div className="flex gap-2">
                  {isClient ? (
                    <PlaceAutocomplete
                      onPlaceChanged={(p) => {
                        setOrigin(p);
                        setOriginText(
                          p.formatted_address || p.name || ""
                        );
                      }}
                      placeholder="Enter origin"
                      value={originText}
                      onInputChange={(e) => setOriginText(e.target.value)}
                    />
                  ) : (
                    <Input placeholder="Enter origin" disabled />
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleUseMyLocation}
                  >
                    <LocateFixed />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Destination</Label>
                {isClient ? (
                  <PlaceAutocomplete
                    onPlaceChanged={(p) => {
                      setDestination(p);
                      setDestinationText(
                        p.formatted_address || p.name || ""
                      );
                    }}
                    placeholder="Enter destination"
                    value={destinationText}
                    onInputChange={(e) =>
                      setDestinationText(e.target.value)
                    }
                  />
                ) : (
                  <Input placeholder="Enter destination" disabled />
                )}
              </div>
              
              <RadioGroup
                value={routePreference}
                onValueChange={(v: "fastest" | "avoid_issues") =>
                  setRoutePreference(v)
                }
                className="grid grid-cols-2 gap-4"
              >
                <Label htmlFor="fastest" className={cn(
                    "flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-all",
                    routePreference === 'fastest' ? 'border-primary bg-primary/10' : 'border-muted bg-transparent hover:border-muted-foreground/50'
                )}>
                  <RadioGroupItem value="fastest" id="fastest" className="sr-only"/>
                  <div className="flex justify-between w-full items-center">
                      <span className="font-bold text-lg flex items-center gap-2"><Zap className="text-primary"/> Fastest</span>
                      <span className={cn("font-bold", routePreference === 'fastest' ? 'text-primary' : 'text-muted-foreground')}>
                        {formatDuration(fastestRoute?.legs[0].duration?.text)}
                      </span>
                  </div>
                   <div className="w-full text-sm text-muted-foreground mt-2 space-y-1">
                      <div className="flex justify-between"><span>Distance:</span> <span>{fastestRoute?.legs[0].distance?.text || '--'}</span></div>
                      <div className="flex justify-between items-center">
                        <span>Issues:</span>
                        <span className="flex items-center gap-1 font-bold text-destructive">
                          <AlertTriangle className="h-4 w-4"/> {issuesOnFastest.length}
                        </span>
                      </div>
                   </div>
                </Label>
                
                 <Label htmlFor="avoid_issues" className={cn(
                    "flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer transition-all",
                    routePreference === 'avoid_issues' ? 'border-green-500 bg-green-500/10' : 'border-muted bg-transparent hover:border-muted-foreground/50'
                )}>
                  <RadioGroupItem value="avoid_issues" id="avoid_issues" className="sr-only"/>
                  <div className="flex justify-between w-full items-center">
                      <span className="font-bold text-lg flex items-center gap-2"><ShieldCheck className="text-green-500"/> Safest</span>
                      <span className={cn("font-bold", routePreference === 'avoid_issues' ? 'text-green-500' : 'text-muted-foreground')}>
                         {formatDuration(safestRoute?.legs[0].duration?.text)}
                      </span>
                  </div>
                   <div className="w-full text-sm text-muted-foreground mt-2 space-y-1">
                      <div className="flex justify-between"><span>Distance:</span> <span>{safestRoute?.legs[0].distance?.text || '--'}</span></div>
                      <div className="flex justify-between items-center">
                        <span>Issues:</span>
                        <span className="flex items-center gap-1 font-bold text-green-500">
                          <ShieldCheck className="h-4 w-4"/> {issuesOnSafest.length}
                        </span>
                      </div>
                   </div>
                </Label>
              </RadioGroup>

              <Button
                onClick={findRoute}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="animate-spin mr-2" />}
                {isLoading ? "Finding Routes..." : "Find Route"}
              </Button>
            </CardContent>
          </Card>
        </ScrollArea>
      </div>

      <div className="flex-1 relative">
        <Map
          defaultCenter={{ lat: 17.385, lng: 78.4867 }}
          defaultZoom={12}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          className="absolute top-0 left-0 h-full w-full bg-muted"
        >
          {origin && (
            <AdvancedMarker position={toLatLngLiteral(origin)!}>
              <Pin
                background={"#4caf50"}
                borderColor={"#fff"}
                glyphColor={"#fff"}
              />
            </AdvancedMarker>
          )}
          {destination && (
            <AdvancedMarker position={toLatLngLiteral(destination)!}>
              <Pin
                background={"#f44336"}
                borderColor={"#fff"}
                glyphColor={"#fff"}
              />
            </AdvancedMarker>
          )}
          
          <RoutePolyline
            route={fastestRoute ?? undefined}
            color={fastestRouteColor}
            visible={routePreference === 'fastest'}
            zIndex={routePreference === 'fastest' ? 2 : 1}
          />
          <RoutePolyline
            route={safestRoute ?? undefined}
            color={safestRouteColor}
            visible={routePreference === 'avoid_issues'}
            zIndex={routePreference === 'avoid_issues' ? 2 : 1}
          />

          {issuesOnSelectedRoute.map((issue) => (
            <AdvancedMarker
              key={issue.id}
              position={{
                lat: issue.location.latitude,
                lng: issue.location.longitude,
              }}
            >
              <div className="p-1 bg-amber-500 rounded-full shadow-lg">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </AdvancedMarker>
          ))}
        </Map>
        
        {selectedRoute && (
          <div 
            className="absolute animate-fade-in-up"
            style={{ 
              left: `${panelPosition.x}px`, 
              top: `${panelPosition.y}px`, 
              width: `${panelSize.width}px`, 
              height: `${panelSize.height}px` 
            }}
          >
            <Card className="bg-background/80 backdrop-blur-md w-full h-full flex flex-col shadow-2xl">
              <CardHeader 
                className="flex flex-row items-center justify-between p-3 cursor-move"
                onMouseDown={onDragMouseDown}
              >
                <CardTitle className="text-lg flex items-center gap-2"><Move className="h-4 w-4 text-muted-foreground"/>Directions</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowDirections(!showDirections)}>
                    <PanelTop className={cn("h-5 w-5 transition-transform", showDirections && "rotate-180")}/>
                </Button>
              </CardHeader>
              {showDirections && (
                <CardContent className="p-3 pt-0 flex-1 min-h-0">
                  <ScrollArea className="h-full text-sm">
                    <div className="space-y-3 pr-4">
                      {selectedRoute.legs?.[0]?.steps?.map((step, index) => (
                          <div
                            key={index}
                            className="flex gap-4 items-start p-2 rounded-md animate-fade-in-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="pt-1 text-primary">
                              {getManeuverIcon(step.maneuver)}
                            </div>
                            <div>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: step.instructions || "",
                                }}
                                className="font-semibold"
                              />
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{step.distance?.text}</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {step.duration?.text}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              )}
               <div 
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
                  onMouseDown={onResizeMouseDown}
               >
                 <Maximize className="h-3 w-3 absolute bottom-1 right-1 text-muted-foreground/50"/>
              </div>
            </Card>
          </div>
        )}
         {!selectedRoute && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-muted-foreground animate-fade-in p-4 bg-background/80 rounded-lg shadow-lg">
              <Info className="h-8 w-8 mx-auto mb-2" />
              <p>Enter an origin and destination to see your route.</p>
            </div>
          )}
      </div>
    </div>
  );
}

    