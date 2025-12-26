
import type { Grievance } from "./types";
import { GeoPoint, Timestamp } from "firebase/firestore";

// Bounding box for Telangana
const TELANGANA_BOUNDS = {
  lat: { min: 15.8, max: 19.9 },
  lng: { min: 77.2, max: 81.8 },
};

const getRandomLocation = () => {
  const lat =
    Math.random() * (TELANGANA_BOUNDS.lat.max - TELANGANA_BOUNDS.lat.min) +
    TELANGANA_BOUNDS.lat.min;
  const lng =
    Math.random() * (TELANGANA_BOUNDS.lng.max - TELANGANA_BOUNDS.lng.min) +
    TELANGANA_BOUNDS.lng.min;
  return { lat, lng };
};

// More varied problem descriptions
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

// More user names for variety
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

// Optional: different seed prefixes to make images look problem‑relevant
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
      return "#22c55e"; // green-500
    case "In Progress":
      return "#f59e0b"; // amber-500
    case "Submitted":
    default:
      return "#ef4444"; // red-500
  }
};

// idIndex used to spread data over last N days
const generateRandomGrievance = (idIndex: number): Grievance & { pinColor: string } => {
  const randomLocation = getRandomLocation();

  // Spread over last 60 days instead of 30 to look richer
  const randomDate = new Date(
    Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000
  );

  const status = statuses[idIndex % statuses.length];
  const description = descriptions[idIndex % descriptions.length];
  const userName = userNames[idIndex % userNames.length];
  const imageSeed = imageSeeds[idIndex % imageSeeds.length];

  return {
    id: `demo-${idIndex}`,
    userId: `user-demo-${(idIndex % 50) + 1}`, // 50 pseudo users
    userName,
    description,
    location: new GeoPoint(randomLocation.lat, randomLocation.lng),
    imageUrl: `https://picsum.photos/seed/${imageSeed}-${idIndex}/400/300`,
    status,
    createdAt: Timestamp.fromDate(randomDate),
    pinColor: getPinColor(status),
  };
};

// Change this number to 100, 500, 1000, etc.
const DEMO_COUNT = 1000;

export const DEMO_GRIEVANCES: (Grievance & { pinColor: string })[] = Array.from(
  { length: DEMO_COUNT },
  (_, i) => generateRandomGrievance(i + 1)
);
