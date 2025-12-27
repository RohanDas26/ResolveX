
"use client";

import { useMemo, useState, useEffect } from "react";
import type { Grievance } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format, subDays } from "date-fns";
import { Loader2, Zap, BrainCircuit, SlidersHorizontal, ArrowRight, Lightbulb, AlertTriangle, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { DEMO_CENTERS, DEMO_GRIEVANCES } from "@/lib/demo-data";
import { Label } from "@/components/ui/label";
import { differenceInDays } from "date-fns";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

const grievanceCategories = ["pothole", "streetlight", "garbage", "water", "sidewalk", "vendor", "debris"];

function categorizeGrievance(description: string): string {
    const desc = description.toLowerCase();
    for (const category of grievanceCategories) {
        if (desc.includes(category)) {
            return category.charAt(0).toUpperCase() + category.slice(1);
        }
    }
    return "Other";
}

function AIInsights({ grievances }: { grievances: Grievance[] | null }) {
    const insights = useMemo(() => {
        if (!grievances || grievances.length === 0) {
            return { topCategory: null, emergingHotspot: null, resolutionTime: null, strategicRecommendation: null };
        }
        
        const openGrievances = grievances.filter(g => g.status !== 'Resolved');

        // Insight 1: Top Issue
        const categoryMap: { [key: string]: number } = {};
        openGrievances.forEach(g => {
            const category = categorizeGrievance(g.description);
            categoryMap[category] = (categoryMap[category] || 0) + 1;
        });
        const topCategory = Object.keys(categoryMap).length > 0
            ? Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]
            : null;

        // Insight 2: Emerging Hotspot
        const recentGrievances = grievances.filter(g => {
            const grievanceDate = g.createdAt.toDate();
            const sevenDaysAgo = subDays(new Date(), 7);
            return grievanceDate > sevenDaysAgo;
        });

        const hotspotCenter = DEMO_CENTERS.find(c => c.name === "Gajularamaram Industrial Area");
        let emergingHotspot = null;
        if (hotspotCenter) {
            const { lat, lng, radiusKm } = hotspotCenter;
            const radiusDeg = radiusKm / 111.32;
            const recentHotspotGrievances = recentGrievances.filter(g => 
                Math.sqrt(Math.pow(g.location.latitude - lat, 2) + Math.pow(g.location.longitude - lng, 2)) < radiusDeg
            ).length;
            if (recentHotspotGrievances > 3) { // Threshold for being a "hotspot"
                emergingHotspot = hotspotCenter.name;
            }
        }
        
        // Insight 3: Resolution Time
        const submittedGrievances = grievances.filter(g => g.status === 'Submitted');
        let resolutionTime: number | null = null;
        if (submittedGrievances.length > 0) {
            const totalDays = submittedGrievances.reduce((acc, g) => {
                return acc + differenceInDays(new Date(), g.createdAt.toDate());
            }, 0);
            resolutionTime = Math.round(totalDays / submittedGrievances.length);
        }

        // Insight 4: Strategic Recommendation
        let strategicRecommendation = null;
        if (topCategory) {
            const topCategoryName = topCategory[0];
            const topCategoryGrievances = openGrievances.filter(g => categorizeGrievance(g.description) === topCategoryName);

            const areaCounts: { [key: string]: number } = {};
            topCategoryGrievances.forEach(g => {
                for (const center of DEMO_CENTERS) {
                    const { lat, lng, radiusKm } = center;
                    const radiusDeg = radiusKm / 111.32;
                    if (Math.sqrt(Math.pow(g.location.latitude - lat, 2) + Math.pow(g.location.longitude - lng, 2)) < radiusDeg) {
                        areaCounts[center.name] = (areaCounts[center.name] || 0) + 1;
                        break; // Count each grievance only once
                    }
                }
            });

            if (Object.keys(areaCounts).length > 0) {
                const recommendationArea = Object.entries(areaCounts).sort((a,b) => b[1] - a[1])[0][0];
                strategicRecommendation = {
                    category: topCategoryName,
                    area: recommendationArea,
                };
            }
        }
        
        return { topCategory, emergingHotspot, resolutionTime, strategicRecommendation };

    }, [grievances]);

    if (!grievances) {
       return (
        <Card className="animate-fade-in-up flex items-center justify-center min-h-[400px]" style={{ animationDelay: '300ms' }}>
            <Loader2 className="h-8 w-8 animate-spin" />
        </Card>
       );
    }

    return (
        <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg"><Zap className="mr-2 h-5 w-5 text-primary" /> Gemini on BigQuery</CardTitle>
                <CardDescription>Automatic analysis of real-time grievance trends.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {insights.topCategory ? (
                    <div className="flex items-start gap-3">
                         <div className="p-2 bg-primary/10 rounded-full"><Lightbulb className="h-5 w-5 text-primary" /></div>
                        <div>
                            <h4 className="font-semibold text-sm sm:text-base">Top Issue</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Open <span className="font-bold">{insights.topCategory[0]}</span> reports are the most frequent, requiring immediate attention.</p>
                        </div>
                    </div>
                ) : <p className="text-sm text-muted-foreground">Not enough data for trend analysis.</p>}

                {insights.emergingHotspot ? (
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-full"><AlertTriangle className="h-5 w-5 text-amber-500" /></div>
                        <div>
                            <h4 className="font-semibold text-sm sm:text-base">Emerging Hotspot</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">A spike in reports has been detected in the <span className="font-bold text-amber-500">{insights.emergingHotspot}</span> area this week.</p>
                        </div>
                    </div>
                ) : <p className="text-sm text-muted-foreground">No new hotspots detected this week.</p>}
                
                {insights.resolutionTime !== null ? (
                    <div className="flex items-start gap-3">
                         <div className="p-2 bg-green-500/10 rounded-full"><Clock className="h-5 w-5 text-green-500" /></div>
                        <div>
                            <h4 className="font-semibold text-sm sm:text-base">Avg. Time Open</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">New grievances remain open for an average of <span className="font-bold text-green-500">{insights.resolutionTime} days</span> before being resolved.</p>
                        </div>
                    </div>
                ) : <p className="text-sm text-muted-foreground">No open grievances to analyze.</p>}

                {insights.strategicRecommendation && (
                     <div className="flex items-start gap-3">
                         <div className="p-2 bg-indigo-500/10 rounded-full"><ShieldCheck className="h-5 w-5 text-indigo-500" /></div>
                        <div>
                            <h4 className="font-semibold text-sm sm:text-base">Strategic Recommendation</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Deploy a <span className="font-bold text-indigo-400">{insights.strategicRecommendation.category}</span> repair team to the <span className="font-bold text-indigo-400">{insights.strategicRecommendation.area}</span> area to address the highest concentration of open issues.</p>
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    );
}

function ImpactSimulator({ grievances }: { grievances: Grievance[] | null }) {
    const [selectedArea, setSelectedArea] = useState<string>(DEMO_CENTERS[0].name);
    const [issuesToResolve, setIssuesToResolve] = useState(15);
    const [simulationData, setSimulationData] = useState<any>(null);

    useEffect(() => {
        if (!grievances) return;

        // 1. Find the selected area's geographical data
        const center = DEMO_CENTERS.find(c => c.name === selectedArea);
        if (!center) return;

        // 2. Filter grievances for the selected area
        const { lat, lng, radiusKm } = center;
        const radiusDeg = radiusKm / 111.32;
        const areaGrievances = grievances.filter(g => 
            Math.sqrt(Math.pow(g.location.latitude - lat, 2) + Math.pow(g.location.longitude - lng, 2)) < radiusDeg
        );
        
        // --- Start of User-Provided Logic ---

        // 1. Inputs / state derived
        const openIssues = areaGrievances.filter(g => g.status !== "Resolved");
        const openCount = openIssues.length;
        const avgRisk = openIssues.reduce((s, g) => s + (g.riskScore ?? 50), 0) / (openCount || 1);
        
        // Using total complaints in last 30 days as a proxy for avgMonthlyComplaints
        const avgMonthlyComplaints = areaGrievances.filter(g => {
            const grievanceDate = g.createdAt.toDate();
            const thirtyDaysAgo = subDays(new Date(), 30);
            return grievanceDate > thirtyDaysAgo;
        }).length || openCount * 1.2; // Fallback based on user's suggestion


        // 2. Projection formulas
        const toResolve = Math.min(issuesToResolve, openCount);
        const resolvedFraction = openCount === 0 ? 0 : toResolve / openCount;
        
        // Projected metrics
        const projectedRisk = openCount === 0
            ? 0
            : Math.max(avgRisk * (1 - resolvedFraction), avgRisk * 0.2);
        
        const projectedOpenCount = openCount - toResolve;
        
        const projectedComplaintsNext30 = Math.round(
          avgMonthlyComplaints * (1 - resolvedFraction * 0.5)
        );
        
        // Percentage changes
        const riskDropPct = openCount === 0 || avgRisk === 0 ? 0 : Math.round((1 - projectedRisk / avgRisk) * 100);
        const complaintsDropPct = avgMonthlyComplaints === 0 ? 0 : Math.round(
          (1 - projectedComplaintsNext30 / avgMonthlyComplaints) * 100
        );

        // --- End of User-Provided Logic ---

        // 8. Update state
        setSimulationData({
            avgRisk: Math.round(avgRisk),
            openCount,
            avgMonthlyComplaints,
            projectedRisk: Math.round(projectedRisk),
            projectedOpenCount,
            projectedComplaintsNext30,
            riskDropPct,
            complaintsDropPct,
            toResolve
        });

    }, [selectedArea, issuesToResolve, grievances]);

    if (!simulationData) return (
        <Card className="animate-fade-in-up flex items-center justify-center min-h-[400px]" style={{ animationDelay: '400ms' }}>
            <Loader2 className="h-8 w-8 animate-spin" />
        </Card>
    );

    const { avgRisk, openCount, avgMonthlyComplaints, projectedRisk, projectedOpenCount, projectedComplaintsNext30, riskDropPct, complaintsDropPct, toResolve } = simulationData;

    const chartData = [
        { name: 'Risk', Before: avgRisk, After: projectedRisk }
    ];

    return (
        <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg"><BrainCircuit className="mr-2 h-5 w-5 text-primary" /> Impact Simulator</CardTitle>
                <CardDescription>Forecast how resolving issues reduces risk and future complaints.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <Select value={selectedArea} onValueChange={setSelectedArea}>
                        <SelectTrigger><SelectValue placeholder="Select an area" /></SelectTrigger>
                        <SelectContent>
                            {DEMO_CENTERS.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <div className="space-y-2">
                        <Label>Number of open issues to resolve: {issuesToResolve}</Label>
                        <Slider
                            value={[issuesToResolve]}
                            onValueChange={(val) => setIssuesToResolve(val[0])}
                            max={Math.max(1, openCount)}
                            step={1}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <p className="text-xs text-muted-foreground">Avg Risk</p>
                        <p className="text-lg font-bold flex items-center justify-center gap-1">{avgRisk} <ArrowRight className="h-4 w-4" /> <span className="text-green-400">{projectedRisk}</span></p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Open Issues</p>
                        <p className="text-lg font-bold flex items-center justify-center gap-1">{openCount} <ArrowRight className="h-4 w-4" /> <span className="text-green-400">{projectedOpenCount}</span></p>
                    </div>
                     <div>
                        <p className="text-xs text-muted-foreground">Next 30d Reports</p>
                        <p className="text-lg font-bold flex items-center justify-center gap-1">{avgMonthlyComplaints} <ArrowRight className="h-4 w-4" /> <span className="text-green-400">{projectedComplaintsNext30}</span></p>
                    </div>
                </div>

                <div className="h-20 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" hide />
                            <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                            <Bar dataKey="Before" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 4, 4]} />
                            <Bar dataKey="After" fill="hsl(var(--primary))" radius={[4, 4, 4, 4]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                 <p className="text-sm text-muted-foreground text-center bg-secondary/30 p-3 rounded-md">
                    Resolving <span className="font-bold text-primary">{toResolve}</span> issues around <span className="font-bold text-primary">{selectedArea}</span> is projected to reduce local risk by <span className="font-bold text-green-400">{riskDropPct}%</span> and future complaints by <span className="font-bold text-green-400">{complaintsDropPct}%</span>.
                </p>

            </CardContent>
        </Card>
    );
}


export default function AnalyticsPage() {
    const [grievances, setGrievances] = useState<Grievance[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching data
        setTimeout(() => {
            setGrievances(DEMO_GRIEVANCES);
            setIsLoading(false);
        }, 500);
    }, []);

    const statusData = useMemo(() => {
        if (!grievances) return [];
        const counts: { [key: string]: number } = { Submitted: 0, "In Progress": 0, Resolved: 0 };
        grievances.forEach(g => {
            if (g.status in counts) {
                counts[g.status]++;
            }
        });
        return Object.entries(counts).map(([status, count]) => ({ status, count }));
    }, [grievances]);

    const trendsData = useMemo(() => {
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = subDays(new Date(), 29 - i);
            return { date: format(date, "MMM dd"), count: 0 };
        });

        if (grievances) {
            grievances.forEach(g => {
                if (g.createdAt && 'seconds' in g.createdAt) {
                    const grievanceDate = new Date(g.createdAt.seconds * 1000);
                    const dayStr = format(grievanceDate, "MMM dd");
                    const dayData = last30Days.find(d => d.date === dayStr);
                    if (dayData) {
                        dayData.count++;
                    }
                }
            });
        }

        return last30Days;
    }, [grievances]);

    const categoryData = useMemo(() => {
        if (!grievances) return [];
        const categoryMap: { [key: string]: number } = {};
        grievances.forEach(g => {
            const category = categorizeGrievance(g.description);
            categoryMap[category] = (categoryMap[category] || 0) + 1;
        });
        return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    }, [grievances]);

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight animate-fade-in-up">Grievance Analytics</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                 <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <AIInsights grievances={grievances} />
                    <ImpactSimulator grievances={grievances} />
                </div>
                <Card className="animate-fade-in-up">
                    <CardHeader>
                        <CardTitle>Grievances by Status</CardTitle>
                        <CardDescription>A breakdown of all reports by their current status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                                <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Legend />
                                <Bar dataKey="count" fill="hsl(var(--primary))" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <CardHeader>
                        <CardTitle>Grievances by Category</CardTitle>
                        <CardDescription>Distribution of grievances across different categories.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                             <PieChart>
                                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <CardHeader>
                        <CardTitle>Submission Trends</CardTitle>
                        <CardDescription>Grievances submitted over the last 30 days.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} angle={-45} textAnchor="end" height={50} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                                <Legend />
                                <Line type="monotone" dataKey="count" name="Submissions" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    