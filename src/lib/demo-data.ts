
import type { Grievance } from "./types";
import { GeoPoint, Timestamp } from "firebase/firestore";

/**
 * CLUSTERED GEO DISTRIBUTION
 * Multiple city/district centers across Telangana
 */

const CENTERS = [
  {
    name: "Hyderabad",
    lat: 17.385,  // adjust to your campus if you want
    lng: 78.486,
    radiusKm: 15,
  },
  {
    name: "Warangal",
    lat: 17.978,
    lng: 79.594,
    radiusKm: 10,
  },
  {
    name: "Nizamabad",
    lat: 18.672,
    lng: 78.094,
    radiusKm: 8,
  },
  {
    name: "Karimnagar",
    lat: 18.438,
    lng: 79.128,
    radiusKm: 8,
  },
  {
    name: "Khammam",
    lat: 17.247,
    lng: 80.151,
    radiusKm: 8,
  },
  {
    name: "Nalgonda",
    lat: 17.052,
    lng: 79.267,
    radiusKm: 8,
  },
  {
    name: "Mahbubnagar",
    lat: 16.74,
    lng: 77.985,
    radiusKm: 10,
  },
];

const KM_PER_DEG_LAT = 111;

const getRandomLocationInRadius = (
  centerLat: number,
  centerLng: number,
  radiusKm: number
) => {
  const radiusDegLat = radiusKm / KM_PER_DEG_LAT;
  const radiusDegLng =
    radiusKm / (KM_PER_DEG_LAT * Math.cos((centerLat * Math.PI) / 180));

  const u = Math.random();
  const v = Math.random();
  const r = radiusDegLat * Math.sqrt(u);
  const theta = 2 * Math.PI * v;

  const dLat = r * Math.cos(theta);
  const dLng = (radiusDegLng / radiusDegLat) * r * Math.sin(theta);

  return {
    lat: centerLat + dLat,
    lng: centerLng + dLng,
  };
};

// Pick random center & generate point in its radius
const getClusterLocation = () => {
  const center = CENTERS[Math.floor(Math.random() * CENTERS.length)];
  return getRandomLocationInRadius(center.lat, center.lng, center.radiusKm);
};

/**
 * DATA POOLS
 */

const descriptions = [
  "Large pothole in the middle of the road causing traffic.",
  "Streetlight has been out for over a week near the hostel junction.",
  "Garbage bin overflowing, attracting pests and stray animals.",
  "Broken water pipe leading to continuous leakage on the main road.",
  "Cracked sidewalk is a tripping hazard for pedestrians.",
  "Illegal street vendor blocking the pedestrian path near bus stop.",
  "Construction debris left on the side of the road after work.",
  "Fallen tree branch blocking a minor road after last night’s rain.",
  "Missing manhole cover on a busy street, dangerous for bikes.",
  "Frequent power outages in this residential area during evenings.",
  "Uncollected garbage pile near the market creating foul smell.",
  "Drainage overflow during rain causing dirty water on the street.",
  "Traffic signal not working, causing confusion at junction.",
  "Encroachment on footpath forcing people to walk on the road.",
  "Open electric wires hanging low near a shop.",
  "Water stagnation near college gate leading to mosquito breeding.",
  "Improper parking blocking emergency vehicle access.",
  "Damaged speed breaker causing vehicles to lose control.",
  "Public toilet in very unhygienic condition and unusable.",
  "Illegal dumping of construction waste in residential layout.",
];

const userNames = [
  "Priya",
  "Rohan",
  "Anika",
  "Vikram",
  "Sneha",
  "Arjun",
  "Neha",
  "Karthik",
  "Ishita",
  "Rahul",
  "Divya",
  "Aditya",
  "Pooja",
  "Sanjay",
  "Meera",
];

const statuses: Grievance["status"][] = ["Submitted", "In Progress", "Resolved"];

const imageSeeds = [
  "road",
  "streetlight",
  "garbage",
  "water",
  "sidewalk",
  "vendor",
  "debris",
  "tree",
  "manhole",
  "power",
  "drainage",
  "signal",
  "footpath",
  "wires",
  "parking",
];

const getPinColor = (status: Grievance["status"]) => {
  switch (status) {
    case "Resolved":
      return "#22c55e";
    case "In Progress":
      return "#f59e0b";
    case "Submitted":
    default:
      return "#ef4444";
  }
};

const generateRandomGrievance = (
  idIndex: number
): Grievance & { pinColor: string } => {
  const randomLocation = getClusterLocation();

  const randomDate = new Date(
    Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000
  );

  const status = statuses[idIndex % statuses.length];
  const description = descriptions[idIndex % descriptions.length];
  const userName = userNames[idIndex % userNames.length];
  const imageSeed = imageSeeds[idIndex % imageSeeds.length];

  return {
    id: `demo-${idIndex}`,
    userId: `user-demo-${(idIndex % 50) + 1}`,
    userName,
    description,
    location: new GeoPoint(randomLocation.lat, randomLocation.lng),
    imageUrl: `https://picsum.photos/seed/${imageSeed}-${idIndex}/400/300`,
    status,
    createdAt: Timestamp.fromDate(randomDate),
    pinColor: getPinColor(status),
  };
};

const DEMO_COUNT = 250;

export const DEMO_GRIEVANCES: (Grievance & { pinColor: string })[] = Array.from(
  { length: DEMO_COUNT },
  (_, i) => generateRandomGrievance(i + 1)
);
