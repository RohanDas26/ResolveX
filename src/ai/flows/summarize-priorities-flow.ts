'use server';
/**
 * @fileOverview An AI flow to summarize high-priority grievances.
 *
 * - summarizePriorities - A function that takes a list of grievance descriptions and returns a summary.
 * - SummarizePrioritiesInput - The input type for the summarizePriorities function.
 * - SummarizePrioritiesOutput - The return type for the summarizePriorities function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizePrioritiesInputSchema = z.object({
  grievances: z.array(z.string()).describe('A list of grievance descriptions.'),
});
export type SummarizePrioritiesInput = z.infer<typeof SummarizePrioritiesInputSchema>;

const SummarizePrioritiesOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the highest priority issues from the list of grievances.'),
});
export type SummarizePrioritiesOutput = z.infer<typeof SummarizePrioritiesOutputSchema>;

export async function summarizePriorities(input: SummarizePrioritiesInput): Promise<SummarizePrioritiesOutput> {
  return summarizePrioritiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePrioritiesPrompt',
  input: { schema: SummarizePrioritiesInputSchema },
  output: { schema: SummarizePrioritiesOutputSchema },
  prompt: `You are an expert civic issue analyst for the GHMC. Your task is to analyze a list of public grievances and identify the most urgent and impactful issues.

Based on the following list of reported grievances, provide a short, one or two-sentence summary highlighting the most critical, high-priority problems that require immediate attention. Focus on issues that are reported multiple times or seem to pose a significant risk.

Grievances:
{{#each grievances}}
- {{{this}}}
{{/each}}`,
});

const summarizePrioritiesFlow = ai.defineFlow(
  {
    name: 'summarizePrioritiesFlow',
    inputSchema: SummarizePrioritiesInputSchema,
    outputSchema: SummarizePrioritiesOutputSchema,
  },
  async (input) => {
    if (input.grievances.length === 0) {
        return { summary: "No grievances to analyze." };
    }
    const { output } = await prompt(input);
    return output!;
  }
);