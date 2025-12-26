
import { GeoPoint, Timestamp } from "firebase/firestore";
import type { Grievance, UserProfile } from "@/lib/types";

// Note: This is partial data. The seeding function will fill in id, userId, userName.
export const dummyGrievances: Omit<Grievance, 'id' | 'userId' | 'userName'>[] = [
  {
    description: "Large pothole on the main road near the KLH campus entrance is causing severe traffic disruption.",
    location: new GeoPoint(17.3045, 78.5830),
    imageUrl: "https://picsum.photos/seed/pothole/600/400",
    status: "Submitted",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), // 2 days ago
  },
  {
    description: "Streetlight not working on the road leading to the boys' hostel, creating a safety hazard at night.",
    location: new GeoPoint(17.3021, 78.5855),
    imageUrl: "https://picsum.photos/seed/streetlight/600/400",
    status: "In Progress",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)), // 5 days ago
  },
  {
    description: "Garbage bin overflowing near the student canteen for three days, attracting stray animals.",
    location: new GeoPoint(17.3038, 78.5842),
    imageUrl: "https://picsum.photos/seed/trash/600/400",
    status: "Submitted",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), // 1 day ago
  },
  {
    description: "Pothole repair on the road to the library has been completed.",
    location: new GeoPoint(17.3050, 78.5819),
    imageUrl: "https://picsum.photos/seed/road-work/600/400",
    status: "Resolved",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)), // 10 days ago
  },
  {
    description: "Another deep pothole reported at the back gate of KLH. This is a recurring issue affecting student commuters.",
    location: new GeoPoint(17.3046, 78.5831),
    imageUrl: "https://picsum.photos/seed/another-pothole/600/400",
    status: "Submitted",
    createdAt: Timestamp.now(),
  },
  {
    description: "Broken water pipe on the main road outside campus, leading to significant water wastage.",
    location: new GeoPoint(17.3060, 78.5850),
    imageUrl: "https://picsum.photos/seed/water-pipe/600/400",
    status: "In Progress",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)), // 4 days ago
  },
  {
    description: "Damaged sidewalk pavement near the bus stop, making it difficult for pedestrians.",
    location: new GeoPoint(17.3015, 78.5825),
    imageUrl: "https://picsum.photos/seed/sidewalk-damage/600/400",
    status: "Submitted",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)), // 6 days ago
  },
  {
    description: "Flickering streetlight at the main student intersection needs immediate replacement.",
    location: new GeoPoint(17.3033, 78.5833),
    imageUrl: "https://picsum.photos/seed/flickering-streetlight/600/400",
    status: "Submitted",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), // 3 days ago
  },
  {
    description: "Illegal street vendor encroachment blocking the footpath near the shopping complex.",
    location: new GeoPoint(17.2999, 78.5860),
    imageUrl: "https://picsum.photos/seed/vendor-encroachment/600/400",
    status: "Resolved",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)), // 15 days ago
  },
  {
    description: "Unattended construction debris left on the side of the road for over a week.",
    location: new GeoPoint(17.3072, 78.5801),
    imageUrl: "https://picsum.photos/seed/construction-debris/600/400",
    status: "In Progress",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)), // 8 days ago
  },
];

export const dummyUsers: Omit<UserProfile, 'grievanceCount'>[] = [
    { id: 'user_student_1', name: 'Alex Doe', imageUrl: 'https://api.dicebear.com/8.x/bottts/svg?seed=alex' },
    { id: 'user_student_2', name: 'Jane Smith', imageUrl: 'https://api.dicebear.com/8.x/bottts/svg?seed=jane' },
    { id: 'user_student_3', name: 'Sam Wilson', imageUrl: 'https://api.dicebear.com/8x/bottts/svg?seed=sam' },
    { id: 'user_student_4', name: 'Priya Rao', imageUrl: 'https://api.dicebear.com/8.x/bottts/svg?seed=priya' },
    { id: 'user_student_5', name: 'Chen Wei', imageUrl: 'https://api.dicebear.com/8.x/bottts/svg?seed=chen' },
];
