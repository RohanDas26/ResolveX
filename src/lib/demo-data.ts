
import type { Grievance, UserProfile } from "./types";
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

export const DEMO_USERS: UserProfile[] = [
    { id: 'user-demo-3', name: 'Rohan', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=rohan`, grievanceCount: 36 },
    { id: 'user-demo-1', name: 'Priya', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=priya`, grievanceCount: 29 },
    { id: 'user-demo-4', name: 'Anika', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=anika`, grievanceCount: 25 },
    { id: 'user-demo-2', name: 'Vikram', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=vikram`, grievanceCount: 22 },
    { id: 'user_student_1', name: 'Alex Doe', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=alex`, grievanceCount: 18 },
    { id: 'user-demo-6', name: 'Sneha', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=sneha`, grievanceCount: 15 },
    { id: 'user-demo-8', name: 'Arjun', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=arjun`, grievanceCount: 12 },
    { id: 'user-demo-5', name: 'Neha', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=neha`, grievanceCount: 10 },
    { id: 'user-demo-7', name: 'Karthik', imageUrl: `https://api.dicebear.com/8x/bottts/svg?seed=karthik`, grievanceCount: 8 },
    { id: 'user-demo-9', name: 'Ishita', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=ishita`, grievanceCount: 5 },
    { id: 'user-demo-10', name: 'Rahul', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=rahul`, grievanceCount: 3 },
    { id: 'user-demo-11', name: 'Divya', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=divya`, grievanceCount: 2 },
    { id: 'user-demo-12', name: 'Aditya', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=aditya`, grievanceCount: 1 },
];


const userNames = DEMO_USERS.map(u => u.name);

const statuses: Grievance["status"][] = ["Submitted", "In Progress", "Resolved"];

const imageSeeds = [
  "road", "streetlight", "garbage", "water", "sidewalk", "vendor",
  "debris", "tree", "manhole", "power", "drainage", "signal",
  "footpath", "wires", "parking",
];

const riskFactors: { [key: string]: { base: number, note: string } } = {
    pothole: { base: 40, note: "Potential for traffic disruption and vehicle damage. High traffic areas increase risk." },
    streetlight: { base: 25, note: "Low visibility at night can lead to accidents or crime. Risk is higher in residential areas." },
    garbage: { base: 50, note: "Sanitation hazard, can lead to disease vectors. Proximity to homes or markets increases severity." },
    water: { base: 65, note: "Water wastage and potential for road damage. Can escalate to a major supply issue." },
    sidewalk: { base: 30, note: "Direct safety hazard for pedestrians, especially elderly or disabled individuals." },
    vendor: { base: 20, note: "Can cause pedestrian congestion, but typically a low-severity issue unless blocking emergency access." },
    debris: { base: 35, note: "Can be a traffic hazard and is an environmental issue." },
    tree: { base: 45, note: "Can block traffic completely. If near power lines, risk increases significantly." },
    manhole: { base: 90, note: "Critical safety hazard. High risk of serious injury to pedestrians, cyclists, and bikers. Immediate action required." },
    power: { base: 75, note: "Exposed wires pose an electrocution risk. High priority, especially in wet conditions." },
    drainage: { base: 55, note: "Public health risk due to stagnant, contaminated water." },
    signal: { base: 70, note: "High risk of major traffic accidents at intersections." },
    parking: { base: 25, note: "Can obstruct traffic or emergency services. Severity depends on the location." },
    default: { base: 20, note: "Initial assessment indicates low risk, but requires manual review for confirmation." }
};

// Create a weighted list of users to make some report more than others
const createWeightedUserList = () => {
    const weightedList: number[] = [];
    DEMO_USERS.forEach((user, index) => {
        // Use the pre-defined grievanceCount to create the weighted list
        for(let i = 0; i < user.grievanceCount; i++) {
            weightedList.push(index);
        }
    });
    return weightedList;
}
const weightedUserIndexes = createWeightedUserList();

const getPinColor = (status: Grievance["status"]) => {
  switch (status) {
    case "Resolved": return "#22c55e";
    case "In Progress": return "#f59e0b";
    case "Submitted":
    default: return "#ef4444";
  }
};

const MY_DEMO_REPORTS: Grievance[] = [
    { id: 'demo-901', userId: 'user_student_1', userName: 'Alex Doe', description: 'Broken swings in the main park, unsafe for kids.', location: new GeoPoint(17.44, 78.34), imageUrl: 'https://picsum.photos/seed/park-swing/400/300', status: 'Submitted' as const, createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), riskScore: 60, aiNotes: 'Potential injury hazard for children. Moderate priority.'},
    { id: 'demo-902', userId: 'user_student_1', userName: 'Alex Doe', description: 'Streetlight flickering constantly on College Ave.', location: new GeoPoint(17.42, 78.48), imageUrl: 'https://picsum.photos/seed/flicker-light/400/300', status: 'In Progress' as const, createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)), riskScore: 35, aiNotes: 'Causes visibility issues, potential traffic hazard at night.' },
    { id: 'demo-903', userId: 'user_student_1', userName: 'Alex Doe', description: 'Overflowing drain near the bus stop.', location: new GeoPoint(17.39, 78.47), imageUrl: 'https://picsum.photos/seed/drain-overflow/400/300', status: 'Submitted' as const, createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), riskScore: 70, aiNotes: 'Public health concern due to stagnant water and smell.' },
];


const generateRandomGrievance = (
  idIndex: number
): Grievance & { pinColor: string } => {
  const randomLocation = getClusterLocation();

  const randomDate = new Date(
    Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000
  );

  const status = statuses[idIndex % statuses.length];
  const description = descriptions[idIndex % descriptions.length];
  
  // Select a user based on the weighted list for more realistic counts
  const userIndex = weightedUserIndexes[idIndex % weightedUserIndexes.length];
  const user = DEMO_USERS[userIndex];
  
  const imageSeed = imageSeeds[idIndex % imageSeeds.length];

  const keyword = imageSeeds.find(seed => description.toLowerCase().includes(seed));
  const riskData = keyword && riskFactors[keyword] ? riskFactors[keyword] : riskFactors.default;
  const riskScore = Math.min(100, Math.max(0, riskData.base + Math.floor(Math.random() * 20) - 10));

  return {
    id: `demo-${idIndex}`,
    userId: user.id,
    userName: user.name,
    description,
    location: new GeoPoint(randomLocation.lat, randomLocation.lng),
    imageUrl: `https://picsum.photos/seed/${imageSeed}-${idIndex}/400/300`,
    status,
    createdAt: Timestamp.fromDate(randomDate),
    pinColor: getPinColor(status),
    riskScore: riskScore,
    aiNotes: riskData.note,
  };
};

const DEMO_COUNT = 250;

const OTHER_DEMO_GRIEVANCES: (Grievance & { pinColor: string })[] = Array.from(
  { length: DEMO_COUNT - MY_DEMO_REPORTS.length },
  (_, i) => generateRandomGrievance(i + 1)
);

export const DEMO_GRIEVANCES: (Grievance & { pinColor: string })[] = [
    ...MY_DEMO_REPORTS.map(r => ({...r, pinColor: getPinColor(r.status)})),
    ...OTHER_DEMO_GRIEVANCES
];
