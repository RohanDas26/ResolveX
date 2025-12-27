
import type { Grievance, UserProfile } from "./types";
import { GeoPoint, Timestamp } from "firebase/firestore";

/**
 * CLUSTERED GEO DISTRIBUTION
 * Multiple city/district centers across Telangana
 */
export const DEMO_CENTERS = [
  { name: 'Adilabad', lat: 19.663, lng: 78.53, radiusKm: 10 },
  { name: 'Bhadradri Kothagudem', lat: 17.65, lng: 80.88, radiusKm: 15 },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867, radiusKm: 20 },
  { name: 'Jagtial', lat: 18.79, lng: 78.92, radiusKm: 8 },
  { name: 'Jangaon', lat: 17.72, lng: 79.18, radiusKm: 8 },
  { name: 'Jayashankar Bhupalpally', lat: 18.4, lng: 79.87, radiusKm: 12 },
  { name: 'Jogulamba Gadwal', lat: 16.23, lng: 77.98, radiusKm: 10 },
  { name: 'Kamareddy', lat: 18.32, lng: 78.35, radiusKm: 8 },
  { name: 'Karimnagar', lat: 18.4386, lng: 79.1288, radiusKm: 10 },
  { name: 'Khammam', lat: 17.2473, lng: 80.1514, radiusKm: 12 },
  { name: 'Komaram Bheem', lat: 19.35, lng: 79.47, radiusKm: 10 },
  { name: 'Mahabubabad', lat: 17.6, lng: 80.0, radiusKm: 8 },
  { name: 'Mahbubnagar', lat: 16.7363, lng: 77.9897, radiusKm: 10 },
  { name: 'Mancherial', lat: 18.87, lng: 79.45, radiusKm: 8 },
  { name: 'Medak', lat: 18.04, lng: 78.26, radiusKm: 8 },
  { name: 'Medchal–Malkajgiri', lat: 17.55, lng: 78.55, radiusKm: 15 },
  { name: 'Mulugu', lat: 18.18, lng: 80.1, radiusKm: 10 },
  { name: 'Nagarkurnool', lat: 16.48, lng: 78.32, radiusKm: 10 },
  { name: 'Nalgonda', lat: 17.052, lng: 79.267, radiusKm: 12 },
  { name: 'Narayanpet', lat: 16.74, lng: 77.5, radiusKm: 8 },
  { name: 'Nirmal', lat: 19.1, lng: 78.35, radiusKm: 8 },
  { name: 'Nizamabad', lat: 18.672, lng: 78.094, radiusKm: 10 },
  { name: 'Peddapalli', lat: 18.61, lng: 79.37, radiusKm: 8 },
  { name: 'Rajanna Sircilla', lat: 18.38, lng: 78.83, radiusKm: 8 },
  { name: 'Ranga Reddy', lat: 17.25, lng: 78.3, radiusKm: 15 },
  { name: 'Sangareddy', lat: 17.62, lng: 78.08, radiusKm: 10 },
  { name: 'Siddipet', lat: 18.1, lng: 78.85, radiusKm: 10 },
  { name: 'Suryapet', lat: 17.14, lng: 79.62, radiusKm: 10 },
  { name: 'Vikarabad', lat: 17.33, lng: 77.9, radiusKm: 10 },
  { name: 'Wanaparthy', lat: 16.36, lng: 78.06, radiusKm: 8 },
  { name: 'Warangal', lat: 17.978, lng: 79.594, radiusKm: 12 },
  { name: 'Hanamkonda', lat: 18.01, lng: 79.58, radiusKm: 10 },
  { name: 'Yadadri Bhuvanagiri', lat: 17.58, lng: 78.95, radiusKm: 10 },
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

const getClusterLocation = () => {
  const center = DEMO_CENTERS[Math.floor(Math.random() * DEMO_CENTERS.length)];
  return getRandomLocationInRadius(center.lat, center.lng, center.radiusKm);
};

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
  "Priya", "Rohan", "Anika", "Vikram", "Sneha", "Arjun", "Neha",
  "Karthik", "Ishita", "Rahul", "Divya", "Aditya", "Pooja", "Sanjay", "Meera",
  "Aarav", "Dia", "Kabir", "Zara", "Ravi", "Sonia", "Amit", "Riya", "Jay", "Kavya"
];

const statuses: Grievance["status"][] = ["Submitted", "In Progress", "Resolved"];

const imageSeeds = [
  "road", "streetlight", "garbage", "water", "sidewalk", "vendor",
  "debris", "tree", "manhole", "power", "drainage", "signal",
  "footpath", "wires", "parking",
];

const getPinColor = (status: Grievance["status"]) => {
  switch (status) {
    case "Resolved": return "#22c55e";
    case "In Progress": return "#f59e0b";
    case "Submitted": default: return "#ef4444";
  }
};


const generateRandomGrievance = (idIndex: number): Grievance & { pinColor: string } => {
  const randomLocation = getClusterLocation();
  const randomDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
  const status = statuses[idIndex % statuses.length];
  const description = descriptions[idIndex % descriptions.length];
  const userId = `user-demo-${(idIndex % userNames.length) + 1}`;
  const userName = userNames[idIndex % userNames.length];
  const imageSeed = imageSeeds[idIndex % imageSeeds.length];

  return {
    id: `demo-${idIndex}`,
    userId,
    userName,
    description,
    location: new GeoPoint(randomLocation.lat, randomLocation.lng),
    imageUrl: `https://picsum.photos/seed/${imageSeed}-${idIndex}/400/300`,
    status,
    createdAt: Timestamp.fromDate(randomDate),
    pinColor: getPinColor(status),
    riskScore: Math.floor(Math.random() * 80) + 10,
    aiNotes: "This is a sample AI-generated note for a demo grievance. Analysis would provide more details."
  };
};

export const DEMO_GRIEVANCES: (Grievance & { pinColor: string })[] = Array.from(
  { length: 250 },
  (_, i) => generateRandomGrievance(i + 1)
);


const grievancesByUser = DEMO_GRIEVANCES.reduce((acc, grievance) => {
    acc[grievance.userId] = (acc[grievance.userId] || 0) + 1;
    return acc;
}, {} as Record<string, number>);

export const DEMO_USERS: UserProfile[] = Object.keys(grievancesByUser).map(userId => {
    const grievance = DEMO_GRIEVANCES.find(g => g.userId === userId)!;
    return {
        id: userId,
        name: grievance.userName,
        email: `${grievance.userName.toLowerCase().replace(' ', '')}@example.com`,
        imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=${userId}`,
        grievanceCount: grievancesByUser[userId],
    };
});

    