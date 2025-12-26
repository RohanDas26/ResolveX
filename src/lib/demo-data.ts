import type { Grievance } from "./types";
import { GeoPoint, Timestamp } from "firebase/firestore";

// Bounding box for Telangana
const TELANGANA_BOUNDS = {
  lat: { min: 15.8, max: 19.9 },
  lng: { min: 77.2, max: 81.8 },
};

const getRandomLocation = () => {
    const lat = Math.random() * (TELANGANA_BOUNDS.lat.max - TELANGANA_BOUNDS.lat.min) + TELANGANA_BOUNDS.lat.min;
    const lng = Math.random() * (TELANGANA_BOUNDS.lng.max - TELANGANA_BOUNDS.lng.min) + TELANGANA_BOUNDS.lng.min;
    return { lat, lng };
}

const descriptions = [
    "Large pothole in the middle of the road causing traffic.",
    "Streetlight has been out for over a week.",
    "Garbage bin overflowing, attracting pests.",
    "Broken water pipe leading to a large puddle.",
    "Cracked sidewalk is a tripping hazard.",
    "Illegal street vendor blocking pedestrian path.",
    "Construction debris left on the side of the road.",
    "Fallen tree branch blocking a minor road.",
    "Missing manhole cover on a busy street.",
    "Frequent power outages in this area."
];

const userNames = ["Priya", "Rohan", "Anika", "Vikram", "Sneha"];

const statuses: Grievance['status'][] = ["Submitted", "In Progress", "Resolved"];

const generateRandomGrievance = (id: number): Grievance => {
    const randomLocation = getRandomLocation();
    const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // within last 30 days
    
    const getPinColor = (status: Grievance['status']) => {
        switch(status) {
            case 'Resolved': return '#22c55e'; // green-500
            case 'In Progress': return '#f59e0b'; // amber-500
            case 'Submitted': 
            default:
                return '#ef4444'; // red-500
        }
    };
    const status = statuses[id % statuses.length];

    return {
        id: `demo-${id}`,
        userId: `user-demo-${id}`,
        userName: userNames[id % userNames.length],
        description: descriptions[id % descriptions.length],
        location: new GeoPoint(randomLocation.lat, randomLocation.lng),
        imageUrl: `https://picsum.photos/seed/${id}/400/300`,
        status: status,
        createdAt: Timestamp.fromDate(randomDate),
        pinColor: getPinColor(status)
    }
};

export const DEMO_GRIEVANCES: (Grievance & { pinColor: string })[] = Array.from({ length: 50 }, (_, i) => generateRandomGrievance(i + 1));
