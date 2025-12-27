
import type { Timestamp, GeoPoint } from "firebase/firestore";

export interface Grievance {
  id: string;
  userId: string;
  userName: string;
  description: string;
  location: GeoPoint;
  imageUrl: string;
  status: "Submitted" | "In Progress" | "Resolved";
  createdAt: Timestamp;
  pinColor?: string;
  // New fields for AI analysis
  riskScore?: number; // A score from 0 to 100
  aiNotes?: string; // AI-generated notes about the grievance
}

export interface UserProfile {
    id?: string; // id is the doc id, so it's not in the doc data
    name: string;
    email?: string;
    imageUrl: string;
    grievanceCount: number;
    isAdmin?: boolean;
}

    