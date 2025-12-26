"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { summarizePriorities } from "@/ai/flows/summarize-priorities-flow";

interface AISummaryProps {
    grievances: string[];
    isLoading: boolean;
}

export default function AISummary({ grievances, isLoading }: AISummaryProps) {
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);

    useEffect(() => {
        if (grievances && grievances.length > 0) {
          setIsSummaryLoading(true);
          summarizePriorities({ grievances })
            .then(result => setSummary(result.summary))
            .catch(err => {
                console.error("Error generating summary: ", err);
                setSummary("Could not generate AI summary.");
            })
            .finally(() => setIsSummaryLoading(false));
        } else if (!isLoading) {
            setIsSummaryLoading(false);
            setSummary("No grievances to summarize for the current filter.");
        }
      }, [grievances, isLoading]);

    return (
        <Card className="bg-background/50">
            <CardHeader>
                <CardTitle className="flex items-center text-lg">
                    <Sparkles className="mr-2 h-5 w-5 text-primary" />
                    AI Priority Summary
                </CardTitle>
                <CardDescription>Gemini analysis of urgent issues.</CardDescription>
            </CardHeader>
            <CardContent>
                {isSummaryLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                ) : (
                    <Alert className="border-primary/40 bg-primary/10">
                      <Sparkles className="h-4 w-4 !text-primary" />
                      <AlertTitle className="font-semibold text-primary">Gemini Analysis</AlertTitle>
                      <AlertDescription className="text-foreground/80">
                        {summary}
                      </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
