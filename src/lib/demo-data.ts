
import type { Grievance, UserProfile } from "./types";
import { GeoPoint, Timestamp } from "firebase/firestore";

/**
 * CLUSTERED GEO DISTRIBUTION
 * The 33 districts of Telangana
 */

export const DEMO_CENTERS = [
    { name: "Adilabad", lat: 19.66, lng: 78.53, radiusKm: 15 },
    { name: "Bhadradri Kothagudem", lat: 17.67, lng: 80.88, radiusKm: 20 },
    { name: "Hanumakonda", lat: 18.00, lng: 79.58, radiusKm: 10 },
    { name: "Hyderabad", lat: 17.38, lng: 78.48, radiusKm: 10 },
    { name: "Jagtial", lat: 18.80, lng: 78.92, radiusKm: 15 },
    { name: "Jangaon", lat: 17.72, lng: 79.18, radiusKm: 15 },
    { name: "Jayashankar Bhupalpally", lat: 18.42, lng: 79.87, radiusKm: 20 },
    { name: "Jogulamba Gadwal", lat: 16.23, lng: 77.98, radiusKm: 15 },
    { name: "Kamareddy", lat: 18.32, lng: 78.35, radiusKm: 15 },
    { name: "Karimnagar", lat: 18.43, lng: 79.12, radiusKm: 15 },
    { name: "Khammam", lat: 17.25, lng: 80.15, radiusKm: 15 },
    { name: "Komaram Bheem", lat: 19.35, lng: 79.29, radiusKm: 20 },
    { name: "Mahabubabad", lat: 17.60, lng: 80.00, radiusKm: 15 },
    { name: "Mahbubnagar", lat: 16.74, lng: 77.98, radiusKm: 15 },
    { name: "Mancherial", lat: 18.87, lng: 79.45, radiusKm: 15 },
    { name: "Medak", lat: 18.04, lng: 78.26, radiusKm: 15 },
    { name: "Medchal-Malkajgiri", lat: 17.50, lng: 78.50, radiusKm: 10 },
    { name: "Mulugu", lat: 18.18, lng: 80.10, radiusKm: 20 },
    { name: "Nagarkurnool", lat: 16.48, lng: 78.32, radiusKm: 15 },
    { name: "Nalgonda", lat: 17.05, lng: 79.26, radiusKm: 15 },
    { name: "Narayanpet", lat: 16.75, lng: 77.50, radiusKm: 15 },
    { name: "Nirmal", lat: 19.10, lng: 78.35, radiusKm: 15 },
    { name: "Nizamabad", lat: 18.67, lng: 78.09, radiusKm: 15 },
    { name: "Peddapalli", lat: 18.61, lng: 79.37, radiusKm: 15 },
    { name: "Rajanna Sircilla", lat: 18.38, lng: 78.82, radiusKm: 15 },
    { name: "Ranga Reddy", lat: 17.25, lng: 78.30, radiusKm: 10 },
    { name: "Sangareddy", lat: 17.62, lng: 78.08, radiusKm: 15 },
    { name: "Siddipet", lat: 18.10, lng: 78.85, radiusKm: 15 },
    { name: "Suryapet", lat: 17.15, lng: 79.62, radiusKm: 15 },
    { name: "Vikarabad", lat: 17.33, lng: 77.90, radiusKm: 15 },
    { name: "Wanaparthy", lat: 16.36, lng: 78.06, radiusKm: 15 },
    { name: "Warangal", lat: 17.97, lng: 79.60, radiusKm: 10 },
    { name: "Yadadri Bhuvanagiri", lat: 17.51, lng: 78.88, radiusKm: 15 }
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
  const center = DEMO_CENTERS[Math.floor(Math.random() * DEMO_CENTERS.length)];
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
  "Broken streetlight on the road to the girls' hostel.",
  "Deep pothole right at the main KLH gate, very dangerous.",
];

let initialUsers: Omit<UserProfile, 'grievanceCount'>[] = [
    { id: 'user-demo-3', name: 'Rohan', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=rohan` },
    { id: 'user-demo-1', name: 'Priya', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=priya` },
    { id: 'user-demo-4', name: 'Anika', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=anika` },
    { id: 'user-demo-2', name: 'Vikram', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=vikram` },
    { id: 'user_student_1', name: 'Alex Doe', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=alex` },
    { id: 'user-demo-6', name: 'Sneha', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=sneha` },
    { id: 'user-demo-8', name: 'Arjun', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=arjun` },
    { id: 'user-demo-5', name: 'Neha', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=neha` },
    { id: 'user-demo-7', name: 'Karthik', imageUrl: `https://api.dicebear.com/8x/bottts/svg?seed=karthik` },
    { id: 'user-demo-9', name: 'Ishita', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=ishita` },
    { id: 'user-demo-10', name: 'Rahul', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=rahul` },
    { id: 'user-demo-11', name: 'Divya', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=divya` },
    { id: 'user-demo-12', name: 'Aditya', imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=aditya` },
];


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


const KLH_GATE_CLUSTER: Grievance[] = [
  { id: 'klh-pothole-1', userId: 'user-demo-1', userName: 'Priya', description: 'Another bad pothole near KLH gate. Just saw a scooter almost fall.', location: new GeoPoint(17.3948, 78.3325), imageUrl: 'https://picsum.photos/seed/klh-pothole-1/400/300', status: 'Submitted', createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), riskScore: 85, aiNotes: 'High-risk pothole at a major entry/exit point. High traffic area. Recommend immediate attention.' },
  { id: 'klh-pothole-2', userId: 'user-demo-2', userName: 'Vikram', description: 'This is the third pothole on the road leading to KLH gate.', location: new GeoPoint(17.3950, 78.3320), imageUrl: 'https://picsum.photos/seed/klh-pothole-2/400/300', status: 'Submitted', createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), riskScore: 80, aiNotes: 'Multiple potholes reported in this area, indicating road degradation. The cluster poses a significant risk.' },
  { id: 'klh-pothole-3', userId: 'user-demo-3', userName: 'Rohan', description: 'Huge pothole at the turn towards KLH. Very hard to see at night.', location: new GeoPoint(17.3941, 78.3330), imageUrl: 'https://picsum.photos/seed/klh-pothole-3/400/300', status: 'Submitted', createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), riskScore: 90, aiNotes: 'Critical hazard due to location on a turn and poor visibility. High probability of accidents.' },
  { id: 'klh-streetlight-1', userId: 'user-demo-4', userName: 'Anika', description: 'Streetlight out on the main road to KLH campus.', location: new GeoPoint(17.3955, 78.3315), imageUrl: 'https://picsum.photos/seed/klh-light-1/400/300', status: 'In Progress', createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)), riskScore: 45, aiNotes: 'Increases risk in an area with known road hazards (potholes). Should be fixed to improve night safety.' },
  { id: 'klh-garbage-1', userId: 'user-demo-5', userName: 'Neha', description: 'Garbage dumped on the corner near KLH bus stop.', location: new GeoPoint(17.3935, 78.3340), imageUrl: 'https://picsum.photos/seed/klh-garbage-1/400/300', status: 'Resolved', createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)), riskScore: 30, aiNotes: 'Sanitation issue. Was resolved quickly.' },
  { id: 'klh-water-1', userId: 'user-demo-6', userName: 'Sneha', description: 'Water logging near the sports complex after every small rain.', location: new GeoPoint(17.3960, 78.3350), imageUrl: 'https://picsum.photos/seed/klh-water-1/400/300', status: 'Submitted', createdAt: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)), riskScore: 55, aiNotes: 'Recurring drainage issue, potential health hazard and damages infrastructure.' },
  { id: 'klh-sidewalk-1', userId: 'user-demo-7', userName: 'Karthik', description: 'Sidewalk tiles are broken outside the library, making it hard to walk.', location: new GeoPoint(17.3940, 78.3310), imageUrl: 'https://picsum.photos/seed/klh-sidewalk-1/400/300', status: 'In Progress', createdAt: Timestamp.fromDate(new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)), riskScore: 35, aiNotes: 'Pedestrian safety issue, especially for students rushing to class.' },
];

const GAJULARAMARAM_CLUSTER: Grievance[] = [
    { id: 'gaj-road-1', userId: 'user-demo-8', userName: 'Arjun', description: 'Road near ALEAP Industrial Area damaged by heavy truck movement.', location: new GeoPoint(17.5475, 78.4050), imageUrl: 'https://picsum.photos/seed/gaj-road-1/400/300', status: 'Submitted', createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), riskScore: 70, aiNotes: 'Road degradation from heavy vehicles. High impact on commercial transport. Poses risk to smaller vehicles.' },
    { id: 'gaj-waste-1', userId: 'user-demo-9', userName: 'Ishita', description: 'Illegal dumping of industrial waste in open plot.', location: new GeoPoint(17.5460, 78.4065), imageUrl: 'https://picsum.photos/seed/gaj-waste-1/400/300', status: 'Submitted', createdAt: Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)), riskScore: 80, aiNotes: 'Serious environmental and health hazard. Potential for soil and water contamination. Requires immediate verification.' },
    { id: 'gaj-light-1', userId: 'user-demo-10', userName: 'Rahul', description: 'Poor lighting on the main access road to the industrial area.', location: new GeoPoint(17.5485, 78.4030), imageUrl: 'https://picsum.photos/seed/gaj-light-1/400/300', status: 'In Progress', createdAt: Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)), riskScore: 50, aiNotes: 'Security risk for night-shift workers and transport. Increases vulnerability to theft and accidents.' },
    { id: 'gaj-drain-1', userId: 'user-demo-11', userName: 'Divya', description: 'Clogged drainage channel causing overflow of chemical water.', location: new GeoPoint(17.5455, 78.4045), imageUrl: 'https://picsum.photos/seed/gaj-drain-1/400/300', status: 'Resolved', createdAt: Timestamp.fromDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)), riskScore: 75, aiNotes: 'Contaminated water overflow posed a significant health risk. Issue was escalated and resolved.' },
];


const DEMO_COUNT = 250;

// To create a more realistic distribution, we'll assign grievances to users.
// We'll create a flat list of user IDs to pick from, weighted by how many reports we want them to have.
const userReportCounts: { [key: string]: number } = {
    'user-demo-3': 36, 'user-demo-1': 29, 'user-demo-4': 25, 'user-demo-2': 22,
    'user_student_1': 3, // This will be handled by MY_DEMO_REPORTS
    'user-demo-6': 15, 'user-demo-8': 12, 'user-demo-5': 10, 'user-demo-7': 8,
    'user-demo-9': 5, 'user-demo-10': 3, 'user-demo-11': 2, 'user-demo-12': 1,
};
const weightedUserIds: string[] = [];
Object.entries(userReportCounts).forEach(([userId, count]) => {
    for (let i = 0; i < count; i++) {
        weightedUserIds.push(userId);
    }
});

const OTHER_DEMO_GRIEVANCES: Grievance[] = Array.from(
  { length: DEMO_COUNT - MY_DEMO_REPORTS.length - KLH_GATE_CLUSTER.length - GAJULARAMARAM_CLUSTER.length },
  (_, i) => {
    const randomLocation = getClusterLocation();
    const randomDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
    const status = statuses[i % statuses.length];
    const description = descriptions[i % descriptions.length];
    
    // Pick a user for this grievance
    const userId = weightedUserIds[i % weightedUserIds.length];
    const user = initialUsers.find(u => u.id === userId)!;
    
    const imageSeed = imageSeeds[i % imageSeeds.length];
    const keyword = imageSeeds.find(seed => description.toLowerCase().includes(seed));
    const riskData = keyword && riskFactors[keyword] ? riskFactors[keyword] : riskFactors.default;
    const riskScore = Math.min(100, Math.max(0, riskData.base + Math.floor(Math.random() * 20) - 10));

    return {
        id: `demo-${i + 1}`,
        userId: user.id,
        userName: user.name,
        description,
        location: new GeoPoint(randomLocation.lat, randomLocation.lng),
        imageUrl: `https://picsum.photos/seed/${imageSeed}-${i + 1}/400/300`,
        status,
        createdAt: Timestamp.fromDate(randomDate),
        riskScore: riskScore,
        aiNotes: riskData.note,
    };
  }
);

// Combine all grievances
export const ALL_GRIEVANCES: Grievance[] = [ ...MY_DEMO_REPORTS, ...KLH_GATE_CLUSTER, ...GAJULARAMARAM_CLUSTER, ...OTHER_DEMO_GRIEVANCES ];

// Now, calculate the counts for each user from the single source of truth
const grievanceCounts = ALL_GRIEVANCES.reduce((acc, grievance) => {
    acc[grievance.userId] = (acc[grievance.userId] || 0) + 1;
    return acc;
}, {} as Record<string, number>);

// Create the final DEMO_USERS list with accurate counts
export const DEMO_USERS: UserProfile[] = initialUsers.map(user => ({
    ...user,
    grievanceCount: grievanceCounts[user.id] || 0,
})).sort((a, b) => b.grievanceCount - a.grievanceCount);


// Finally, create the export for the map, which includes pin colors
export const DEMO_GRIEVANCES: (Grievance & { pinColor: string })[] = ALL_GRIEVANCES.map(g => ({
    ...g,
    pinColor: getPinColor(g.status),
}));

    