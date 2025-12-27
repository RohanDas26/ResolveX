
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Upload, BarChart2, ShieldCheck, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <Card className="flex flex-col text-center bg-card/50">
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
    <div className="container mx-auto px-4 py-8 sm:py-12 animate-fade-in-up">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Welcome to ResolveX</h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Your all-in-one platform for reporting, tracking, and resolving civic issues to build a better, more accountable community.
        </p>
      </div>

      <div className="mt-12 space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
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
              icon={<ShieldCheck className="w-10 h-10" />}
              title="3. Drive Resolution"
              description="Admins use the dashboard to analyze trends, assess risk, and efficiently dispatch teams to resolve problems."
            />
          </div>
        </section>

        <section>
            <h2 className="text-2xl font-bold text-center mb-8">Understanding the Map</h2>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Grievance Status Pins</CardTitle>
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

      </div>

      <div className="mt-16 text-center">
        <Button size="lg" className="font-semibold text-base sm:text-lg" onClick={() => router.push('/map')}>
            Explore the Live Map <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
