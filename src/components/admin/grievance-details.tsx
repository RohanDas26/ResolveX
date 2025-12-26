
"use client";

import type { Grievance } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { format } from "date-fns";
import Image from "next/image";
import { Zap, Shield, User, Calendar, MapPin, CheckCircle, Clock, BarChart } from "lucide-react";
import { Progress } from "../ui/progress";

interface GrievanceDetailsProps {
    grievance: Grievance;
    onUpdateGrievanceStatus: (id: string, status: Grievance['status']) => void;
    newStatus: Grievance['status'] | null;
    setNewStatus: (status: Grievance['status'] | null) => void;
}

export default function GrievanceDetails({ grievance, onUpdateGrievanceStatus, newStatus, setNewStatus }: GrievanceDetailsProps) {

    const getStatusVariant = (status: Grievance['status']): "default" | "secondary" | "destructive" => {
        switch(status) {
          case 'Resolved': return 'default';
          case 'In Progress': return 'secondary';
          case 'Submitted':
          default:
            return 'destructive';
        }
    }

    const getRiskColor = (score: number) => {
        if (score > 75) return 'text-red-500';
        if (score > 40) return 'text-amber-500';
        return 'text-green-500';
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="relative w-full h-48 rounded-md overflow-hidden">
                        <Image src={grievance.imageUrl} alt={grievance.description} layout="fill" objectFit="cover" />
                    </div>
                </CardHeader>
                <CardContent>
                    <CardTitle className="text-lg">{grievance.description}</CardTitle>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground mt-4">
                        <div className="flex items-center gap-2"><User /><span>{grievance.userName}</span></div>
                        <div className="flex items-center gap-2"><Calendar /><span>{grievance.createdAt ? format(grievance.createdAt.toDate(), "PP") : 'N/A'}</span></div>
                        <div className="flex items-center gap-2 col-span-2"><MapPin /><span>{grievance.location.latitude.toFixed(4)}, {grievance.location.longitude.toFixed(4)}</span></div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Shield /> Status Control</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span>Current Status:</span>
                        <Badge variant={getStatusVariant(grievance.status)}>{grievance.status}</Badge>
                    </div>
                    <Select value={newStatus || grievance.status} onValueChange={(v) => setNewStatus(v as Grievance['status'])}>
                        <SelectTrigger>
                            <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Submitted"><Clock className="mr-2 h-4 w-4" />Submitted</SelectItem>
                            <SelectItem value="In Progress"><Zap className="mr-2 h-4 w-4" />In Progress</SelectItem>
                            <SelectItem value="Resolved"><CheckCircle className="mr-2 h-4 w-4" />Resolved</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button className="w-full" onClick={() => newStatus && onUpdateGrievanceStatus(grievance.id, newStatus)} disabled={newStatus === grievance.status}>
                        Update Status
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><BarChart /> AI Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Risk Score</span>
                            <span className={`text-lg font-bold ${getRiskColor(grievance.riskScore || 0)}`}>{grievance.riskScore || 'N/A'}</span>
                        </div>
                        <Progress value={grievance.riskScore || 0} className="h-2" />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">AI Notes:</h4>
                        <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">{grievance.aiNotes || 'No AI notes available for this grievance.'}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
