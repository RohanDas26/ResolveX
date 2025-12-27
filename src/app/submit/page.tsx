
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
import { useUser, useFirestore, useFirebaseApp } from "@/firebase";
import { GeoPoint, Timestamp, addDoc, collection, doc, writeBatch } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { summarizeGrievance } from "@/ai/flows/summarize-grievance-flow";
import { Badge } from "@/components/ui/badge";

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
    const firestore = useFirestore();
    const firebaseApp = useFirebaseApp();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { user, profile, isUserLoading, isProfileLoading } = useUser();
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
      // still loading auth/profile → block with clear message
      if (isUserLoading || isProfileLoading) {
        toast({
          variant: "destructive",
          title: "Authentication Pending",
          description: "Please wait for your account to finish loading.",
        });
        return;
      }
    
      // user MUST exist
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to submit a grievance.",
        });
        return;
      }
    
      // location still required
      if (!location) {
        toast({
          variant: "destructive",
          title: "Location Missing",
          description: "Please get your current location before submitting.",
        });
        return;
      }
    
      setIsSubmitting(true);
    
      try {
        const storage = getStorage(firebaseApp);
        const photoFile = values.photo[0] as File;
        const grievanceId = uuidv4();
        const extension = photoFile.name.split(".").pop();
        const photoRef = ref(
          storage,
          `grievances/${user.uid}/${grievanceId}.${extension}`
        );
    
        // 1. Upload photo
        const uploadResult = await uploadBytes(photoRef, photoFile);
        const imageUrl = await getDownloadURL(uploadResult.ref);
    
        // 2. Prepare grievance data
        const userName = profile?.name || user.displayName || "Anonymous User";
        const currentCount = profile?.grievanceCount ?? 0;
    
        const newGrievance = {
          userId: user.uid,
          userName,
          description: values.description,
          location: new GeoPoint(location.lat, location.lng),
          imageUrl,
          status: "Submitted" as const,
          createdAt: Timestamp.now(),
          riskScore: Math.floor(Math.random() * 40) + 10,
          aiNotes: "A new user-submitted grievance, pending automated analysis.",
        };
    
        const batch = writeBatch(firestore);
    
        // 3. Save grievance
        const grievancesCol = collection(firestore, "grievances");
        const newGrievanceRef = doc(grievancesCol);
        batch.set(newGrievanceRef, newGrievance);
    
        // 4. Ensure user profile doc exists and update grievanceCount
        const userRef = doc(firestore, "users", user.uid);
        if (profile) {
          batch.update(userRef, { grievanceCount: currentCount + 1 });
        } else {
          // If profile doesn't exist, create it. This is key for new users.
          batch.set(userRef, {
            name: userName,
            email: user.email,
            imageUrl: user.photoURL || `https://api.dicebear.com/8.x/bottts/svg?seed=${user.uid}`,
            grievanceCount: 1
          });
        }
    
        // 5. Commit
        await batch.commit();
    
        toast({
          title: "Grievance Submitted!",
          description: "Thank you for your report. It's now live on the map.",
        });
    
        router.push(`/map?id=${newGrievanceRef.id}`);
      } catch (error: any) {
        console.error("Grievance submission error:", error);
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: error?.message || "An unexpected error occurred.",
        });
      } finally {
        setIsSubmitting(false);
      }
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
    
    if (isUserLoading && !user) { // Only show full page loader on initial load
        return (
             <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-8 animate-fade-in">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    const isDataLoading = isUserLoading || isProfileLoading;

    return (
        <Card className="w-full max-w-2xl border-0 sm:border sm:shadow-lg animate-fade-in-up">
            <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">Submit a New Grievance</CardTitle>
                <CardDescription>
                    Fill out the form below to report a civic issue. Your current location will be attached.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
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

                        <Button type="submit" size="lg" className="w-full font-semibold" disabled={isSubmitting || !location || isDataLoading}>
                            {isSubmitting || isDataLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                            {isSubmitting ? "Submitting..." : isDataLoading ? "Loading Profile..." : "Submit Grievance"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default function SubmitPage() {
    return (
        <div className="container mx-auto px-4 py-4 sm:py-8 flex justify-center animate-fade-in">
            <SubmitPageContent />
        </div>
    );
}

    