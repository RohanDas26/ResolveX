
import { GeoPoint, Timestamp } from "firebase/firestore";
import { Grievance } from "@/lib/types";

// Note: This is partial data. The seeding function will fill in id, userId, userName.
export const dummyGrievances: Omit<Grievance, 'id' | 'userId' | 'userName'>[] = [
  {
    description: "Large pothole in front of the main gate, causing issues for vehicles entering the campus.",
    location: new GeoPoint(17.3045, 78.5830),
    imageUrl: "https://picsum.photos/seed/pothole1/600/400",
    status: "Submitted",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), // 2 days ago
  },
  {
    description: "Streetlight not working near the boys' hostel. It's been dark for a week.",
    location: new GeoPoint(17.3021, 78.5855),
    imageUrl: "https://picsum.photos/seed/light1/600/400",
    status: "In Progress",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)), // 5 days ago
  },
  {
    description: "Overflowing trash can near the canteen. Needs to be cleaned up urgently.",
    location: new GeoPoint(17.3038, 78.5842),
    imageUrl: "https://picsum.photos/seed/trash1/600/400",
    status: "Submitted",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), // 1 day ago
  },
  {
    description: "Pothole repair on the road to the library has been completed successfully.",
    location: new GeoPoint(17.3050, 78.5819),
    imageUrl: "https://picsum.photos/seed/pothole2/600/400",
    status: "Resolved",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)), // 10 days ago
  },
  {
    description: "Another deep pothole reported at the KLH gate. This is a recurring problem.",
    location: new GeoPoint(17.3046, 78.5831),
    imageUrl: "https://picsum.photos/seed/pothole3/600/400",
    status: "Submitted",
    createdAt: Timestamp.now(),
  },
    {
    description: "Streetlight flickering on the main campus road.",
    location: new GeoPoint(17.3033, 78.5833),
    imageUrl: "https://picsum.photos/seed/light2/600/400",
    status: "Submitted",
    createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), // 3 days ago
  },
];
