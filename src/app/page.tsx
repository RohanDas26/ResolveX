import AuthGuard from "@/components/auth-guard";
import GrievanceMap from "@/components/grievance-map";

export default function Home() {
  return (
    <AuthGuard>
      <div className="relative h-[calc(100vh-3.5rem)] w-full">
        <GrievanceMap />
      </div>
    </AuthGuard>
  );
}
