
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Database, BarChart, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const StepCard = ({ icon, title, description, children }: { icon: React.ReactNode, title: string, description: string, children?: React.ReactNode }) => (
    <Card className="animate-fade-in-up">
        <CardHeader className="flex flex-row items-start sm:items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full mt-1 sm:mt-0">
                {icon}
            </div>
            <div>
                <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
        </CardHeader>
        {children && (
            <CardContent>
                {children}
            </CardContent>
        )}
    </Card>
);

export default function IntegrationGuidePage() {

    return (
        <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto">
            <header className="text-center animate-fade-in-up">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Enterprise Integration Guide</h1>
                <p className="mt-2 text-muted-foreground">How to connect Firestore, BigQuery, and Looker Studio.</p>
            </header>
            
            <div className="space-y-8">
                <StepCard
                    icon={<Database className="h-6 w-6 text-primary" />}
                    title="Step 1: Stream Firestore to BigQuery"
                    description="Set up a real-time data pipeline from the app's database to a data warehouse."
                >
                    <div className="space-y-4 text-sm sm:text-base">
                        <p className="font-semibold">Tool: Use the official Firebase Extension "Stream Collections to BigQuery".</p>
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                            <li>Go to the Firebase Console for this project.</li>
                            <li>Navigate to the "Extensions" section and search for "Stream Collections to BigQuery".</li>
                            <li>Configure the extension to watch the <code className="bg-muted px-1.5 py-0.5 rounded-sm font-mono text-sm">grievances</code> collection.</li>
                            <li>The extension will automatically create a BigQuery table and keep it synced.</li>
                        </ol>
                    </div>
                </StepCard>

                 <div className="flex justify-center">
                    <ArrowRight className="h-8 w-8 text-muted-foreground animate-pulse" />
                </div>


                <StepCard
                    icon={<BarChart className="h-6 w-6 text-primary" />}
                    title="Step 2: Connect Looker Studio to BigQuery"
                    description="Visualize the data from BigQuery to create interactive dashboards."
                >
                    <div className="space-y-4 text-sm sm:text-base">
                        <p className="font-semibold">Tool: Use Google Looker Studio (it's free).</p>
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                            <li>Open Looker Studio and create a new "Data Source".</li>
                            <li>Select the "BigQuery" connector.</li>
                            <li>Choose your project, the dataset created by the extension, and the `grievances` table.</li>
                            <li>You can now build charts, graphs, and heatmaps using your live data.</li>
                        </ol>
                    </div>
                </StepCard>

                <div className="flex justify-center">
                    <ArrowRight className="h-8 w-8 text-muted-foreground animate-pulse" />
                </div>


                <StepCard
                    icon={<CheckCircle className="h-6 w-6 text-primary" />}
                    title="Step 3: Embed Reports in This App"
                    description="The charts in this admin dashboard are a live prototype of the final embedded reports."
                >
                     <p className="text-muted-foreground text-sm sm:text-base">
                        The charts you see on the <Link href="/admin/analytics" className="text-primary underline">Analytics Dashboard</Link> are built directly into the app for demonstration. In a final production setup, you would get an "embed URL" from your Looker Studio report and place it here. This shows how seamlessly external dashboards can be integrated. The current charts serve as a high-fidelity placeholder for that final integration.
                    </p>
                </StepCard>

            </div>
        </div>
    );
}

    