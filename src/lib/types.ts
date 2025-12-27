
import { Timestamp } from "firebase/firestore";

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Grievance {
  id: string;
  userId: string;
  userName: string;
  description: string;
  location: Location;
  imageUrl: string;
  status: "Submitted" | "In Progress" | "Resolved";
  createdAt: Date | Timestamp;
  pinColor?: string;
  riskScore?: number;
  aiNotes?: string;
}

export interface UserProfile {
    id?: string;
    name: string;
    email?: string;
    imageUrl: string;
    grievanceCount: number;
    isAdmin?: boolean;
}
