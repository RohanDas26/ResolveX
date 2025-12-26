
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Loader2, BotMessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Grievance } from '@/lib/types';
import { updateGrievanceStatus, type UpdateGrievanceStatusOutput } from '@/ai/flows/update-grievance-status-flow';

interface AIStatusUpdaterProps {
  grievances: Grievance[];
  isLoading: boolean;
  onUpdateStatus: (id: string, status: Grievance['status']) => void;
}

export default function AIStatusUpdater({ grievances, isLoading, onUpdateStatus }: AIStatusUpdaterProps) {
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<UpdateGrievanceStatusOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!selectedGrievanceId) return;

    const grievance = grievances.find((g) => g.id === selectedGrievanceId);
    if (!grievance) return;
    
    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);

    try {
      const result = await updateGrievanceStatus({
        description: grievance.description,
        currentStatus: grievance.status,
      });
      setAnalysis(result);
    } catch (err: any) {
      console.error('Error analyzing grievance: ', err);
      setError('Could not analyze grievance due to an API error.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const selectedGrievance = grievances.find(g => g.id === selectedGrievanceId);

  return (
    <Card className="bg-background/50">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <BotMessageSquare className="mr-2 h-5 w-5 text-primary" />
          AI Status Assistant
        </CardTitle>
        <CardDescription>Select a grievance to get an AI-suggested status update.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          onValueChange={setSelectedGrievanceId}
          disabled={isLoading || isAnalyzing}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a grievance..." />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading" disabled>Loading grievances...</SelectItem>
            ) : (
              grievances.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  <span className="truncate">{g.description}</span>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Button onClick={handleAnalyze} disabled={!selectedGrievanceId || isAnalyzing || isLoading} className="w-full">
          {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Grievance'}
        </Button>

        {isAnalyzing && (
            <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        )}

        {error && (
            <Alert variant="destructive">
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {analysis && selectedGrievance && (
            <Alert className="border-primary/40 bg-primary/10">
                <Sparkles className="h-4 w-4 !text-primary" />
                <AlertTitle className="font-semibold text-primary">AI Suggestion</AlertTitle>
                <AlertDescription className="text-foreground/80 space-y-3 mt-2">
                   <p>
                     <span className="font-semibold">New Status: </span>{analysis.suggestedStatus}
                   </p>
                    <p>
                      <span className="font-semibold">Justification: </span>{analysis.justification}
                    </p>
                </AlertDescription>
                 <div className="mt-4 flex gap-2">
                    <Button
                        size="sm"
                        onClick={() => onUpdateStatus(selectedGrievance.id, analysis.suggestedStatus)}
                    >
                        Accept & Update Status
                    </Button>
                     <Button size="sm" variant="ghost" onClick={() => setAnalysis(null)}>
                        Dismiss
                    </Button>
                </div>
            </Alert>
        )}

      </CardContent>
    </Card>
  );
}
