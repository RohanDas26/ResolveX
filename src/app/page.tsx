
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Icons } from "@/components/icons";

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAction = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network request
    setTimeout(() => {
      // On success, redirect to the main dashboard
      router.push("/map");
    }, 1000);
  };

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-10rem)] animate-fade-in-up overflow-hidden">
      <Tabs defaultValue="sign-in" className="w-full max-w-sm z-10">
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
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-0 w-full h-full sm:w-1/2 sm:h-1/2 bg-primary/10 rounded-full blur-[150px] -z-10 animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute bottom-1/4 right-0 w-full h-full sm:w-1/2 sm:h-1/2 bg-accent/10 rounded-full blur-[150px] -z-10 animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
    </div>
  );
}
