
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Upload, ShieldCheck, CheckCircle, Clock, AlertTriangle, Navigation, BarChart2, BrainCircuit, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <Card className="flex flex-col text-center bg-card/50 backdrop-blur-sm transform hover:-translate-y-1 transition-transform duration-300">
    <CardHeader className="flex-row items-center justify-center gap-4 pb-4">
      <div className="text-primary">{icon}</div>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const PinLegendItem = ({ color, icon, label, description }: { color: string, icon: React.ReactNode, label: string, description: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0" style={{ color }}>
            {icon}
        </div>
        <div>
            <h4 className="font-semibold" style={{ color }}>{label}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
)

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16 animate-fade-in-up">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Welcome to ResolveX</h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Your all-in-one platform for reporting, tracking, and resolving civic issues to build a better, more accountable community.
        </p>
      </div>

      <div className="mt-16 space-y-16">
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">How It Works: For Citizens</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            <FeatureCard 
              icon={<Upload className="w-10 h-10" />}
              title="1. Report an Issue"
              description="See a problem like a pothole or broken streetlight? Submit a grievance in seconds with a photo and your precise location."
            />
            <FeatureCard 
              icon={<MapPin className="w-10 h-10" />}
              title="2. Track on the Map"
              description="View all reported issues on a real-time, interactive map. See what's happening in your area and track the status of reports."
            />
            <FeatureCard 
              icon={<Navigation className="w-10 h-10" />}
              title="3. Navigate Safely"
              description="Use the Smart Navigator to get routes that actively avoid reported hazards, ensuring a safer journey."
            />
          </div>
        </section>

        <section>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Understanding the Live Map</h2>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Grievance Status Pins</CardTitle>
                    <CardDescription>Each pin on the map represents a reported issue, color-coded by its current status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <PinLegendItem 
                        color="hsl(var(--destructive))"
                        icon={<AlertTriangle className="h-8 w-8" />}
                        label="Submitted"
                        description="A new grievance that has just been reported by a user and is awaiting review by an administrator."
                    />
                    <PinLegendItem 
                        color="#f59e0b" // amber-500
                        icon={<Clock className="h-8 w-8" />}
                        label="In Progress"
                        description="The report has been acknowledged by an admin and a team may be working on a resolution."
                    />
                    <PinLegendItem 
                        color="#22c55e" // green-500
                        icon={<CheckCircle className="h-8 w-8" />}
                        label="Resolved"
                        description="The issue has been successfully fixed and the report is now closed."
                    />
                </CardContent>
            </Card>
        </section>

        <section>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">The Smart Navigator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                 <div className="space-y-6">
                     <FeatureCard 
                        icon={<Zap className="w-8 h-8"/>}
                        title="Fastest vs. Safest Routes"
                        description="Choose between the quickest route or the 'Safest' route, which intelligently re-routes you around areas with a high concentration of unresolved, high-risk grievances like potholes or debris."
                    />
                    <FeatureCard 
                        icon={<ArrowRight className="w-8 h-8"/>}
                        title="Turn-by-Turn Directions"
                        description="Once you've selected your route, the navigator provides clear, step-by-step instructions in a movable, resizable panel, allowing you to focus on the road."
                    />
                </div>
                 <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Why is it Better?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="font-semibold text-primary">ResolveX is the only navigation tool that integrates real-time civic hazard data.</p>
                        <p className="text-muted-foreground">Other mapping apps might show you traffic, but they won't warn you about a dangerous reported pothole or a fallen tree branch on your route. Our Smart Navigator is designed not just for speed, but for safety and awareness of your community's actual road conditions.</p>
                    </CardContent>
                </Card>
            </div>
        </section>
        
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">For Administrators: The Command Center</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            <FeatureCard 
              icon={<MapPin className="w-10 h-10" />}
              title="Live Map & Heatmap"
              description="Get a bird's-eye view of all grievances. A risk-based heatmap instantly reveals problem hotspots requiring immediate attention."
            />
            <FeatureCard 
              icon={<BarChart2 className="w-10 h-10" />}
              title="Advanced Analytics"
              description="Dive deep into trends. Analyze grievance reports by status, category, and submission dates to understand systemic issues."
            />
            <FeatureCard 
              icon={<BrainCircuit className="w-10 h-10" />}
              title="AI Impact Simulator"
              description="Forecast the impact of resolving issues. The simulator predicts how fixing grievances in an area will reduce future complaints and overall risk."
            />
          </div>
        </section>

      </div>

      <div className="mt-16 text-center">
        <Button size="lg" className="font-semibold text-base sm:text-lg" onClick={() => router.push('/map')}>
            Explore the Live Map <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
