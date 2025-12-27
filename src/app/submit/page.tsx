
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
import { useState, DragEvent } from "react";
import { Loader2, MapPin, UploadCloud, CheckCircle, AlertCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const formSchema = z.object({
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(500, { message: "Description must be 500 characters or less." }),
  phone: z.string().regex(phoneRegex, 'Invalid Number!').min(10, { message: "Must be a valid 10-digit phone number."}).max(14, { message: "Must be a valid 10-digit phone number."}),
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

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "",
            phone: "",
        },
    });

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

        setIsSubmitting(true);

        // This is a frontend-only simulation.
        // In a real app, you would send this data to your backend.
        console.log("Submitting Grievance:", {
            description: values.description,
            phone: values.phone,
            photo: values.photo[0].name,
            location,
            userName: "Demo User" // Hardcoded for demo
        });


        // Simulate a fake submission process
        setTimeout(() => {
            toast({
                title: "Grievance Submitted (Demo)",
                description: "Your report has been received and will appear on the map.",
            });
            setIsSubmitting(false);
            router.push('/map');
        }, 1500);
    }

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhotoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        form.setValue("photo", dataTransfer.files);
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
                                    <FormLabel>Describe the issue</FormLabel>
                                    <FormControl>
                                        <Textarea rows={5} placeholder="e.g., Big hole near hostel gate, bikes falling" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input type="tel" placeholder="e.g., 9876543210" className="pl-10" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Required for verification purposes as there are no accounts.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
        <div className="container mx-auto px-4 py-4 sm:py-8 flex justify-center animate-fade-in">
            <SubmitPageContent />
        </div>
    );
}
