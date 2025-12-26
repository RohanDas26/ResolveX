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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { doc, setDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { getFunctions } from "firebase/functions";

const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

type OtpFormValues = z.infer<typeof otpSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const auth = useAuth();
  const firestore = useFirestore();
  const functions = getFunctions();

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendOtp = async (values: SignupFormValues) => {
    setIsLoading(true);
    setCooldown(60);

    try {
      const sendOtpFunction = httpsCallable(functions, 'sendSignupOtp');
      const result = await sendOtpFunction({ email: values.email });
      const data: any = result.data;
      if (data.success) {
        toast({
          title: "OTP Sent",
          description: "Check your email for the 6-digit code.",
        });
        setIsOtpSent(true);
      } else {
        throw new Error(data.error || "Failed to send OTP.");
      }
    } catch (error: any) {
      console.error("OTP sending error:", error);
      toast({
        variant: "destructive",
        title: "OTP Error",
        description: error.message || "Could not send OTP. Please try again.",
      });
      setCooldown(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpAndSignup = async (otpValues: OtpFormValues) => {
    setIsLoading(true);
    const signupValues = signupForm.getValues();

    try {
      const verifyOtpFunction = httpsCallable(functions, 'verifySignupOtp');
      const result = await verifyOtpFunction({ email: signupValues.email, code: otpValues.otp });
      const data: any = result.data;

      if (data.success) {
        // OTP is valid, now create the user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          signupValues.email,
          signupValues.password
        );
        const user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(firestore, "users", user.uid), {
          id: user.uid,
          name: signupValues.name,
          email: signupValues.email,
          imageUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=${user.uid}`,
          grievanceCount: 0,
          isAdmin: false,
        });

        toast({
          title: "Account Created!",
          description: "You have successfully signed up.",
        });
        router.push("/profile");
      } else {
        throw new Error(data.error || "Invalid or expired OTP.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      otpForm.setError("otp", { type: "manual", message: error.message || "Signup failed. Please try again." });
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {isOtpSent ? "Verify Your Email" : "Create an Account"}
          </CardTitle>
          <CardDescription>
            {isOtpSent
              ? `Enter the 6-digit code sent to ${signupForm.getValues("email")}.`
              : "Fill in the details below to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isOtpSent ? (
            <Form {...signupForm}>
              <form
                onSubmit={signupForm.handleSubmit(handleSendOtp)}
                className="space-y-6"
              >
                <FormField
                  control={signupForm.control}
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
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-semibold"
                  disabled={isLoading || cooldown > 0}
                >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isLoading
                    ? "Sending..."
                    : cooldown > 0
                    ? `Resend OTP in ${cooldown}s`
                    : "Send OTP"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form
                onSubmit={otpForm.handleSubmit(handleVerifyOtpAndSignup)}
                className="space-y-6"
              >
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>6-Digit OTP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123456"
                          maxLength={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-semibold"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isLoading ? "Verifying & Signing Up..." : "Create Account"}
                </Button>
              </form>
            </Form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isOtpSent ? (
              <Button
                variant="link"
                className="p-0"
                onClick={() => {
                  setIsOtpSent(false);
                  otpForm.reset();
                }}
              >
                Entered the wrong email? Go back.
              </Button>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline"
                >
                  Log in
                </Link>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
