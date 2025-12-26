import GrievanceMap from "@/components/grievance-map";
import { DEMO_GRIEVANCES } from "@/lib/demo-data";

export default function Home() {
  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <GrievanceMap grievances={DEMO_GRIEVANCES}/>
    </div>
  );
}
