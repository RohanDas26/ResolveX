
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icons } from "@/components/icons";

export default function LandingPage() {
  return (
    <div className="relative isolate flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center animate-fade-in-up overflow-hidden">
      <div className="mx-auto max-w-2xl">
        <div className="hidden sm:mb-8 sm:flex sm:justify-center">
          <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-primary/20 hover:ring-primary/40 transition-all">
            Announcing our new Smart Route Navigator.{" "}
            <Link href="/directions" className="font-semibold text-primary">
              <span className="absolute inset-0" aria-hidden="true" />
              Read more <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
        <div className="text-center">
           <Icons.logo className="h-20 w-20 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            ResolveX
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Report and track local civic issues seamlessly. From potholes to broken streetlights, make your community better, one report at a time.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/map">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
               <Link href="/admin">View Admin Demo <span aria-hidden="true">→</span></Link>
            </Button>
          </div>
        </div>
      </div>

       {/* Background Glows */}
      <div className="absolute top-1/4 left-0 w-full h-full sm:w-1/2 sm:h-1/2 bg-primary/10 rounded-full blur-[150px] -z-10 animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute bottom-1/4 right-0 w-full h-full sm:w-1/2 sm:h-1/2 bg-accent/10 rounded-full blur-[150px] -z-10 animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
    </div>
  );
}
