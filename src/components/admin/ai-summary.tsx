"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Loader2 } from "lucide-react";
import { summarizePriorities } from "@/ai/flows/summarize-priorities-flow";
import { Button } from "@/components/ui/button";

interface AISummaryProps {
    grievances: string[];
    isLoading: boolean;
}

export default function AISummary({ grievances, isLoading }: AISummaryProps) {
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);

    const handleGenerateSummary = () => {
        if (grievances && grievances.length > 0) {
          setIsSummaryLoading(true);
          setSummary(null);
          summarizePriorities({ grievances })
            .then(result => setSummary(result.summary))
            .catch(err => {
                console.error("Error generating summary: ", err);
                setSummary("Could not generate AI summary due to an error.");
            })
            .finally(() => setIsSummaryLoading(false));
        } else if (!isLoading) {
            setSummary("No grievances to summarize for the current filter.");
        }
    };

    return (
        <Card className="bg-background/50">
            <CardHeader>
                <CardTitle className="flex items-center text-lg">
                    <Sparkles className="mr-2 h-5 w-5 text-primary" />
                    AI Priority Summary
                </CardTitle>
                <CardDescription>Click to generate a Gemini analysis of urgent issues.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isSummaryLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                ) : summary ? (
                    <Alert className="border-primary/40 bg-primary/10">
                      <Sparkles className="h-4 w-4 !text-primary" />
                      <AlertTitle className="font-semibold text-primary">Gemini Analysis</AlertTitle>
                      <AlertDescription className="text-foreground/80">
                        {summary}
                      </AlertDescription>
                    </Alert>
                ) : (
                    <div className="text-sm text-center text-muted-foreground py-4">
                        Click the button to generate an AI summary for the current filters.
                    </div>
                )}
                 <Button onClick={handleGenerateSummary} disabled={isSummaryLoading || isLoading || grievances.length === 0} className="w-full">
                    {isSummaryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                    {isSummaryLoading ? 'Analyzing...' : 'Generate Summary'}
                </Button>
            </CardContent>
        </Card>
    );
}
