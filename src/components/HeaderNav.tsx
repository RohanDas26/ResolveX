
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "./icons";
import { PlusCircle, Map, Milestone, ShieldCheck, Ticket, Info } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MobileNav } from "./mobile-nav";

const navLinks = [
  { href: "/map", label: "Live Map", icon: Map },
  { href: "/directions", label: "Directions", icon: Milestone },
  { href: "/tickets", label: "My Tickets", icon: Ticket },
  { href: "/about", label: "About Us", icon: Info },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export default function HeaderNav() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  // Simplified header for the homepage
  if (isHomePage) {
    return (
       <div className="container flex h-16 max-w-screen-2xl items-center">
         <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Icons.logo className="h-6 w-6 text-primary" />
              <span className="font-bold sm:inline-block text-lg">ResolveX</span>
            </Link>
         </div>
      </div>
    )
  }

  // Full header for all other pages
  return (
    <div className="container flex h-16 max-w-screen-2xl items-center">
       <MobileNav mainNavItems={navLinks} />
      <div className="mr-8 flex items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Icons.logo className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block text-lg">ResolveX</span>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
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
        <Button asChild>
          <Link href="/submit">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Grievance
          </Link>
        </Button>
      </div>
    </div>
  );
}
