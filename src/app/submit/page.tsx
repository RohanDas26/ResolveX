
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
import { useEffect, useState, DragEvent } from "react";
import { Loader2, MapPin, UploadCloud, CheckCircle, AlertCircle, Zap, Tags } from "lucide-react";
import { useUser } from "@/firebase";
import { GeoPoint, Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { summarizeGrievance } from "@/ai/flows/summarize-grievance-flow";
import { Badge } from "@/components/ui/badge";
import type { Grievance } from "@/lib/types";
import { DEMO_GRIEVANCES } from "@/lib/demo-data";


// A simple in-memory store for our demo data, attached to the window for global access
if (typeof window !== 'undefined') {
    // @ts-ignore
    if (!window.grievanceStore) {
        // @ts-ignore
        window.grievanceStore = {
            grievances: [...DEMO_GRIEVANCES],
            listeners: new Set(),
            add(grievance: Grievance) {
                // @ts-ignore
                this.grievances.unshift(grievance);
                // @ts-ignore
                this.notify();
            },
            get() {
                // @ts-ignore
                return this.grievances;
            },
            subscribe(listener: () => void) {
                // @ts-ignore
                this.listeners.add(listener);
                return () => {
                    // @ts-ignore
                    this.listeners.delete(listener);
                };
            },
            notify() {
                // @ts-ignore
                this.listeners.forEach(listener => listener());
            }
        };
    }
}


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
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { user, profile, isUserLoading } = useUser();
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
        },
    });

    const handleAiAssist = async () => {
        const description = form.getValues("description");
        if (!description || description.length < 10) {
            toast({
                variant: "destructive",
                title: "Description Too Short",
                description: "Please enter at least 10 characters for the AI to assist.",
            });
            return;
        }
        setIsSummarizing(true);
        setSuggestedCategory(null);
        try {
            const result = await summarizeGrievance(description);
            if (result.description) {
                form.setValue("description", result.description);
            }
            if (result.category) {
                setSuggestedCategory(result.category);
            }
            toast({
                title: "AI Assist Successful!",
                description: "The description has been enhanced.",
            });
        } catch (error) {
            console.error("AI Assist Error:", error);
            toast({
                variant: "destructive",
                title: "AI Assist Failed",
                description: "Could not summarize the description. Please try again.",
            });
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleGetCurrentLocation = () => {
        setLocation(null);
        setLocationError(null);
        setIsGettingLocation(true);

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            setIsGettingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLocationError(null);
                setIsGettingLocation(false);
            },
            () => {
                setLocationError("Unable to retrieve your location. Please enable location permissions for this site.");
                setIsGettingLocation(false);
            }
        );
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!location) {
            toast({ variant: "destructive", title: "Location Missing", description: "Please get your current location before submitting." });
            return;
        }
        if (!user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to submit a grievance." });
            return;
        }
        if (!photoPreview) {
             toast({ variant: "destructive", title: "Photo Missing", description: "Please upload a photo of the issue." });
            return;
        }
        
        setIsSubmitting(true);
        
        const grievanceId = uuidv4();
        
        const newGrievance = {
            id: grievanceId,
            userId: user.uid,
            userName: profile?.name || 'Anonymous',
            description: values.description,
            imageUrl: photoPreview, // Use the preview URL for the demo
            location: new GeoPoint(location.lat, location.lng),
            status: "Submitted" as const,
            createdAt: Timestamp.now(),
            riskScore: Math.floor(Math.random() * 80) + 10,
            aiNotes: "This is a newly submitted grievance and has not been analyzed yet.",
        };
        
        // This is a temporary solution to pass data between pages on the client
        // In a real app, this would be handled by a state management library or server-side logic
        if (typeof window !== 'undefined' && (window as any).grievanceStore) {
            (window as any).grievanceStore.add(newGrievance);
        }

        toast({ title: "Grievance Submitted!", description: "Thank you for your report. It's now visible on the map." });

        // Optimistically navigate to the map, highlighting the new pin
        router.push(`/map?id=${grievanceId}`);
    }

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        // Create a FileList to satisfy the form schema
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        form.setValue("photo", dataTransfer.files);
        // Manually trigger validation for the photo field
        form.trigger("photo");
    };

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };
    
    const handleDrag = (e: DragEvent<HTMLDivElement>, isDragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(isDragging);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        handleDrag(e, false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };
    
    if (isUserLoading) {
        return (
             <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-8 animate-fade-in">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <Card className="w-full max-w-2xl border-0 md:border md:shadow-lg animate-fade-in-up">
            <CardHeader>
                <CardTitle className="text-3xl font-bold tracking-tight">Submit a New Grievance</CardTitle>
                <CardDescription>
                    Fill out the form below to report a civic issue. Your current location will be attached.
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
                                    <div className="flex justify-between items-center">
                                        <FormLabel>Describe the issue</FormLabel>
                                        <Button type="button" size="sm" variant="outline" onClick={handleAiAssist} disabled={isSummarizing}>
                                            {isSummarizing ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Zap className="mr-2 h-4 w-4 text-amber-500" />
                                            )}
                                            AI Assist
                                        </Button>
                                    </div>
                                    <FormControl>
                                        <Textarea rows={5} placeholder="e.g., Big hole near hostel gate, bikes falling" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {suggestedCategory && (
                            <div className="flex items-center gap-2 animate-fade-in">
                                <Tags className="h-5 w-5 text-primary"/>
                                <span className="font-medium text-sm">Suggested Category:</span>
                                <Badge variant="secondary">{suggestedCategory}</Badge>
                            </div>
                        )}
                         <FormField
                            control={form.control}
                            name="photo"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Upload a photo</FormLabel>
                                <FormControl>
                                    <div
                                        className={cn(
                                            "relative flex justify-center w-full h-48 px-6 pt-5 pb-6 border-2 border-dashed rounded-md border-input group",
                                            "transition-colors",
                                            isDragging && "border-primary bg-accent/20"
                                        )}
                                        onDragEnter={(e) => handleDrag(e, true)}
                                        onDragLeave={(e) => handleDrag(e, false)}
                                        onDragOver={(e) => handleDrag(e, true)}
                                        onDrop={handleDrop}
                                    >
                                        {photoPreview ? (
                                            <>
                                                <Image src={photoPreview} alt="Photo preview" layout="fill" objectFit="contain" className="rounded-md" />
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-2 right-2 z-10"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setPhotoPreview(null);
                                                        form.setValue("photo", null);
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="space-y-1 text-center pointer-events-none">
                                                <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground" />
                                                <div className="flex text-sm text-muted-foreground">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="relative font-medium bg-transparent rounded-md cursor-pointer text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring pointer-events-auto"
                                                    >
                                                        <span>Upload a file</span>
                                                        <Input id="file-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormDescription>A clear photo helps resolve the issue faster.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        
                        <div className="space-y-4">
                            <Button type="button" variant="outline" className="w-full" onClick={handleGetCurrentLocation} disabled={isGettingLocation}>
                                {isGettingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                                Get Current Location
                            </Button>
                            {location && (
                                <Alert className="animate-fade-in">
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertTitle>Location Acquired!</AlertTitle>
                                    <AlertDescription>
                                        Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                                    </AlertDescription>
                                </Alert>
                            )}
                            {locationError && (
                                <Alert variant="destructive" className="animate-fade-in">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Location Error</AlertTitle>
                                    <AlertDescription>
                                        {locationError}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        <Button type="submit" size="lg" className="w-full font-semibold" disabled={isSubmitting || !location}>
                            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                            {isSubmitting ? "Submitting..." : "Submit Grievance"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default function SubmitPage() {
    return (
        <div className="container mx-auto px-4 py-8 flex justify-center animate-fade-in">
            <SubmitPageContent />
        </div>
    );
}
