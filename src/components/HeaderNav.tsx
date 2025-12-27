
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "./icons";
import { PlusCircle, Map, Milestone, ShieldCheck, Ticket } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MobileNav } from "./mobile-nav";
import { useAuth } from "@/hooks/use-auth-context";
import UserNav from "./user-nav";
import { Skeleton } from "./ui/skeleton";

const navLinks = [
  { href: "/map", label: "Live Map", icon: Map, protected: false },
  { href: "/directions", label: "Directions", icon: Milestone, protected: false },
  { href: "/tickets", label: "My Tickets", icon: Ticket, protected: true },
  { href: "/admin", label: "Admin", icon: ShieldCheck, protected: true }, // Assuming admin is a protected route
];

export default function HeaderNav() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const visibleLinks = navLinks.filter(link => !link.protected || (link.protected && user));

  return (
    <div className="container flex h-16 max-w-screen-2xl items-center">
       <MobileNav mainNavItems={visibleLinks} />
      <div className="mr-8 flex items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Icons.logo className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block text-lg">ResolveX</span>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          {visibleLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              asChild
              className={cn(
                "transition-colors",
                pathname.startsWith(link.href)
                  ? "text-primary hover:text-primary"
                  : "text-foreground/60 hover:text-foreground"
              )}
            >
              <Link href={link.href}>
                <link.icon className="h-4 w-4 mr-2" />
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
      <div className="flex flex-1 items-center justify-end space-x-4">
        {isLoading ? <Skeleton className="h-10 w-24" /> : user ? (
          <>
            <Button asChild>
              <Link href="/submit">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Grievance
              </Link>
            </Button>
            <UserNav />
          </>
        ) : (
          <Button onClick={() => router.push('/auth')}>Login</Button>
        )}
      </div>
    </div>
  );
}
