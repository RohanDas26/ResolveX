'use server';
/**
 * @fileOverview An AI flow to process user-submitted grievance descriptions.
 * It refines the description and suggests a category.
 *
 * - summarizeGrievance - A function that handles the grievance summarization.
 * - GrievanceSummaryInput - The input type for the summarizeGrievance function.
 * - GrievanceSummaryOutput - The return type for the summarizeGrievance function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GrievanceSummaryInputSchema = z.string();
export type GrievanceSummaryInput = z.infer<typeof GrievanceSummaryInputSchema>;

const GrievanceSummaryOutputSchema = z.object({
  description: z.string().describe('The revised, clear, and well-structured description of the grievance.'),
  category: z.string().describe('The suggested category for the grievance from the following options: Pothole, Streetlight, Garbage, Water, Sidewalk, Vendor, Debris, Other.'),
});
export type GrievanceSummaryOutput = z.infer<typeof GrievanceSummaryOutputSchema>;

export async function summarizeGrievance(input: GrievanceSummaryInput): Promise<GrievanceSummaryOutput> {
  return summarizeGrievanceFlow(input);
}

const summarizeGrievanceFlow = ai.defineFlow(
  {
    name: 'summarizeGrievanceFlow',
    inputSchema: GrievanceSummaryInputSchema,
    outputSchema: GrievanceSummaryOutputSchema,
  },
  async (userInput) => {
    const { output } = await ai.generate({
      prompt: `You are an expert at refining and classifying civic issue reports.
A user has submitted the following raw description of a grievance.
Your task is to:
1. Rewrite the description to be clear, professional, and detailed. Convert keywords and broken phrases into a full, coherent sentence.
2. Classify the grievance into one of the following categories: Pothole, Streetlight, Garbage, Water, Sidewalk, Vendor, Debris, Other.

User input: "${userInput}"`,
      output: {
        schema: GrievanceSummaryOutputSchema,
      },
    });
    return output;
  }
);
