
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] overflow-hidden p-4 sm:p-6 md:p-8">
      <div className="z-10 text-center animate-fade-in-up w-full max-w-2xl mx-auto">
        <Icons.logo className="h-16 w-16 md:h-20 md:w-20 text-primary mx-auto mb-6" />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          404 - Page Not Found
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-10 sm:mt-12">
          <Button size="lg" className="font-semibold text-base sm:text-lg" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
