
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
import { Loader2, MapPin, UploadCloud } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { GeoPoint, Timestamp, collection, doc, setDoc, runTransaction, getDoc } from "firebase/firestore";
import { getStorage, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";


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

// For demonstration, we'll cycle through a few mock users.
const mockUsers = [
    { id: 'user_student_1', name: 'Alex Doe' },
    { id: 'user_student_2', name: 'Jane Smith' },
    { id: 'user_student_3', name: 'Sam Wilson' },
];
let currentUserIndex = 0;

function SubmitPageContent() {
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
                    setLocationError(`Location Error: ${error.message}.`);
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
        
        setIsLoading(true);
        try {
            if (!firestore) {
              throw new Error("Firestore is not initialized");
            }

            const imageFile = values.photo[0];
            const storage = getStorage();
            const grievanceId = uuidv4();
            
            // Cycle through mock users for demo
            const currentUser = mockUsers[currentUserIndex];
            currentUserIndex = (currentUserIndex + 1) % mockUsers.length;
            
            const userId = currentUser.id;
            const userName = currentUser.name;

            const imageRef = ref(storage, `grievances/${userId}/${grievanceId}-${imageFile.name}`);
            
            await uploadBytes(imageRef, imageFile);
            const imageUrl = await getDownloadURL(imageRef);

            const grievanceData = {
                id: grievanceId,
                userId: userId,
                userName: userName,
                description: values.description,
                imageUrl: imageUrl,
                location: new GeoPoint(location.lat, location.lng),
                status: "Submitted",
                createdAt: Timestamp.now(),
            };
            
            const grievanceDocRef = doc(firestore, "grievances", grievanceId);
            const userDocRef = doc(firestore, "users", userId);

            // Use a transaction to ensure atomicity
            await runTransaction(firestore, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);

                if (!userDoc.exists()) {
                    // If user doesn't exist, create them.
                    transaction.set(userDocRef, {
                        id: userId,
                        name: userName,
                        grievanceCount: 1,
                        imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=${userId}`
                    });
                } else {
                    // If user exists, increment their grievance count.
                    const newCount = (userDoc.data().grievanceCount || 0) + 1;
                    transaction.update(userDocRef, { grievanceCount: newCount });
                }

                // Set the grievance document
                transaction.set(grievanceDocRef, grievanceData);
            });


            toast({ title: "Grievance Submitted!", description: "Thank you for your report. It's now visible on the map." });
            router.push("/");

        } catch (error: any) {
            console.error("Submission error:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "An unexpected error occurred. Please try again." });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-2xl border-0 md:border md:shadow-lg animate-fade-in-up">
            <CardHeader>
                <CardTitle className="text-3xl font-bold tracking-tight">Submit a New Grievance</CardTitle>
                <CardDescription>
                    Fill out the form below to report a civic issue. Your current location will be attached automatically.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Describe the issue</FormLabel>
                                    <FormControl>
                                        <Textarea rows={5} placeholder="e.g., Large pothole causing traffic issues on the main road near the library." {...field} />
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
                                <FormLabel>Upload a photo</FormLabel>
                                <FormControl>
                                  <div className="relative flex justify-center w-full h-48 px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-input hover:border-primary transition-colors">
                                      <div className="space-y-1 text-center">
                                          <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground" />
                                          <div className="flex text-sm text-muted-foreground">
                                              <label
                                                  htmlFor="file-upload"
                                                  className="relative font-medium bg-transparent rounded-md cursor-pointer text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring"
                                              >
                                                  <span>Upload a file</span>
                                                  <Input id="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => onChange(e.target.files)} {...rest} />
                                              </label>
                                              <p className="pl-1">or drag and drop</p>
                                          </div>
                                          <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                                      </div>
                                  </div>
                                </FormControl>
                                <FormDescription>A clear photo helps resolve the issue faster.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        
                        <div className={cn("flex items-center p-3 rounded-md transition-all", 
                            location ? 'bg-secondary text-secondary-foreground' : 
                            locationError ? 'bg-destructive/20 text-destructive-foreground' : 
                            'bg-muted text-muted-foreground animate-pulse')}>
                          
                          {location && <MapPin className="mr-3 h-5 w-5 text-primary" />}
                          {locationError && <MapPin className="mr-3 h-5 w-5 text-destructive" />}
                          {!location && !locationError && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                          
                          <div className="text-sm">
                            {location ? <span>Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span> : 
                             locationError ? <span>{locationError}</span> :
                             <span>Acquiring your location...</span>}
                          </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full font-semibold" disabled={isLoading || !location}>
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
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
        <div className="container mx-auto px-4 py-8 flex justify-center">
            <SubmitPageContent />
        </div>
    );
}
