"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function RegisterPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(userCredential.user, { displayName: values.name });
      await sendEmailVerification(userCredential.user);
      
      await auth.signOut();
      setIsSuccess(true);
      toast({
        title: "Registration Successful",
        description: "A verification email has been sent to your address. Please verify to login.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.code === 'auth/email-already-in-use' ? 'This email is already registered.' : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
        <div className="container flex items-center justify-center py-12">
            <Card className="w-full max-w-sm text-center">
                <CardHeader className="items-center">
                    <MailCheck className="h-12 w-12 text-primary"/>
                    <CardTitle className="text-2xl mt-4">Check your email</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">We've sent a verification link to your email address. Please click the link to activate your account.</p>
                    <Button asChild className="mt-6 w-full">
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container flex items-center justify-center py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Register</CardTitle>
          <CardDescription>
            Create an account to start reporting grievances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline text-primary hover:text-primary/80">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
