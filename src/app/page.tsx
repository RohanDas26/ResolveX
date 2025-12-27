
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowRight, MapPin, Upload, BarChart2 } from "lucide-react";
import { Icons } from "@/components/icons";
import { useAuth } from "@/firebase";
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="relative p-6 overflow-hidden text-center bg-card/50 rounded-lg">
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);


export default function AuthPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showAuthForms, setShowAuthForms] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Forgot Password State
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);


  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email-signup") as string;
    const password = formData.get("password-signup") as string;
    const name = formData.get("name-signup") as string;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Also update the user's profile with their name
      await updateProfile(userCredential.user, {
          displayName: name,
          photoURL: `https://api.dicebear.com/8.x/bottts/svg?seed=${userCredential.user.uid}`
      });

      // Send verification email
      await sendEmailVerification(userCredential.user);

      toast({
        title: "Account Created!",
        description: "A verification link has been sent to your email. Please verify to continue.",
      });

      // Redirect after a short delay
      setTimeout(() => router.push("/map"), 1000);

    } catch (error: any) {
      let description = "An unknown error occurred.";
      if (error.code === 'auth/email-already-in-use') {
        description = "This email is already in use. Please sign in or use a different email.";
      } else if (error.code === 'auth/weak-password') {
        description = "The password is too weak. Please choose a stronger password.";
      } else {
        description = error.message;
      }
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: description,
      });
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email-signin") as string;
    const password = formData.get("password-signin") as string;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        toast({
          variant: "destructive",
          title: "Email Not Verified",
          description: "Please check your inbox and verify your email address before signing in.",
        });
        // Optionally, offer to resend verification
        await sendEmailVerification(userCredential.user);
        setIsLoading(false);
        return;
      }

      toast({ title: "Signed In Successfully!" });
      router.push("/map");

    } catch (error: any) {
      let description = "An unknown error occurred during sign-in.";
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-email':
          description = "No account found with this email address.";
          break;
        case 'auth/wrong-password':
          description = "Incorrect password. Please try again or use the 'Forgot password?' link.";
          break;
        case 'auth/invalid-credential':
           description = "Invalid credentials. Please check your email and password and try again.";
          break;
        default:
          description = "An unexpected error occurred. Please try again.";
          break;
      }
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: description,
      });
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter your email address." });
      return;
    }
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      toast({
        title: "Password Reset Email Sent",
        description: "If an account exists for this email, a reset link has been sent to it.",
      });
      setShowForgotPasswordDialog(false);
      setForgotPasswordEmail("");
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send password reset email. Please try again.",
      });
    } finally {
      setIsSendingReset(false);
    }
  };


  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] overflow-hidden p-4 sm:p-6 md:p-8" >
       <div
        className="pointer-events-none fixed inset-0 z-30 transition duration-300 lg:absolute"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary) / 0.05), transparent 80%)`,
        }}
      />
       <div
        className="pointer-events-none fixed inset-0 z-30 transition duration-300 lg:absolute"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x + 20}px ${mousePosition.y + 20}px, hsl(var(--accent) / 0.05), transparent 80%)`,
        }}
      />
      
      {!showAuthForms ? (
        <div className="z-10 text-center animate-fade-in-up w-full max-w-5xl mx-auto">
            <Icons.logo className="h-16 w-16 md:h-20 md:w-20 text-primary mx-auto mb-6" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Welcome to ResolveX</h1>
            <p className="mt-4 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Your platform for reporting and tracking local civic issues. See a problem? Report it and help build a better community.
            </p>
            <div className="mt-10 sm:mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              <FeatureCard 
                icon={<Upload className="w-8 h-8 md:w-10 md:h-10" />}
                title="Effortless Reporting"
                description="Quickly submit a grievance with a photo and your precise location in just a few taps."
              />
              <FeatureCard 
                icon={<MapPin className="w-8 h-8 md:w-10 md:h-10" />}
                title="Live Map Tracking"
                description="View all reported issues on a real-time, interactive map of your area to stay informed."
              />
              <FeatureCard 
                icon={<BarChart2 className="w-8 h-8 md:w-10 md:h-10" />}
                title="Community-Driven Change"
                description="See leaderboards, track resolution progress, and be a part of making your community better."
              />
            </div>
            <Button size="lg" className="mt-10 sm:mt-12 font-semibold text-base sm:text-lg" onClick={() => setShowAuthForms(true)}>
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </div>
      ) : (
        <div className="w-full max-w-sm z-10 animate-fade-in-up">
            <Tabs defaultValue="sign-in">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="sign-in">
                <Card>
                  <form onSubmit={handleSignIn}>
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4">
                        <Icons.logo className="h-12 w-12 text-primary" />
                      </div>
                      <CardTitle>Welcome Back to ResolveX</CardTitle>
                      <CardDescription>Enter your credentials to access your account.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-signin">Email</Label>
                        <Input id="email-signin" name="email-signin" type="email" placeholder="user@klh.edu.in" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-signin">Password</Label>
                        <Input id="password-signin" name="password-signin" type="password" required />
                      </div>
                       <div className="text-right">
                          <Button 
                            type="button" 
                            variant="link" 
                            className="p-0 h-auto text-xs" 
                            onClick={() => setShowForgotPasswordDialog(true)}
                          >
                            Forgot password?
                          </Button>
                        </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              <TabsContent value="sign-up">
                <Card>
                  <form onSubmit={handleSignUp}>
                    <CardHeader className="text-center">
                       <div className="mx-auto mb-4">
                        <Icons.logo className="h-12 w-12 text-primary" />
                      </div>
                      <CardTitle>Create a ResolveX Account</CardTitle>
                      <CardDescription>It's quick and easy to get started.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="space-y-2">
                        <Label htmlFor="name-signup">Full Name</Label>
                        <Input id="name-signup" name="name-signup" placeholder="Alex Doe" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-signup">Email</Label>
                        <Input id="email-signup" name="email-signup" type="email" placeholder="user@klh.edu.in" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-signup">Password</Label>
                        <Input id="password-signup" name="password-signup" type="password" required />
                      </div>
                    </CardContent>
                    <CardFooter>
                       <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
        </div>
      )}

      {/* Forgot Password Dialog */}
      <AlertDialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Forgot Password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your email address below and we'll send you a link to reset your password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="forgot-password-email">Email Address</Label>
            <Input
              id="forgot-password-email"
              type="email"
              placeholder="user@klh.edu.in"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleForgotPassword} disabled={isSendingReset}>
              {isSendingReset && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    