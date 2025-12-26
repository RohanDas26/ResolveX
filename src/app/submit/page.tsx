
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import AuthGuard from "@/components/auth-guard";
import { useUser, useFirestore } from "@/firebase";
import { GeoPoint, Timestamp, collection, doc } from "firebase/firestore";
import { getStorage, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(500, { message: "Description must be 500 characters or less." }),
  photo: z.any()
    .refine((files) => files?.length == 1, "Photo is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

function SubmitPageContent() {
    const { user } = useUser();
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const firestore = useFirestore();

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setLocationError(null);
                },
                (error) => {
                    setLocationError(`Location Error: ${error.message}. Please enable location services.`);
                    toast({ variant: "destructive", title: "Location Error", description: "Please enable location services in your browser to submit a grievance." });
                }
            );
        } else {
            setLocationError("Geolocation is not supported by this browser.");
            toast({ variant: "destructive", title: "Browser Incompatible", description: "Your browser does not support geolocation." });
        }
    }, [toast]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!location) {
            toast({ variant: "destructive", title: "Location unavailable", description: "Cannot submit without your location." });
            return;
        }
        if (!user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to submit a report." });
            return;
        }

        setIsLoading(true);
        try {
            const imageFile = values.photo[0];
            const storage = getStorage();
            const grievanceId = uuidv4();
            const imageRef = ref(storage, `grievances/${user.uid}/${grievanceId}-${imageFile.name}`);
            
            await uploadBytes(imageRef, imageFile);
            const imageUrl = await getDownloadURL(imageRef);

            const grievanceData = {
                id: grievanceId,
                userId: user.uid,
                userName: user.displayName || "Anonymous",
                description: values.description,
                imageUrl: imageUrl,
                location: new GeoPoint(location.lat, location.lng),
                status: "Submitted",
                createdAt: Timestamp.now(),
            };

            // Write to the user-specific collection for their dashboard
            setDocumentNonBlocking(doc(firestore, "users", user.uid, "grievances", grievanceId), grievanceData, { merge: true });

            // Write to the public collection for the map
            setDocumentNonBlocking(doc(firestore, "grievances", grievanceId), grievanceData, { merge: true });


            toast({ title: "Grievance Submitted!", description: "Thank you for your report. It is now under review." });
            router.push("/dashboard");

        } catch (error: any) {
            console.error("Submission error:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "An unexpected error occurred. Please try again." });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle className="text-2xl">Submit a New Grievance</CardTitle>
                <CardDescription>
                    Fill out the form below to report an issue. Your current location will be attached.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea rows={4} placeholder="e.g., Large pothole causing traffic issues on the main road near the library." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="photo"
                            render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormLabel>Photo of the Issue</FormLabel>
                                <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} {...rest} />
                                </FormControl>
                                <FormDescription>A clear photo helps resolve the issue faster.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        
                        {location || locationError ? (
                            <div className={`flex items-center p-3 rounded-md ${location ? 'bg-secondary text-secondary-foreground' : 'bg-destructive/20 text-destructive-foreground'}`}>
                                <MapPin className={`mr-2 h-5 w-5 ${location ? 'text-primary' : ''}`} />
                                {location ? <span>Location captured successfully.</span> : <span>{locationError}</span>}
                            </div>
                        ) : (
                            <div className="flex items-center p-3 rounded-md bg-secondary text-secondary-foreground">
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                <span>Acquiring your location...</span>
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading || !location}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isLoading ? "Submitting..." : "Submit Grievance"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default function SubmitPage() {
    return (
        <AuthGuard>
            <div className="container mx-auto px-4 py-8 flex justify-center">
                <SubmitPageContent />
            </div>
        </AuthGuard>
    );
}
