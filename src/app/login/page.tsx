"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInAnonymously } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, User } from "lucide-react";
import { useUser } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";

function AnonymousLogin() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  async function handleAnonymousLogin() {
    setIsLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // Create a basic user profile for anonymous user if it doesn't exist
      const userProfile = {
        id: user.uid,
        email: `guest_${user.uid}@example.com`,
        firstName: "Guest",
        lastName: "User",
        registrationDate: new Date().toISOString(),
      };
      
      await setDoc(doc(firestore, "users", user.uid), userProfile, { merge: true });

      toast({
        title: "Login Successful",
        description: "Welcome!",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
      });
      setIsLoading(false);
    }
  }

  if (isUserLoading || user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-sm text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome to ResolveX</CardTitle>
        <CardDescription>
          Enter as a guest to report and view grievances.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAnonymousLogin} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <User className="mr-2 h-4 w-4" />
          )}
          Enter as Guest
        </Button>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="container flex items-center justify-center py-12">
      {isClient ? <AnonymousLogin /> : null}
    </div>
  );
}
