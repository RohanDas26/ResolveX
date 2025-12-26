
"use client";

import { useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Grievance } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format, subDays } from "date-fns";
import { Loader2 } from "lucide-react";

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

export default function AnalyticsPage() {
    const firestore = useFirestore();

    const grievancesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "grievances"));
    }, [firestore]);

    const { data: grievances, isLoading } = useCollection<Grievance>(grievancesQuery);

    const statusData = useMemo(() => {
        const counts = { Submitted: 0, "In Progress": 0, Resolved: 0 };
        grievances?.forEach(g => {
            if (g.status in counts) {
                counts[g.status]++;
            }
        });
        return [
            { status: "Submitted", count: counts.Submitted },
            { status: "In Progress", count: counts["In Progress"] },
            { status: "Resolved", count: counts.Resolved },
        ];
    }, [grievances]);

    const trendsData = useMemo(() => {
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = subDays(new Date(), 29 - i);
            return { date: format(date, "MMM dd"), count: 0 };
        });

        grievances?.forEach(g => {
            const dateStr = format(new Date(g.createdAt.seconds * 1000), "MMM dd");
            const dayData = last30Days.find(d => d.date === dateStr);
            if (dayData) {
                dayData.count++;
            }
        });

        return last30Days;
    }, [grievances]);

    const categoryData = useMemo(() => {
        const categoryMap: { [key: string]: number } = {};
        grievances?.forEach(g => {
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
        <div className="p-4 sm:p-8 space-y-8">
            <h1 className="text-3xl font-bold tracking-tight animate-fade-in-up">Grievance Analytics</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="animate-fade-in-up">
                    <CardHeader>
                        <CardTitle>Grievances by Status</CardTitle>
                        <CardDescription>A breakdown of all reports by their current status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                                <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))"/>
                                <YAxis stroke="hsl(var(--muted-foreground))"/>
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
                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))"/>
                                <YAxis stroke="hsl(var(--muted-foreground))"/>
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
