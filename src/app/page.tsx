
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowRight } from "lucide-react";
import { Icons } from "@/components/icons";
import StarTrail from "@/components/star-trail";
import { useAuth } from "@/firebase";
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
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
      
      // Send verification email
      await sendEmailVerification(userCredential.user);

      toast({
        title: "Account Created!",
        description: "A verification link has been sent to your email. Please verify to continue.",
      });

      // Redirect after a short delay
      setTimeout(() => router.push("/map"), 1000);

    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message || "An unknown error occurred.",
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
      console.error(error);
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: "Invalid credentials. Please check your email and password.",
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
    <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] overflow-hidden" >
      <StarTrail />
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
        <div className="z-10 text-center animate-fade-in-up">
            <Icons.logo className="h-20 w-20 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Welcome to ResolveX</h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Your platform for reporting and tracking local civic issues. See a problem? Report it and help build a better community.
            </p>
            <Button size="lg" className="mt-8 font-semibold text-lg" onClick={() => setShowAuthForms(true)}>
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

    