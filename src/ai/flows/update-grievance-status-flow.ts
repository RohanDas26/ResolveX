
'use server';
/**
 * @fileOverview An AI flow to suggest status updates for grievances.
 *
 * - updateGrievanceStatus - A function that suggests a new status and justification.
 * - UpdateGrievanceStatusInput - The input type for the function.
 * - UpdateGrievanceStatusOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const UpdateGrievanceStatusInputSchema = z.object({
  description: z.string().describe('The description of the grievance.'),
  currentStatus: z.enum(['Submitted', 'In Progress', 'Resolved']).describe('The current status of the grievance.'),
});
export type UpdateGrievanceStatusInput = z.infer<typeof UpdateGrievanceStatusInputSchema>;

const UpdateGrievanceStatusOutputSchema = z.object({
  suggestedStatus: z.enum(['Submitted', 'In Progress', 'Resolved']).describe('The suggested new status for the grievance.'),
  justification: z.string().describe('A brief justification for why the new status is appropriate.'),
});
export type UpdateGrievanceStatusOutput = z.infer<typeof UpdateGrievanceStatusOutputSchema>;

export async function updateGrievanceStatus(input: UpdateGrievanceStatusInput): Promise<UpdateGrievanceStatusOutput> {
  return updateGrievanceStatusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'updateGrievanceStatusPrompt',
  input: { schema: UpdateGrievanceStatusInputSchema },
  output: { schema: UpdateGrievanceStatusOutputSchema },
  prompt: `You are an expert civic issue analyst for the GHMC. Your task is to analyze a public grievance and suggest a status update.

Analyze the following grievance:
- Description: {{{description}}}
- Current Status: {{{currentStatus}}}

Based on the description, suggest a new status ('In Progress' or 'Resolved'). Provide a short, one-sentence justification for your suggestion.
- If the issue seems like it has been acknowledged and work has started (e.g., 'repair crew dispatched', 'under review'), suggest 'In Progress'.
- If the description implies the work is finished (e.g., 'has been fixed', 'is now clear'), suggest 'Resolved'.
- Do not suggest the same status as the current status. If no change is warranted, pick the most logical next step.`,
});

const updateGrievanceStatusFlow = ai.defineFlow(
  {
    name: 'updateGrievanceStatusFlow',
    inputSchema: UpdateGrievanceStatusInputSchema,
    outputSchema: UpdateGrievanceStatusOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
