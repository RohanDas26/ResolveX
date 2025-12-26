"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "./icons";
import { PlusCircle, MapPin, Shield } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="font-bold">ResolveX</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
             <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center"
            >
              <MapPin className="h-4 w-4 mr-1"/>
              Live Map
            </Link>
             <Link
              href="/admin"
              className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center"
            >
              <Shield className="h-4 w-4 mr-1"/>
              Admin
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <Button asChild>
              <Link href="/submit">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Grievance
              </Link>
            </Button>
        </div>
      </div>
    </header>
  );
}
