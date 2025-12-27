
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Upload, BarChart2 } from "lucide-react";
import { Icons } from "@/components/icons";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="relative p-6 overflow-hidden text-center bg-card/50 rounded-lg">
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);


export default function HomePage() {
  const router = useRouter();

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] overflow-hidden p-4 sm:p-6 md:p-8" >
      <div className="z-10 text-center animate-fade-in-up w-full max-w-5xl mx-auto">
          <Icons.logo className="h-16 w-16 md:h-20 md:w-20 text-primary mx-auto mb-6" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Welcome to ResolveX</h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Your platform for reporting and tracking local civic issues. See a problem? Report it and help build a better community.
          </p>
          <div className="mt-10 sm:mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            <FeatureCard 
              icon={<Upload className="w-8 h-8 md:w-10 md:h-10" />}
              title="Effortless Reporting"
              description="Quickly submit a grievance with a photo and your precise location in just a few taps."
            />
            <FeatureCard 
              icon={<MapPin className="w-8 h-8 md:w-10 md:h-10" />}
              title="Live Map Tracking"
              description="View all reported issues on a real-time, interactive map of your area to stay informed."
            />
            <FeatureCard 
              icon={<BarChart2 className="w-8 h-8 md:w-10 md:h-10" />}
              title="Community-Driven Change"
              description="See leaderboards, track resolution progress, and be a part of making your community better."
            />
          </div>
           <div className="mt-10 sm:mt-12 space-x-4">
             <Button size="lg" className="font-semibold text-base sm:text-lg" onClick={() => router.push('/map')}>
                Go to Map <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="font-semibold text-base sm:text-lg" onClick={() => router.push('/auth')}>
                Get Started
            </Button>
          </div>
      </div>
    </div>
  );
}
