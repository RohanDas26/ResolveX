
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowRight } from "lucide-react";
import { Icons } from "@/components/icons";
import StarTrail from "@/components/star-trail";

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthForms, setShowAuthForms] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  const handleAuthAction = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network request
    setTimeout(() => {
      // On success, redirect to the main dashboard
      router.push("/map");
    }, 1000);
  };

  const maskSize = 150; // Size of the snowflake mask

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] overflow-hidden" >
      <StarTrail />
       <div
        className="pointer-events-none fixed inset-0 z-30 transition duration-300"
        style={{
          maskImage: 'var(--snowflake)',
          maskSize: `${maskSize}px ${maskSize}px`,
          maskRepeat: 'no-repeat',
          maskPosition: `${mousePosition.x - maskSize / 2}px ${mousePosition.y - maskSize / 2}px`,
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary) / 0.15), transparent 80%)`,
        }}
      />
       <div
        className="pointer-events-none fixed inset-0 z-30 transition duration-300"
        style={{
          maskImage: 'var(--snowflake)',
          maskSize: `${maskSize}px ${maskSize}px`,
          maskRepeat: 'no-repeat',
          maskPosition: `${mousePosition.x - maskSize / 2 + 20}px ${mousePosition.y - maskSize / 2 + 20}px`,
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--accent) / 0.15), transparent 80%)`,
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
                  <form onSubmit={handleAuthAction}>
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
                        <Input id="email-signin" type="email" placeholder="user@klh.edu.in" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-signin">Password</Label>
                        <Input id="password-signin" type="password" required />
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
                  <form onSubmit={handleAuthAction}>
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
                        <Input id="name-signup" placeholder="Alex Doe" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-signup">Email</Label>
                        <Input id="email-signup" type="email" placeholder="user@klh.edu.in" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-signup">Password</Label>
                        <Input id="password-signup" type="password" required />
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
    </div>
  );
}
