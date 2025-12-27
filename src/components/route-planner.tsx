"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { DEMO_GRIEVANCES } from "@/lib/demo-data";

// -------- helpers --------

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
      strokeOpacity: visible ? 0.8 : 0,
      strokeWeight: visible ? 8 : 5,
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

  const countIssuesOnRoute = (
    route: google.maps.DirectionsRoute,
    openGrievances: Grievance[],
    polyUtil: typeof google.maps.geometry.poly | undefined
  ) => {
    if (!route || !polyUtil) return [];

    const routePath = new google.maps.Polyline({
      path: route.overview_path,
    });

    return openGrievances.filter((g) => {
      const grievanceLoc = new google.maps.LatLng(
        g.location.latitude,
        g.location.longitude
      );
      // Use a tolerance for isLocationOnEdge, 1e-3 is roughly 110 meters
      return polyUtil.isLocationOnEdge(grievanceLoc, routePath, 1e-3);
    });
  };

  const findRoute = async () => {
    const originLocation = toLatLngLiteral(origin);
    const destinationLocation = toLatLngLiteral(destination);

    if (!originLocation || !destinationLocation || !directionsService || !geometryLibrary) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select both an origin and a destination, or wait for map to load.",
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

      const openGrievances = allGrievances.filter(
        (g) => g.status !== "Resolved"
      );
      const polyUtil = geometryLibrary.poly;

      const routesWithAnalysis = response.routes.map((route, index) => {
        const issues = countIssuesOnRoute(route, openGrievances, polyUtil);
        return {
          route,
          issues,
          issueCount: issues.length,
          duration: route.legs[0]?.duration?.value || Infinity,
          id: `route-${index}`
        };
      });

      // 1. Identify the single fastest route
      const fastestRouteData = [...routesWithAnalysis].sort(
        (a, b) => a.duration - b.duration
      )[0];
      
      setFastestRoute(fastestRouteData.route);
      setIssuesOnFastest(fastestRouteData.issues);

      // 2. Identify the safest route from the REMAINING alternatives
      const otherRoutes = routesWithAnalysis.filter(r => r.id !== fastestRouteData.id);
      
      let safestRouteData;
      if (otherRoutes.length > 0) {
        safestRouteData = [...otherRoutes].sort((a, b) => {
          if (a.issueCount !== b.issueCount) {
            return a.issueCount - b.issueCount;
          }
          return a.duration - b.duration;
        })[0];
      } else {
        // If there's only one route, it's both the fastest and safest
        safestRouteData = fastestRouteData;
      }

      setSafestRoute(safestRouteData.route);
      setIssuesOnSafest(safestRouteData.issues);

      const issuesAvoided =
        fastestRouteData.issueCount - safestRouteData.issueCount;
        
      if (routePreference === "avoid_issues" && issuesAvoided > 0) {
        toast({
          title: "Safest Route Selected!",
          description: `This route avoids ${issuesAvoided} known issue(s).`,
          variant: "default",
          className: "bg-green-600 border-green-600 text-white",
        });
      } else {
        toast({
          title: "Routes Found",
          description: `Displaying the ${
            routePreference === "fastest" ? "fastest" : "safest"
          } option.`,
        });
      }
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

  const fastestRouteColor = "#3b82f6";
  const safestRouteColor = "#22c55e";

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      <div className="w-full max-w-md flex flex-col border-r border-border">
        <Card className="border-0 border-b rounded-none shadow-none">
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
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fastest" id="fastest" />
                <Label htmlFor="fastest">Fastest (ignore issues)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="avoid_issues"
                  id="avoid_issues"
                />
                <Label htmlFor="avoid_issues">
                  Safest (avoid issues)
                </Label>
              </div>
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

        <ScrollArea className="flex-1">
          {selectedRoute ? (
            <div className="p-4 space-y-4 animate-fade-in">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">
                    Route Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2 p-4 pt-0">
                  <p>
                    <strong>Distance:</strong>{" "}
                    {selectedRoute.legs?.[0]?.distance?.text}
                  </p>
                  <p>
                    <strong>Duration:</strong>{" "}
                    {selectedRoute.legs?.[0]?.duration?.text}
                  </p>
                  <div className="flex items-center gap-2">
                    <strong>Issues on route:</strong>
                    <span
                      className={`font-bold ${
                        issuesOnSelectedRoute.length > 0
                          ? "text-amber-500"
                          : "text-green-500"
                      }`}
                    >
                      {issuesOnSelectedRoute.length}
                    </span>
                    {issuesOnSelectedRoute.length > 0 && (
                      <AlertTriangle className="text-amber-500 h-4 w-4" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <h3 className="text-lg font-semibold mt-4">
                Turn-by-turn Directions
              </h3>
              <div className="space-y-3">
                {selectedRoute.legs?.[0]?.steps?.map(
                  (step, index) => (
                    <div
                      key={index}
                      className="flex gap-4 items-start p-2 rounded-md hover:bg-muted animate-fade-in-up"
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
            route={safestRoute ?? undefined}
            color={safestRouteColor}
            visible={routePreference === 'avoid_issues'}
            zIndex={routePreference === 'avoid_issues' ? 2 : 1}
          />
          <RoutePolyline
            route={fastestRoute ?? undefined}
            color={fastestRouteColor}
            visible={routePreference === 'fastest'}
            zIndex={routePreference === 'fastest' ? 2 : 1}
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
      </div>
    </div>
  );
}
