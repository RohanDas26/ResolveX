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
}
